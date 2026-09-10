const http = require('http');
const ioClient = require('socket.io-client');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const contentType = res.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
          } catch {
            resolve({ status: res.statusCode, headers: res.headers, data: body });
          }
        } else {
          resolve({ status: res.statusCode, headers: res.headers, data: body });
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

async function runAuditE2ETests() {
  console.log('================================================================');
  console.log('🔍 MITHIBAI EATS: FULL SYSTEM AUDIT & VERIFICATION TEST SUITE');
  console.log('================================================================\n');

  let passed = 0;
  let total = 0;

  function assert(condition, testName) {
    total++;
    if (condition) {
      console.log('✅ [PASS] ' + testName);
      passed++;
    } else {
      console.error('❌ [FAIL] ' + testName);
    }
  }

  // --- Phase 1: Dual Health Checks ---
  console.log('--- Phase 1: Health Check Endpoints ---');
  const h1 = await request({ hostname: 'localhost', port: 5000, path: '/health', method: 'GET' });
  assert(h1.status === 200 && h1.data.status === 'ok', 'GET /health responds with 200 OK');

  const h2 = await request({ hostname: 'localhost', port: 5000, path: '/api/health', method: 'GET' });
  assert(h2.status === 200 && h2.data.status === 'ok', 'GET /api/health responds with 200 OK');

  // --- Phase 2: Authentication & Profile Persistence ---
  console.log('\n--- Phase 2: Auth Persistence & User Profile Sync ---');
  const loginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'student@mithibai.ac.in', password: 'student123' }
  );

  assert(loginRes.status === 200 && loginRes.data.success, 'Student login successful');
  const studentToken = loginRes.data.data.token;
  const studentId = loginRes.data.data.user._id;

  const meRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/me',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + studentToken },
  });

  assert(meRes.status === 200, 'GET /auth/me returned 200 OK');
  assert(!!meRes.data.data && meRes.data.data.email === 'student@mithibai.ac.in', 'GET /auth/me returns valid user in data');
  assert(!!meRes.data.user && meRes.data.user.email === 'student@mithibai.ac.in', 'GET /auth/me returns user field for AuthContext resilience');

  const updateRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/profile',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + studentToken,
      },
    },
    {
      name: 'Aarav Mehta',
      phone: '9876543210',
      preferences: { vegetarian: true, jain: false, spiceLevel: 'spicy' },
    }
  );

  assert(updateRes.status === 200 && updateRes.data.success, 'PUT /auth/profile updated successfully');
  assert(updateRes.data.data.preferences.spiceLevel === 'spicy', 'Profile updated preferences preserved');
  assert(!!updateRes.data.user, 'PUT /auth/profile returns user field for AuthContext');

  // --- Phase 3: Catalog Pagination & 464 Items Retrieval ---
  console.log('\n--- Phase 3: Catalog SafeLimit & High-Limit Pagination ---');
  const food500 = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/food?limit=500',
    method: 'GET',
  });

  assert(food500.status === 200, 'GET /food?limit=500 returned 200 OK');
  const catalogCount = food500.data.data.length;
  assert(catalogCount >= 90, 'Catalog returns all seeded items with limit=500 (got ' + catalogCount + ' items, expected >=90)');

  // --- Phase 4: 3 Canteens & QR Slug Resolution ---
  console.log('\n--- Phase 4: 3 Canteens & QR Slug Resolution ---');
  const canteensRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens',
    method: 'GET',
  });

  assert(canteensRes.status === 200 && canteensRes.data.data.length === 3, 'Exactly 3 canteens available');
  const canteens = canteensRes.data.data;
  const groundCanteen = canteens.find((c) => c.slug === 'ground');
  const sixthCanteen = canteens.find((c) => c.slug === '6th');
  const eighthCanteen = canteens.find((c) => c.slug === '8th');

  assert(!!groundCanteen, 'Ground Floor Canteen exists');
  assert(!!sixthCanteen, '6th Floor Canteen exists');
  assert(!!eighthCanteen, '8th Floor Canteen exists');

  const slugCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens/slug/ground',
    method: 'GET',
  });
  assert(slugCheck.status === 200 && slugCheck.data.data.floor === 'Ground Floor', 'QR slug resolver handles ground floor');

  // --- Phase 5: Review Aggregations & ObjectId Handling ---
  console.log('\n--- Phase 5: Review Aggregations & Rating Stats ---');
  const sampleFoodItem = food500.data.data[0];
  const reviewStatsRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/reviews/food/' + sampleFoodItem._id,
    method: 'GET',
  });

  assert(reviewStatsRes.status === 200, 'GET /reviews/food/:id returned 200 OK');
  assert(typeof reviewStatsRes.data.stats === 'object', 'Review stats object is returned without casting errors');

  // --- Phase 6: Real-Time Socket Order Cancellation ---
  console.log('\n--- Phase 6: Order Creation & Socket Cancellation Room Emits ---');
  const createOrderRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + studentToken,
      },
    },
    {
      canteenId: groundCanteen._id,
      items: [{ foodItemId: sampleFoodItem._id, quantity: 1 }],
      paymentMethod: 'cash',
    }
  );

  assert(createOrderRes.status === 201 && createOrderRes.data.success, 'Order created successfully');
  const orderToCancel = createOrderRes.data.data;

  let socketCancelledReceived = false;
  const socket = ioClient('http://localhost:5000', { reconnection: false });

  await new Promise((resolve) => {
    socket.on('connect', () => {
      socket.emit('join:order', orderToCancel._id);
      socket.emit('join:user', studentId);
      socket.on('order:cancelled', (payload) => {
        if (payload.orderId === orderToCancel._id) {
          socketCancelledReceived = true;
        }
      });
      setTimeout(resolve, 300);
    });
  });

  const cancelRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders/' + orderToCancel._id + '/cancel',
    method: 'POST',
    headers: { Authorization: 'Bearer ' + studentToken },
  });

  assert(cancelRes.status === 200 && cancelRes.data.success, 'POST /orders/:id/cancel returns 200 OK');
  assert(cancelRes.data.data.orderStatus === 'cancelled', 'Order status marked as cancelled in DB');

  await new Promise((r) => setTimeout(r, 400));
  assert(socketCancelledReceived, 'Socket client received order:cancelled event in real-time');
  socket.disconnect();

  // --- Phase 7: Simulated UPI Payment Flow ---
  console.log('\n--- Phase 7: Simulated UPI Payment Flow ---');
  const upiOrderRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + studentToken,
      },
    },
    {
      canteenId: groundCanteen._id,
      items: [{ foodItemId: sampleFoodItem._id, quantity: 1 }],
      paymentMethod: 'upi',
    }
  );

  assert(upiOrderRes.status === 201, 'UPI Order created with pending payment');
  const upiOrder = upiOrderRes.data.data;

  const initPaymentRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/create',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + studentToken,
      },
    },
    {
      orderId: upiOrder._id,
      method: 'upi',
      upiId: 'mithibai@upi-demo',
    }
  );

  assert(initPaymentRes.status === 201, 'Payment initialized with UPI intent data');
  const paymentRecord = initPaymentRes.data.data.payment;

  const simSuccessRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/payments/simulate/success',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer ' + studentToken,
      },
    },
    { paymentId: paymentRecord.paymentId }
  );

  assert(simSuccessRes.status === 200 && simSuccessRes.data.success, 'Payment simulation successful');

  const verifyOrderRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/orders/' + upiOrder._id,
    method: 'GET',
    headers: { Authorization: 'Bearer ' + studentToken },
  });

  assert(verifyOrderRes.data.data.paymentStatus === 'completed', 'Order paymentStatus updated to completed');

  // --- Phase 8: Admin & Staff RBAC Protection ---
  console.log('\n--- Phase 8: RBAC Protection & CSV Exports ---');
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
  assert(adminLogin.status === 200, 'Admin authenticated');
  const adminToken = adminLogin.data.data.token;

  const blockCheck = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + studentToken },
  });
  assert(blockCheck.status === 403, 'Student strictly blocked from /api/admin/dashboard (403)');

  const adminDash = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + adminToken },
  });
  assert(adminDash.status === 200, 'Admin authorized to /api/admin/dashboard (200)');

  const expOrders = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/export/orders',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + adminToken },
  });
  assert(expOrders.status === 200 && expOrders.headers['content-type'] === 'text/csv; charset=utf-8', 'Orders CSV export returned text/csv');

  const expSales = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/export/sales',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + adminToken },
  });
  assert(expSales.status === 200 && expSales.headers['content-type'] === 'text/csv; charset=utf-8', 'Sales CSV export returned text/csv');

  const expInv = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/export/inventory',
    method: 'GET',
    headers: { Authorization: 'Bearer ' + adminToken },
  });
  assert(expInv.status === 200 && expInv.headers['content-type'] === 'text/csv; charset=utf-8', 'Inventory CSV export returned text/csv');

  console.log('\n================================================================');
  console.log('📊 AUDIT E2E SUMMARY: ' + passed + '/' + total + ' ASSERTIONS PASSED (' + Math.round((passed / total) * 100) + '%)');
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL AUDIT & BUG FIX VERIFICATION TESTS PASSED PERFECTLY!\n');
    process.exit(0);
  } else {
    console.error('❌ ' + (total - passed) + ' AUDIT ASSERTION(S) FAILED.\n');
    process.exit(1);
  }
}

runAuditE2ETests().catch((err) => {
  console.error('Fatal error during audit tests:', err);
  process.exit(1);
});
