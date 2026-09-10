# 🍴 Mithibai Eats — Campus Food Ordering Web Application

> **Official Food Ordering Platform for SVKM's Mithibai College of Arts, Chauhan Institute of Science & Amrutben Jivanlal College of Commerce and Economics (Vile Parle West, Mumbai).**

A production-grade, full-stack campus pickup-only web application designed to eliminate lunch-hour queues across Mithibai's 3 distinct campus canteens.

---

## 🏢 The 3 Campus Canteens & Specialty Counters

Mithibai Eats is specifically built around the exact 3 official college dining locations:

| Canteen | Floor | Specialization & Counters | Item Count |
| :--- | :--- | :--- | :--- |
| **Ground Floor Canteen** | Ground Floor | Mumbai Street Food, Sev Puri & Chaat, Mithibai Grilled Sandwiches, Fresh Juices & Shakes, South Indian Breakfast | **164 unique dishes** |
| **6th Floor Canteen** | 6th Floor | College Thalis & Combos, Executive Lunch Meals, Biryanis, Indo-Chinese Wok, Desi Tadka Maggi, Pav Bhaji, Pizza & Pasta | **150 unique dishes** |
| **8th Floor Canteen** | 8th Floor | Mithibai Artisan Bakery, Gourmet Cafe, Kathi Rolls & Paninis, Protein Salads, **100% Pure Dedicated Jain Counter**, Specialty Cold Brews & Thick Shakes | **150 unique dishes** |

> **Total Catalog**: **464 curated, uniquely categorized dishes** with realistic Mumbai pricing (₹25 - ₹250), Jain availability flags, spice levels, preparation times, and customization options (bread choices, cheese levels, spice meters).

---

## 🚀 Key Features

### 1. Student Experience
- **Interactive Multi-Canteen Browsing**: Filter by floor, search dishes across 464 items, toggle pure Vegetarian or dedicated Jain options.
- **Dynamic Customization Engine**: Select cheese toppings, bread types (Brown/Multigrain), spice meters, and Jain preparation flags.
- **Strict Single-Canteen Ordering Guard**: Prevents cart confusion across separate physical building floors.
- **Simulated UPI QR Payment Flow**:
  - Live QR code generated with dynamic order ID and exact total.
  - **Explicitly watermarked and labeled DEMO / TEST ONLY**.
  - One-click *Simulate Successful Payment* or *Simulate Failure* buttons + 5-minute countdown.
  - Pay-at-Counter / Cash on Pickup option.
- **Live Real-Time Order Tracking**:
  - Full Socket.IO live status lifecycle: `PLACED` → `ACCEPTED` → `PREPARING` → `READY` → `COMPLETED`.
  - Visual status stepper with live animations, audio notifications, and instant pickup token display (`#MTH-XXXX`).
- **Campus AI Food Assistant**:
  - Intelligent interactive chat drawer with rule-based algorithm fallback.
  - Natural queries: *"Suggest a quick Jain snack under ₹80 on Ground Floor"*, *"High protein lunch on 8th floor"*, *"Spicy Chinese under ₹150"*.
- **Verified Student Reviews & Favorites**: Students can rate and review dishes from completed orders.

### 2. Canteen Staff Experience
- **Floor-Dedicated Kitchen Display System (KDS)**:
  - Ground Floor, 6th Floor, and 8th Floor staff see only orders destined for their respective kitchen.
  - Audio chime when a student places a new order.
  - One-click transitions: `Accept Order` ➔ `Start Preparing` ➔ `Mark Ready for Pickup` ➔ `Handover Complete`.
  - Live order timer tracking elapsed minutes against estimated preparation duration.
- **Live Inventory Manager**: Real-time stock toggle (`In Stock` / `Out of Stock`) instantly synchronizing with the student menu.

### 3. Administrator Experience
- **Real-Time KPI Dashboard**: Today's Gross Sales, Total Orders, Active Kitchen Staff, Low-Stock alerts.
- **Aggregated Analytics & Charts (Recharts)**:
  - Revenue distribution across the 3 canteens.
  - Campus peak ordering hours (11:00 AM - 02:00 PM lunch rushes).
  - Dietary breakdown (Vegetarian vs. Jain vs. Regular).
  - Top 5 bestselling Mithibai items.
- **One-Click CSV Reports**: Instant export for Orders, Sales, and Inventory data.
- **Campus Table & Standee QR Generator**: High-resolution printable QR codes for each canteen counter and dining table.
- **Student & Staff Management**: View users, moderate accounts, assign staff shifts, and manage canteen operating hours.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Framer Motion, Recharts, React Hot Toast.
- **Backend**: Node.js, Express, TypeScript, Socket.IO, Mongoose, JWT, bcryptjs, express-rate-limit, Helmet.
- **Database**: MongoDB with automatic embedded in-memory fallback (`mongodb-memory-server`) for zero-setup execution out-of-the-box.

---

## 🔑 Demo Accounts (Pre-seeded & Ready)

All demo accounts use password: **`password123`**
*(The login screen also features 1-click Quick Login chips for instant testing)*

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Student** | `student@mithibai.svkm.ac.in` | `password123` | Regular student profile |
| **Jain Student** | `jain.student@mithibai.svkm.ac.in` | `password123` | Pure Jain preference active |
| **Staff (Ground Floor)** | `staff.ground@mithibai.svkm.ac.in` | `password123` | Ground floor kitchen queue |
| **Staff (6th Floor)** | `staff.6th@mithibai.svkm.ac.in` | `password123` | 6th floor kitchen queue |
| **Staff (8th Floor)** | `staff.8th@mithibai.svkm.ac.in` | `password123` | 8th floor kitchen queue |
| **Admin** | `admin@mithibai.svkm.ac.in` | `password123` | Full administrative access |

---

## 💻 Running the Application

### 1. Start the Backend Server
```bash
cd server
npm run dev
# or npm run build && npm run start
```
*The server runs at `http://localhost:5000` with automatic MongoDB connection.*

To re-seed the full 464-item database anytime:
```bash
npm run seed
```

### 2. Start the Frontend Client
```bash
cd client
npm run dev
```
*The Vite application runs at `http://localhost:5173`.*

---

## 🧪 Recommended Verification Test Flows

1. **Student Flow**:
   - Open `http://localhost:5173`, click **Demo Student** quick-login.
   - Choose **Ground Floor Canteen**, filter by *Chaat* or *Sandwiches*.
   - Click a dish (e.g. *Mithibai Special Cheese Grilled Sandwich*), select **Brown Bread** and **Extra Amul Cheese**, click **Add to Cart**.
   - Open Cart ➔ Proceed to Checkout ➔ Select **Simulated UPI** ➔ Click **Simulate Success**.
   - Watch live order transition to `PLACED` with token number `#MTH-XXXX`.
2. **Staff Flow**:
   - In a second tab/window, click **Staff (Ground)** quick-login.
   - You will see the student's order appear in real time in the Kitchen Queue.
   - Click **Accept Order** ➔ **Start Preparing** ➔ **Mark Ready for Pickup**.
   - Notice the student tab instantly transitions its stepper to **Ready** via Socket.IO without page refresh!
3. **Admin Flow**:
   - Log in as **Admin** (`admin@mithibai.svkm.ac.in`).
   - Check the Analytics charts (Floor Revenue, Peak Rush Hours).
   - Click **Download Orders CSV** to get full tabular order data.
   - Navigate to **QR Codes** to print/download the official counter standees.
