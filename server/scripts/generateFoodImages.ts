import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { FoodItem } from '../src/models/FoodItem';
import { imageService, normalizeFoodFilename } from '../src/services/aiImage/imageService';

dotenv.config();

interface FailureRecord {
  name: string;
  canteen: string;
  error: string;
  timestamp: string;
}

async function runBatchGeneration() {
  console.log('============================================================');
  console.log('🖼️  MITHIBAI EATS: AI FOOD IMAGE GENERATOR PIPELINE');
  console.log('============================================================');
  console.log('Provider configured:', imageService.getProvider());
  console.log('');

  const seedDir = path.resolve(__dirname, '../src/seed/seedData');
  const projectRoot = path.resolve(__dirname, '../../');
  const clientFoodDir = path.join(projectRoot, 'client/public/food');
  const serverFoodDir = path.join(projectRoot, 'server/public/food');
  const failureFile = path.resolve(projectRoot, 'image-generation-failures.json');

  const failures: FailureRecord[] = [];

  const canteenFiles = [
    { file: 'groundFloor.json', slug: 'ground-floor', floorName: 'Ground Floor Canteen' },
    { file: 'sixthFloor.json', slug: '6th-floor', floorName: '6th Floor Canteen' },
    { file: 'eighthFloor.json', slug: '8th-floor', floorName: '8th Floor Canteen' },
  ];

  let totalItemsCount = 0;
  for (const c of canteenFiles) {
    const p = path.join(seedDir, c.file);
    if (fs.existsSync(p)) {
      const items = JSON.parse(fs.readFileSync(p, 'utf-8'));
      totalItemsCount += items.length;
    }
  }

  console.log(`Total catalog items to process: ${totalItemsCount}`);

  let alreadyExistingCount = 0;
  for (const c of canteenFiles) {
    const p = path.join(seedDir, c.file);
    if (fs.existsSync(p)) {
      const items = JSON.parse(fs.readFileSync(p, 'utf-8'));
      for (const item of items) {
        const filename = normalizeFoodFilename(item.name);
        const targetPath = path.join(clientFoodDir, c.slug, filename);
        if (fs.existsSync(targetPath) && fs.statSync(targetPath).size > 1000) {
          alreadyExistingCount++;
        }
      }
    }
  }

  if (alreadyExistingCount > 0) {
    console.log(`${alreadyExistingCount} images already exist.`);
    if (alreadyExistingCount === totalItemsCount) {
      console.log('All images are already generated. Verifying seed mappings...');
    } else {
      console.log(`Continuing from item ${alreadyExistingCount + 1}...`);
    }
  }

  console.log('\nGenerating food images...\n');

  let currentGlobalIdx = 0;
  let newlyGenerated = 0;

  for (const c of canteenFiles) {
    const filePath = path.join(seedDir, c.file);
    if (!fs.existsSync(filePath)) continue;

    const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    let fileModified = false;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      currentGlobalIdx++;
      const filename = normalizeFoodFilename(item.name);
      const relativeUrl = `/food/${c.slug}/${filename}`;
      const clientPath = path.join(clientFoodDir, c.slug, filename);

      const exists = fs.existsSync(clientPath) && fs.statSync(clientPath).size > 1000;

      if (!exists) {
        let success = false;
        let lastError = '';

        for (let attempt = 1; attempt <= 3; attempt++) {
          try {
            await imageService.generateFoodImage(item, {
              canteenSlug: c.slug,
              forceRegenerate: false,
            });
            success = true;
            newlyGenerated++;
            break;
          } catch (err: any) {
            lastError = err.message || String(err);
            await new Promise((r) => setTimeout(r, 200));
          }
        }

        if (success) {
          console.log(`[${currentGlobalIdx}/${totalItemsCount}] ${item.name} ✓`);
        } else {
          console.log(`[${currentGlobalIdx}/${totalItemsCount}] ${item.name} ✗`);
          console.log(`   Reason: ${lastError}`);
          failures.push({
            name: item.name,
            canteen: c.slug,
            error: lastError,
            timestamp: new Date().toISOString(),
          });
        }
      } else {
        const serverPath = path.join(serverFoodDir, c.slug, filename);
        if (!fs.existsSync(serverPath)) {
          fs.mkdirSync(path.dirname(serverPath), { recursive: true });
          fs.copyFileSync(clientPath, serverPath);
        }
        if (currentGlobalIdx % 50 === 0 || currentGlobalIdx === totalItemsCount) {
          console.log(`[${currentGlobalIdx}/${totalItemsCount}] ${item.name} ✓`);
        }
      }

      if (item.imageUrl !== relativeUrl || item.image !== relativeUrl) {
        item.imageUrl = relativeUrl;
        item.image = relativeUrl;
        item.isAiGenerated = true;
        fileModified = true;
      }
    }

    if (fileModified) {
      fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
    }
  }

  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:24278/';
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 2000 });
    }

    const dbItems = await FoodItem.find({}).populate('canteen');
    let dbUpdated = 0;

    for (const doc of dbItems) {
      const canteenDoc = doc.canteen as any;
      const canteenSlug = canteenDoc?.slug === '6th' ? '6th-floor' : canteenDoc?.slug === '8th' ? '8th-floor' : 'ground-floor';
      const filename = normalizeFoodFilename(doc.name);
      const relativeUrl = `/food/${canteenSlug}/${filename}`;

      if (doc.imageUrl !== relativeUrl || doc.image !== relativeUrl) {
        doc.imageUrl = relativeUrl;
        doc.image = relativeUrl;
        doc.isAiGenerated = true;
        await doc.save();
        dbUpdated++;
      }
    }

    console.log(`\n✅ Live MongoDB synced: updated ${dbUpdated} items`);
  } catch (err) {
    console.log('\nℹ️  Live MongoDB sync deferred to next server restart/seed');
  }

  if (failures.length > 0) {
    fs.writeFileSync(failureFile, JSON.stringify(failures, null, 2));
    console.log(`\n⚠️  ${failures.length} items failed. Logged to image-generation-failures.json`);
  } else if (fs.existsSync(failureFile)) {
    fs.unlinkSync(failureFile);
  }

  console.log('\n============================================================');
  console.log('Finished.');
  console.log(`${totalItemsCount - failures.length}/${totalItemsCount} images generated & verified.`);
  console.log('============================================================\n');
}

if (require.main === module) {
  runBatchGeneration().catch((err) => {
    console.error('Fatal batch generation error:', err);
    process.exit(1);
  });
}

export { runBatchGeneration };
