import path from 'path';
import fs from 'fs';
import { normalizeFoodFilename } from '../src/services/aiImage/imageService';

interface ValidationReport {
  totalItems: number;
  generated: number;
  failed: number;
  missing: number;
  validWebP: number;
  sampleVerified: Array<{
    name: string;
    canteen: string;
    imageUrl: string;
    fileSize: number;
    exists: boolean;
  }>;
  timestamp: string;
}

function isValidWebP(filePath: string): boolean {
  try {
    const buffer = Buffer.alloc(12);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 12, 0);
    fs.closeSync(fd);

    const isRiff = buffer.toString('ascii', 0, 4) === 'RIFF';
    const isWebp = buffer.toString('ascii', 8, 12) === 'WEBP';
    return isRiff && isWebp;
  } catch (err) {
    return false;
  }
}

async function runValidation() {
  console.log('============================================================');
  console.log('🔍 MITHIBAI EATS: FOOD IMAGE VALIDATION REPORT');
  console.log('============================================================\n');

  const seedDir = path.resolve(__dirname, '../src/seed/seedData');
  const projectRoot = path.resolve(__dirname, '../../');
  const clientFoodDir = path.join(projectRoot, 'client/public/food');
  const serverFoodDir = path.join(projectRoot, 'server/public/food');
  const reportPath = path.resolve(projectRoot, 'image-generation-report.json');

  const canteenFiles = [
    { file: 'groundFloor.json', slug: 'ground-floor' },
    { file: 'sixthFloor.json', slug: '6th-floor' },
    { file: 'eighthFloor.json', slug: '8th-floor' },
  ];

  let totalItems = 0;
  let generated = 0;
  let missing = 0;
  let failed = 0;
  let validWebP = 0;
  const sampleVerified: ValidationReport['sampleVerified'] = [];

  for (const c of canteenFiles) {
    const filePath = path.join(seedDir, c.file);
    if (!fs.existsSync(filePath)) continue;

    const items = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Validating ${c.slug}: ${items.length} items...`);

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      totalItems++;

      const filename = normalizeFoodFilename(item.name);
      const clientPath = path.join(clientFoodDir, c.slug, filename);
      const serverPath = path.join(serverFoodDir, c.slug, filename);

      const clientExists = fs.existsSync(clientPath) && fs.statSync(clientPath).size > 500;
      const serverExists = fs.existsSync(serverPath) && fs.statSync(serverPath).size > 500;

      if (clientExists && serverExists) {
        generated++;
        if (isValidWebP(clientPath)) {
          validWebP++;
        } else {
          failed++;
        }
      } else {
        missing++;
      }

      if (i < 5) {
        sampleVerified.push({
          name: item.name,
          canteen: c.slug,
          imageUrl: item.imageUrl || `/food/${c.slug}/${filename}`,
          fileSize: clientExists ? fs.statSync(clientPath).size : 0,
          exists: clientExists && serverExists,
        });
      }
    }
  }

  const report: ValidationReport = {
    totalItems,
    generated,
    failed,
    missing,
    validWebP,
    sampleVerified,
    timestamp: new Date().toISOString(),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n============================================================');
  console.log(`Total Items Checked: ${totalItems}`);
  console.log(`Successfully Generated & Linked: ${generated}/${totalItems}`);
  console.log(`Valid WebP Format: ${validWebP}/${totalItems}`);
  console.log(`Missing: ${missing}`);
  console.log(`Corrupted/Failed: ${failed}`);
  console.log(`Report saved to: ${reportPath}`);
  console.log('============================================================\n');

  if (missing > 0 || failed > 0) {
    process.exit(1);
  }
}

if (require.main === module) {
  runValidation().catch((err) => {
    console.error('Validation script error:', err);
    process.exit(1);
  });
}

export { runValidation };
