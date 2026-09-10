const http = require('http');
const { io } = require('socket.io-client');

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

function waitForEvent(socket, eventName, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(eventName, handler);
      reject(new Error(`Timeout waiting for event "${eventName}" after ${timeoutMs}ms`));
    }, timeoutMs);

    function handler(data) {
      clearTimeout(timer);
      socket.off(eventName, handler);
      resolve(data);
    }

    socket.on(eventName, handler);
  });
}

async function runQRPaymentTests() {
  console.log('================================================================');
  console.log('📱 MITHIBAI EATS: QR ORDERING & SIMULATED UPI PAYMENT TEST SUITE');
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

  try {
    // -------------------------------------------------------------------------
    // 1. AUTHENTICATE USERS (ADMIN, STUDENT 1, STUDENT 2)
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Authentication for Roles ---');

    // Admin
    const adminLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@mithibai.ac.in', password: 'admin123' }
    );
    assert(adminLogin.status === 200 && adminLogin.data.data.token, 'Admin login successful');
    const adminToken = adminLogin.data.data.token;

    // Student 1 (Aarav)
    const student1Login = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'student@mithibai.ac.in', password: 'student123' }
    );
    assert(student1Login.status === 200 && student1Login.data.data.token, 'Student 1 (Aarav) login successful');
    const student1Token = student1Login.data.data.token;
    const student1Id = student1Login.data.data.user._id;

    // Student 2 (Priya)
    const student2Login = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'priya.jain@mithibai.ac.in', password: 'student123' }
    );
    assert(student2Login.status === 200 && student2Login.data.data.token, 'Student 2 (Priya) login successful');
    const student2Token = student2Login.data.data.token;

    // -------------------------------------------------------------------------
    // 2. QR CODE RETRIEVAL & INSPECTION
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Canteen QR Code Generation & Retrieval ---');

    const getQRs = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/qr',
      method: 'GET',
    });
    assert(getQRs.status === 200 && Array.isArray(getQRs.data.data), 'GET /api/qr returns list of QR codes');
    assert(getQRs.data.data.length >= 3, `Found ${getQRs.data.data.length} QR codes in system (at least 3 canteens)`);

    const qrList = getQRs.data.data;
    const groundQR = qrList.find((q) => q.canteen && (q.canteen.slug === 'ground' || q.label.toLowerCase().includes('ground')));
    const sixthQR = qrList.find((q) => q.canteen && (q.canteen.slug === '6th' || q.label.toLowerCase().includes('6th')));
    const eighthQR = qrList.find((q) => q.canteen && (q.canteen.slug === '8th' || q.label.toLowerCase().includes('8th')));

    assert(Boolean(groundQR), 'Ground Floor Canteen QR exists');
    assert(Boolean(sixthQR), '6th Floor Canteen QR exists');
    assert(Boolean(eighthQR), '8th Floor Canteen QR exists');

    assert(groundQR.url.includes('/order?canteen=ground'), `Ground QR points to slug URL: ${groundQR.url}`);
    assert(groundQR.qrImageData && groundQR.qrImageData.startsWith('data:image/png;base64,'), 'Ground QR has valid base64 PNG data');

    // Test Admin QR regeneration endpoint
    const studentRegen = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/qr/generate-canteens',
      method: 'POST',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(studentRegen.status === 403, 'Student is forbidden from regenerating QR codes (403)');

    const adminRegen = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/qr/generate-canteens',
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(adminRegen.status === 200 && adminRegen.data.data.length === 3, 'Admin can regenerate official QR codes for all 3 canteens');

    // Test QR Scan counter increment
    const scanTarget = adminRegen.data.data[0];
    const initialScans = scanTarget.scanCount || 0;
    const scanRecord = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/qr/${scanTarget._id}/scan`,
      method: 'POST',
    });
    assert(scanRecord.status === 200 && scanRecord.data.data.scanCount === initialScans + 1, `Scan record incremented scanCount from ${initialScans} to ${scanRecord.data.data.scanCount}`);

    // -------------------------------------------------------------------------
    // 3. QR LINK SLUG RESOLUTION
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: QR Scanned Slug Resolution ---');

    const resolveGround = await request({ hostname: 'localhost', port: 5000, path: '/api/canteens/slug/ground', method: 'GET' });
    assert(resolveGround.status === 200 && resolveGround.data.data.slug === 'ground', 'Slug "ground" resolves to Ground Floor Canteen');
    const groundCanteenId = resolveGround.data.data._id;

    const resolve6th = await request({ hostname: 'localhost', port: 5000, path: '/api/canteens/slug/6th', method: 'GET' });
    assert(resolve6th.status === 200 && resolve6th.data.data.slug === '6th', 'Slug "6th" resolves to 6th Floor Canteen');

    const resolve8th = await request({ hostname: 'localhost', port: 5000, path: '/api/canteens/slug/8th', method: 'GET' });
    assert(resolve8th.status === 200 && resolve8th.data.data.slug === '8th', 'Slug "8th" resolves to 8th Floor Canteen');

    const resolveInvalid = await request({ hostname: 'localhost', port: 5000, path: '/api/canteens/slug/invalid-canteen', method: 'GET' });
    assert(resolveInvalid.status === 404, 'Invalid slug correctly returns 404 Not Found');

    // -------------------------------------------------------------------------
    // 4. STUDENT ORDER CREATION FOR UPI PAYMENT
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 4: Order Creation for UPI Checkout ---');

    // Fetch food item from ground canteen
    const foodRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/food?canteen=${groundCanteenId}&limit=1`,
      method: 'GET',
    });
    assert(foodRes.status === 200 && foodRes.data.data.length > 0, 'Fetched menu item for order creation');
    const testItem = foodRes.data.data[0];

    // Connect Student Socket
    const studentSocket = io('http://localhost:5000', {
      transports: ['websocket'],
      auth: { token: student1Token },
    });
    await new Promise((resolve) => studentSocket.on('connect', resolve));
    assert(studentSocket.connected, 'Student 1 connected to Socket.IO');
    studentSocket.emit('join:user', student1Id);

    // Create primary order for successful UPI flow
    const orderPayload = {
      canteenId: groundCanteenId,
      items: [
        {
          foodItemId: testItem._id,
          quantity: 2,
          customizations: { 'Spice Level': 'Medium' },
        },
      ],
      paymentMethod: 'upi',
      specialInstructions: 'QR scan order demo with simulated UPI',
    };

    const orderRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      orderPayload
    );

    assert(orderRes.status === 201 && orderRes.data.success, 'Order created successfully with paymentMethod: upi');
    const order1 = orderRes.data.data;
    assert(order1.paymentStatus === 'pending', 'Order paymentStatus initialized as "pending"');
    assert(Boolean(order1.pickupToken), `Pickup token generated for student counter: ${order1.pickupToken}`);

    // -------------------------------------------------------------------------
    // 5. UPI PAYMENT INITIALIZATION
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 5: UPI Payment Initialization ---');

    const paymentInit = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      {
        orderId: order1._id,
        method: 'upi',
        upiId: 'mithibai-eats@svkm-demo',
      }
    );

    assert(paymentInit.status === 201 && paymentInit.data.success, 'Payment initialized successfully via POST /api/payments/create');
    const paymentRecord1 = paymentInit.data.data.payment;
    const upiQRData = paymentInit.data.data.upiQRData;

    assert(Boolean(paymentRecord1.paymentId), `Unique Payment ID generated: ${paymentRecord1.paymentId}`);
    assert(paymentRecord1.status === 'initiated', 'Payment status is "initiated"');
    assert(paymentRecord1.amount === order1.total, `Payment amount matches order total: ₹${paymentRecord1.amount}`);
    assert(upiQRData.startsWith('upi://pay?pa='), `Dynamic UPI QR string formatted correctly: ${upiQRData.substring(0, 45)}...`);
    assert(upiQRData.includes(`am=${order1.total}`), 'UPI QR string includes correct amount');

    // Duplicate payment initialization test
    const duplicatePayment = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      { orderId: order1._id, method: 'upi' }
    );
    assert(duplicatePayment.status === 400, 'Duplicate payment initialization correctly rejected with 400');

    // Other user forbidden from paying for this order
    const unauthorizedPayment = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/simulate/success',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student2Token}`,
        },
      },
      { paymentId: paymentRecord1.paymentId }
    );
    assert(unauthorizedPayment.status === 403, 'Unauthorized student cannot simulate payment for another student order (403)');

    // -------------------------------------------------------------------------
    // 6. SIMULATE PAYMENT FAILURE FLOW
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 6: Simulated Payment Failure Lifecycle ---');

    // Create a 2nd order to test failure flow
    const orderFailRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/orders',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      orderPayload
    );
    const order2 = orderFailRes.data.data;

    const payment2Init = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/create',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      { orderId: order2._id, method: 'upi' }
    );
    const paymentRecord2 = payment2Init.data.data.payment;

    // Simulate failure
    const simFail = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/simulate/failure',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      { paymentId: paymentRecord2.paymentId }
    );
    assert(simFail.status === 200 && simFail.data.success, 'Simulate failure endpoint returned 200');
    assert(simFail.data.data.status === 'failed', 'Payment status updated to "failed"');

    // Check order paymentStatus updated to failed
    const checkOrder2 = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${order2._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(checkOrder2.status === 200 && checkOrder2.data.data.paymentStatus === 'failed', 'Order paymentStatus synced to "failed"');

    // -------------------------------------------------------------------------
    // 7. SIMULATE PAYMENT SUCCESS FLOW & SOCKET.IO EVENT
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 7: Simulated Payment Success Lifecycle & Real-Time Sync ---');

    const paymentSuccessPromise = waitForEvent(studentSocket, 'payment:success', 5000);

    const simSuccess = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/payments/simulate/success',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${student1Token}`,
        },
      },
      { paymentId: paymentRecord1.paymentId }
    );

    assert(simSuccess.status === 200 && simSuccess.data.success, 'Simulate success endpoint returned 200');
    assert(simSuccess.data.data.payment.status === 'success', 'Payment status updated to "success"');
    assert(Boolean(simSuccess.data.data.transactionRef), `Transaction reference generated: ${simSuccess.data.data.transactionRef}`);
    assert(simSuccess.data.data.order.paymentStatus === 'completed', 'Order paymentStatus updated to "completed"');

    // Wait for real-time socket event on student socket
    const socketEventData = await paymentSuccessPromise;
    assert(Boolean(socketEventData), 'Student received "payment:success" Socket.IO event in real-time');
    assert(socketEventData.payment.paymentId === paymentRecord1.paymentId, 'Socket payload contains matching paymentId');
    assert(socketEventData.transactionRef === simSuccess.data.data.transactionRef, 'Socket payload contains matching transactionRef');

    // Check payment record lookup by order
    const getPaymentRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: `/api/payments/order/${order1._id}`,
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(getPaymentRes.status === 200 && getPaymentRes.data.data.status === 'success', 'GET /api/payments/order/:orderId returns completed payment');

    // Check student notification generated
    const notifsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/notifications',
      method: 'GET',
      headers: { Authorization: `Bearer ${student1Token}` },
    });
    assert(notifsRes.status === 200 && Array.isArray(notifsRes.data.data), 'Fetched student notifications');
    const paymentNotif = notifsRes.data.data.find((n) => n.type === 'payment' && n.title.includes('Successful'));
    assert(Boolean(paymentNotif), `Payment success notification recorded: "${paymentNotif?.title}"`);

    // Disconnect student socket
    studentSocket.disconnect();

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 QR & SIMULATED UPI TEST SUMMARY: ${passed}/${total} ASSERTIONS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL QR ORDERING AND SIMULATED UPI PAYMENT TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error(`❌ ${total - passed} ASSERTIONS FAILED.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running QR payment tests:', err);
    process.exit(1);
  }
}

runQRPaymentTests();
