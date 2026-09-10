import mongoose from 'mongoose';
import connectDB from '../config/database';
import { config } from '../config/env';
import { User } from '../models/User';
import { Canteen } from '../models/Canteen';
import { Category } from '../models/Category';
import { FoodItem } from '../models/FoodItem';
import { QRCode as QRCodeModel } from '../models/QRCode';
import { Order } from '../models/Order';
import { Review } from '../models/Review';
import { Notification } from '../models/Notification';
import { Favorite } from '../models/Favorite';
import { Payment } from '../models/Payment';
import { categoriesData } from './categoriesData';
import { generateQRCodeBase64, buildCanteenQRUrl } from '../utils/qrGenerator';
import { generateOrderNumber, generatePaymentId, generateTransactionRef } from '../utils/orderIdGenerator';

import groundFloorData from './seedData/groundFloor.json';
import sixthFloorData from './seedData/sixthFloor.json';
import eighthFloorData from './seedData/eighthFloor.json';

export const seedDatabase = async () => {
  console.log('🌱 Starting Mithibai Eats database seeding...');

  try {
    // Clear all existing collections
    await User.deleteMany({});
    await Canteen.deleteMany({});
    await Category.deleteMany({});
    await FoodItem.deleteMany({});
    await QRCodeModel.deleteMany({});
    await Order.deleteMany({});
    await Review.deleteMany({});
    await Notification.deleteMany({});
    await Favorite.deleteMany({});
    await Payment.deleteMany({});

    console.log('🧹 Cleaned existing database collections');

    // 1. Seed Categories
    const categories = await Category.insertMany(categoriesData);
    const categoryMap = new Map<string, mongoose.Types.ObjectId>();
    categories.forEach((cat) => categoryMap.set(cat.slug, cat._id as mongoose.Types.ObjectId));
    console.log(`✅ Seeded ${categories.length} categories`);

    // 2. Seed Canteens
    const canteens = await Canteen.insertMany([
      {
        name: 'Ground Floor Canteen',
        floor: 'Ground Floor',
        description: 'Vibrant quick-service canteen specializing in street food, chaat counter, sandwiches, rolls, south Indian breakfast, and fresh fruit juices.',
        image: '/images/food/canteen-ground.svg',
        openingTime: '08:00',
        closingTime: '20:00',
        isOpen: true,
        avgPrepTime: 8,
        location: 'Ground Floor, North Wing, Main Campus',
        contactNumber: '+91 22 4233 9001',
        totalItems: groundFloorData.length,
        slug: 'ground',
      },
      {
        name: '6th Floor Canteen',
        floor: '6th Floor',
        description: 'Full-service hot kitchen serving hearty North Indian thalis, rich biryanis, wok-tossed Indo-Chinese, Maggi specials, pizzas, and burger combos.',
        image: '/images/food/canteen-sixth.svg',
        openingTime: '08:30',
        closingTime: '20:30',
        isOpen: true,
        avgPrepTime: 12,
        location: '6th Floor, Central Building, Near Library',
        contactNumber: '+91 22 4233 9006',
        totalItems: sixthFloorData.length,
        slug: '6th',
      },
      {
        name: '8th Floor Canteen',
        floor: '8th Floor',
        description: 'Premium rooftop cafe & bakery offering artisanal coffees, gourmet paninis, wraps, fresh smoothie bowls, dedicated pure Jain counter, and decadent desserts.',
        image: '/images/food/canteen-eighth.svg',
        openingTime: '09:00',
        closingTime: '21:00',
        isOpen: true,
        avgPrepTime: 10,
        location: '8th Floor, Terrace Deck, Management Wing',
        contactNumber: '+91 22 4233 9008',
        totalItems: eighthFloorData.length,
        slug: '8th',
      },
    ]);

    const groundCanteen = canteens.find((c) => c.slug === 'ground')!;
    const sixthCanteen = canteens.find((c) => c.slug === '6th')!;
    const eighthCanteen = canteens.find((c) => c.slug === '8th')!;

    console.log('✅ Seeded 3 canteens (Ground Floor, 6th Floor, 8th Floor)');

    // 3. Seed Users
    const adminUser = await User.create({
      name: 'Mithibai Admin',
      email: 'admin@mithibai.ac.in',
      password: 'admin123',
      role: 'admin',
      phone: '+91 98200 11223',
    });

    const studentUser = await User.create({
      name: 'Aarav Mehta',
      email: 'student@mithibai.ac.in',
      password: 'student123',
      role: 'student',
      phone: '+91 98199 55667',
      preferences: { vegetarian: true, jain: false, spiceLevel: 'medium' },
      favoriteCanteen: groundCanteen._id,
    });

    const jainStudent = await User.create({
      name: 'Priya Shah',
      email: 'priya.jain@mithibai.ac.in',
      password: 'student123',
      role: 'student',
      phone: '+91 98199 88990',
      preferences: { vegetarian: true, jain: true, spiceLevel: 'mild' },
      favoriteCanteen: eighthCanteen._id,
    });

    console.log('✅ Seeded Admin and 2 Demo Students');

    // 4. Seed Food Items
    const mapFoodItems = (rawItems: any[], canteenId: mongoose.Types.ObjectId) => {
      return rawItems.map((item) => {
        const catId = categoryMap.get(item.categorySlug) || categoryMap.get('fast-food')!;
        return {
          name: item.name,
          description: item.description,
          price: item.price,
          category: catId,
          canteen: canteenId,
          image: item.imageUrl || item.image,
          imageUrl: item.imageUrl || item.image,
          isAiGenerated: true,
          vegetarian: item.vegetarian !== false,
          jainAvailable: !!item.jainAvailable,
          spicyLevel: item.spicyLevel || 'mild',
          preparationTime: item.preparationTime || 10,
          stock: item.stock || 50,
          available: true,
          rating: item.rating || 4.2,
          totalReviews: Math.floor(Math.random() * 25) + 5,
          popularityScore: item.popularityScore || 30,
          tags: item.tags || [],
          customizations: item.customizations || [],
          isActive: true,
        };
      });
    };

    const gfItems = mapFoodItems(groundFloorData, groundCanteen._id as mongoose.Types.ObjectId);
    const sixthItems = mapFoodItems(sixthFloorData, sixthCanteen._id as mongoose.Types.ObjectId);
    const eighthItems = mapFoodItems(eighthFloorData, eighthCanteen._id as mongoose.Types.ObjectId);

    const insertedGF = await FoodItem.insertMany(gfItems);
    const inserted6F = await FoodItem.insertMany(sixthItems);
    const inserted8F = await FoodItem.insertMany(eighthItems);

    console.log(`✅ Seeded ${insertedGF.length} items for Ground Floor`);
    console.log(`✅ Seeded ${inserted6F.length} items for 6th Floor`);
    console.log(`✅ Seeded ${inserted8F.length} items for 8th Floor`);
    console.log(`🎉 Total Unique Menu Items Seeded: ${insertedGF.length + inserted6F.length + inserted8F.length}`);

    // Update canteens with exact item counts
    await Canteen.findByIdAndUpdate(groundCanteen._id, { totalItems: insertedGF.length });
    await Canteen.findByIdAndUpdate(sixthCanteen._id, { totalItems: inserted6F.length });
    await Canteen.findByIdAndUpdate(eighthCanteen._id, { totalItems: inserted8F.length });

    // 6. Generate QR Codes
    for (const canteen of canteens) {
      const targetUrl = buildCanteenQRUrl(config.clientUrl, canteen.slug);
      const qrDataUrl = await generateQRCodeBase64(targetUrl);
      await QRCodeModel.create({
        canteen: canteen._id,
        label: `${canteen.name} - Official Menu QR`,
        type: 'canteen',
        url: targetUrl,
        qrImageData: qrDataUrl,
        active: true,
        scanCount: Math.floor(Math.random() * 200) + 50,
      });
    }
    console.log('✅ Generated official menu QR codes for all 3 canteens');

    // 7. Seed Sample Orders (for analytics and history)
    const sampleItems = [insertedGF[0], insertedGF[1], insertedGF[20]];
    const sampleOrderItems = sampleItems.map((item, idx) => ({
      foodItem: item._id,
      name: item.name,
      price: item.price,
      quantity: idx === 0 ? 2 : 1,
      customizations: new Map([['Spice Level', 'Regular']]),
      subtotal: item.price * (idx === 0 ? 2 : 1),
    }));

    const subtotal = sampleOrderItems.reduce((acc, curr) => acc + curr.subtotal, 0);
    const total = subtotal + config.platformFee + config.packagingFee;

    const sampleCompletedOrder = await Order.create({
      orderNumber: generateOrderNumber(),
      pickupToken: 'GF-101',
      user: studentUser._id,
      canteen: groundCanteen._id,
      items: sampleOrderItems,
      subtotal,
      platformFee: config.platformFee,
      packagingFee: config.packagingFee,
      total,
      orderStatus: 'completed',
      paymentMethod: 'upi',
      paymentStatus: 'completed',
      acceptedAt: new Date(Date.now() - 3600000),
      preparingAt: new Date(Date.now() - 3000000),
      readyAt: new Date(Date.now() - 1800000),
      completedAt: new Date(Date.now() - 1200000),
      createdAt: new Date(Date.now() - 3600000),
    });

    await Payment.create({
      paymentId: generatePaymentId(),
      order: sampleCompletedOrder._id,
      user: studentUser._id,
      method: 'upi',
      amount: total,
      status: 'success',
      transactionReference: generateTransactionRef(),
      upiId: 'aarav@okaxis',
      simulatedAt: new Date(Date.now() - 3500000),
    });

    // Sample Active Order
    const activeItem = inserted6F[0]; // Paneer Butter Masala
    const activeOrder = await Order.create({
      orderNumber: generateOrderNumber(),
      pickupToken: '6F-102',
      user: studentUser._id,
      canteen: sixthCanteen._id,
      items: [
        {
          foodItem: activeItem._id,
          name: activeItem.name,
          price: activeItem.price,
          quantity: 1,
          customizations: new Map([['Bread/Rice Choice', 'With 2 Butter Rotis']]),
          subtotal: activeItem.price,
        },
      ],
      subtotal: activeItem.price,
      platformFee: config.platformFee,
      packagingFee: config.packagingFee,
      total: activeItem.price + config.platformFee + config.packagingFee,
      orderStatus: 'preparing',
      paymentMethod: 'cash',
      paymentStatus: 'pending',
      acceptedAt: new Date(Date.now() - 600000),
      preparingAt: new Date(Date.now() - 300000),
      estimatedTime: 12,
    });

    // Update user stats
    await User.findByIdAndUpdate(studentUser._id, {
      totalOrders: 2,
      totalSpent: total,
    });

    // Seed Reviews
    await Review.create({
      user: studentUser._id,
      foodItem: insertedGF[0]._id,
      order: sampleCompletedOrder._id,
      rating: 5,
      comment: 'Best Kanda Poha in Vile Parle! Fresh peanuts and perfect lemon balance.',
      approved: true,
    });

    // Seed Favorites
    await Favorite.create({
      user: studentUser._id,
      foodItem: insertedGF[0]._id,
    });
    await Favorite.create({
      user: studentUser._id,
      foodItem: inserted6F[0]._id,
    });

    console.log('✅ Seeded sample orders, payment, review, and favorites');
    console.log('🚀 Mithibai Eats database successfully seeded!');
    return true;
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

if (require.main === module) {
  connectDB().then(async () => {
    await seedDatabase();
    process.exit(0);
  });
}
