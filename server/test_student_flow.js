const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runStudentFlowTests() {
  console.log('================================================================');
  console.log('🍔 MITHIBAI EATS: COMPLETE STUDENT ORDERING FLOW TEST');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${testName}`);
    }
  }

  // 1. Authenticate Student (Register fresh student for clean test state)
  const studentEmail = `student.run.${Date.now()}@mithibai.ac.in`;
  console.log(`--- Step 1: Student Registration & Login (${studentEmail}) ---`);
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Pooja Bhatt',
      email: studentEmail,
      password: 'password123',
      phone: '+91 98111 22334',
      preferences: { vegetarian: true, jain: false, spiceLevel: 'medium' },
    }
  );
  assert(regRes.status === 201, 'Student registered successfully (201 Created)');
  const studentToken = regRes.data?.data?.token;
  const studentUser = regRes.data?.data?.user;
  assert(studentToken !== undefined, `JWT token received for ${studentUser.name}`);

  // 2. Canteen Selection
  console.log('\n--- Step 2: Canteen Selection (Ground Floor) ---');
  const canteensRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens',
    method: 'GET',
  });
  assert(canteensRes.status === 200, 'Fetched canteens list');
  const groundCanteen = canteensRes.data?.data?.find((c) => c.slug === 'ground');
  assert(groundCanteen !== undefined, `Ground Floor Canteen found (${groundCanteen.floor})`);

  // 3. Browse & Filter Menu
  console.log('\n--- Step 3: Menu Search & Filter (Ground Floor Sandwiches) ---');
  const menuRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteen=${groundCanteen._id}&vegetarian=true&search=sandwich&limit=50`,
    method: 'GET',
  });
  assert(menuRes.status === 200, 'Filtered menu items retrieved');
  const items = menuRes.data?.data || [];
  assert(items.length > 0, `Found ${items.length} vegetarian sandwiches in Ground Floor Canteen`);
  const chosenDish = items[0];
  console.log(`   Selected Dish: "${chosenDish.name}" (₹${chosenDish.price})`);

  // 4. Food Details View
  console.log('\n--- Step 4: Food Details & Customization Inspection ---');
  const foodDetailRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food/${chosenDish._id}`,
    method: 'GET',
  });
  assert(foodDetailRes.status === 200, 'Food details endpoint responded 200 OK');
  assert(foodDetailRes.data?.data?.name === chosenDish.name, 'Dish name and attributes verified');
  const customizations = foodDetailRes.data?.data?.customizations || [];
  console.log(`   Available Customizations: ${customizations.map((c) => c.name).join(', ') || 'Standard'}`);

  // 5. Toggle Favorite
  console.log('\n--- Step 5: Toggle Favorite Dish ---');
  const favToggleRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/favorites/toggle',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    { foodItemId: chosenDish._id }
  );
  assert(favToggleRes.status === 200 || favToggleRes.status === 201, 'Toggled favorite dish');

  const favListRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/favorites',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(favListRes.status === 200, 'Retrieved favorites list');
  const isFav = favListRes.data?.data?.some((f) => f.foodItem?._id === chosenDish._id || f.foodItem === chosenDish._id);
  assert(isFav === true, 'Chosen dish is confirmed in student favorites');

  // 6. Checkout & Order Creation
  console.log('\n--- Step 6: Checkout & Order Creation ---');
  const orderPayload = {
    canteenId: groundCanteen._id,
    items: [
      {
        foodItemId: chosenDish._id,
        quantity: 2,
        customizations: { 'Bread Type': 'Brown Bread', 'Extra Cheese': 'Yes' },
      },
    ],
    paymentMethod: 'upi',
    specialInstructions: 'Please pack in eco-friendly container with extra green chutney',
  };

  const orderRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    orderPayload
  );

  assert(orderRes.status === 201, 'Order created successfully (201 Created)');
  const order = orderRes.data?.data;
  assert(order?.orderNumber !== undefined, `Order Number generated: ${order.orderNumber}`);
  assert(order?.pickupToken !== undefined, `Pickup Token generated: ${order.pickupToken}`);
  assert(order?.orderStatus === 'placed', 'Initial order status is "placed"');

  // 7. Order Tracking View
  console.log('\n--- Step 7: Live Order Tracking Endpoint ---');
  const trackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/${order._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(trackRes.status === 200, 'Order tracking query returned 200 OK');
  assert(trackRes.data?.data?.pickupToken === order.pickupToken, 'Order tracking returns matching pickup token');

  // 8. Order History Verification
  console.log('\n--- Step 8: Order History Verification ---');
  const historyRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(historyRes.status === 200, 'Fetched student order history');
  const orderInHistory = historyRes.data?.data?.some((o) => o._id === order._id);
  assert(orderInHistory === true, 'Newly placed order appears in student order history');

  // 9. Admin Kitchen Control Lifecycle Transition (Accepted -> Preparing -> Ready -> Completed)
  console.log('\n--- Step 9: Kitchen / Admin Lifecycle Transitions ---');
  const adminLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@mithibai.ac.in', password: 'admin123' }
  );
  const adminToken = adminLogin.data?.data?.token;

  async function advanceStatus(newStatus) {
    return request(
      {
        hostname: 'localhost',
        port: 5000,
        path: `/api/orders/${order._id}/status`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
      },
      { status: newStatus }
    );
  }

  const s1 = await advanceStatus('accepted');
  assert(s1.status === 200 && s1.data?.data?.orderStatus === 'accepted', 'Kitchen accepted order');

  const s2 = await advanceStatus('preparing');
  assert(s2.status === 200 && s2.data?.data?.orderStatus === 'preparing', 'Kitchen preparing order');

  const s3 = await advanceStatus('ready');
  assert(s3.status === 200 && s3.data?.data?.orderStatus === 'ready', 'Kitchen marked ready for pickup');

  const s4 = await advanceStatus('completed');
  assert(s4.status === 200 && s4.data?.data?.orderStatus === 'completed', 'Order marked completed');

  // 10. Student Review Submission for Completed Order
  console.log('\n--- Step 10: Student Review Submission ---');
  const reviewRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/reviews',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${studentToken}`,
      },
    },
    {
      foodItemId: chosenDish._id,
      orderId: order._id,
      rating: 5,
      comment: 'Super crisp grilled sandwich! Amul cheese was melted to perfection. 10/10!',
    }
  );

  assert(reviewRes.status === 201, 'Student review submitted successfully (201 Created)');

  // 11. Verify Reviews on Dish
  console.log('\n--- Step 11: Food Item Reviews & Rating Recalculation ---');
  const reviewsOnDish = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/reviews/food/${chosenDish._id}`,
    method: 'GET',
  });
  assert(reviewsOnDish.status === 200, 'Fetched reviews on food item');
  const hasReview = reviewsOnDish.data?.data?.some((r) => r.comment?.includes('Super crisp'));
  assert(hasReview === true, 'Newly posted review appears on the food item page');

  console.log('\n================================================================');
  console.log(`📊 STUDENT FLOW TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 COMPLETE STUDENT ORDERING FLOW IS FULLY CONNECTED & VERIFIED!');
  } else {
    process.exit(1);
  }
}

runStudentFlowTests().catch((err) => {
  console.error('Fatal student flow test error:', err);
  process.exit(1);
});
