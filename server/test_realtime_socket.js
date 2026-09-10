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

function waitForEvent(socket, eventName, timeoutMs = 4000) {
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

async function runRealtimeSocketTests() {
  console.log('================================================================');
  console.log('⚡ MITHIBAI EATS: REAL-TIME SOCKET.IO ORDER SYSTEM TEST');
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

  // 1. Authenticate Student & Staff
  console.log('--- Step 1: Authenticate Student and Kitchen Staff ---');
  const studentEmail = `student.socket.${Date.now()}@mithibai.ac.in`;
  const studentReg = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Sahil Kapoor',
      email: studentEmail,
      password: 'password123',
    }
  );
  assert(studentReg.status === 201, 'Student registered');
  const studentToken = studentReg.data?.data?.token;
  const studentId = studentReg.data?.data?.user?._id;

  const staffLogin = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'staff.ground@mithibai.ac.in', password: 'staff123' }
  );
  assert(staffLogin.status === 200, 'Ground staff logged in');
  const staffToken = staffLogin.data?.data?.token;

  // 2. Fetch Ground Canteen & a Dish
  console.log('\n--- Step 2: Fetch Canteen & Menu Dish ---');
  const canteensRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens',
    method: 'GET',
  });
  const groundCanteen = canteensRes.data?.data?.find((c) => c.slug === 'ground');
  assert(groundCanteen !== undefined, `Target Canteen: ${groundCanteen.name} (${groundCanteen.floor})`);

  const foodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteen=${groundCanteen._id}&limit=5`,
    method: 'GET',
  });
  const dish = foodRes.data?.data?.[0];
  assert(dish !== undefined, `Target Dish: "${dish.name}" (₹${dish.price})`);

  // 3. Establish Socket Connections
  console.log('\n--- Step 3: Establish Real-Time Socket.IO Connections ---');
  const staffSocket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
  });
  const studentSocket = io('http://localhost:5000', {
    transports: ['websocket', 'polling'],
  });

  await new Promise((resolve) => {
    let connected = 0;
    function check() {
      connected++;
      if (connected === 2) resolve();
    }
    staffSocket.on('connect', check);
    studentSocket.on('connect', check);
  });

  assert(staffSocket.connected, `Staff Socket connected (ID: ${staffSocket.id})`);
  assert(studentSocket.connected, `Student Socket connected (ID: ${studentSocket.id})`);

  // Staff joins canteen room, student joins user room
  staffSocket.emit('join:canteen', groundCanteen._id);
  studentSocket.emit('join:user', studentId);
  console.log(`   Staff joined room: canteen:${groundCanteen._id}`);
  console.log(`   Student joined room: user:${studentId}`);

  // Small delay to allow rooms to join
  await new Promise((r) => setTimeout(r, 200));

  // 4. Student Places Order -> Staff Receives in Real Time
  console.log('\n--- Step 4: Student Places Order ➔ Staff Kitchen Queue Updates Instantly ---');
  const staffOrderPromise = waitForEvent(staffSocket, 'order:created');

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
    {
      canteenId: groundCanteen._id,
      items: [{ foodItemId: dish._id, quantity: 1, customizations: {} }],
      paymentMethod: 'cash',
    }
  );

  assert(orderRes.status === 201, 'Order created via HTTP POST');
  const createdOrder = orderRes.data?.data;
  assert(createdOrder?._id !== undefined, `Order ID: ${createdOrder?._id} (${createdOrder?.orderNumber})`);

  const receivedByStaff = await staffOrderPromise;
  assert(receivedByStaff !== null, 'Staff socket received "order:created" event in real time!');
  const staffReceivedOrderId = receivedByStaff?.order?._id || receivedByStaff?._id;
  assert(staffReceivedOrderId === createdOrder._id, 'Event payload contains exact placed order ID');
  console.log(`   ⚡ Staff kitchen received order ${createdOrder.orderNumber} without page refresh!`);

  // Student joins order room for live tracking
  studentSocket.emit('join:order', createdOrder._id);
  await new Promise((r) => setTimeout(r, 200));

  // 5. Staff Accepts Order -> Student Tracker Updates Instantly
  console.log('\n--- Step 5: Staff Accepts Order ➔ Student Tracker Transitions to ACCEPTED ---');
  let studentUpdatePromise = waitForEvent(studentSocket, 'order:accepted');

  const acceptRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${createdOrder._id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
    },
    { status: 'accepted' }
  );
  assert(acceptRes.status === 200, 'Staff PATCH order status to "accepted"');

  const acceptData = await studentUpdatePromise;
  assert(acceptData !== null, 'Student socket received "order:accepted" event in real time!');
  assert(acceptData.order?.orderStatus === 'accepted', 'Student status updated to "accepted"');
  console.log('   ⚡ Student tracking screen stepped to: ACCEPTED');

  // 6. Staff Starts Preparing -> Student Tracker Transitions to PREPARING
  console.log('\n--- Step 6: Staff Starts Preparing ➔ Student Tracker Transitions to PREPARING ---');
  studentUpdatePromise = waitForEvent(studentSocket, 'order:preparing');

  const prepRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${createdOrder._id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
    },
    { status: 'preparing' }
  );
  assert(prepRes.status === 200, 'Staff PATCH order status to "preparing"');

  const prepData = await studentUpdatePromise;
  assert(prepData !== null, 'Student socket received "order:preparing" event in real time!');
  assert(prepData.order?.orderStatus === 'preparing', 'Student status updated to "preparing"');
  console.log('   ⚡ Student tracking screen stepped to: PREPARING');

  // 7. Staff Marks Ready -> Student Tracker Transitions to READY (Chime Trigger)
  console.log('\n--- Step 7: Staff Marks Ready ➔ Student Tracker Transitions to READY ---');
  studentUpdatePromise = waitForEvent(studentSocket, 'order:ready');

  const readyRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${createdOrder._id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
    },
    { status: 'ready' }
  );
  assert(readyRes.status === 200, 'Staff PATCH order status to "ready"');

  const readyData = await studentUpdatePromise;
  assert(readyData !== null, 'Student socket received "order:ready" event in real time!');
  assert(readyData.order?.orderStatus === 'ready', 'Student status updated to "ready"');
  console.log('   ⚡ Student tracking screen stepped to: READY (Audio Chime Triggered!)');

  // 8. Staff Marks Handover Completed -> Student Tracker Transitions to COMPLETED
  console.log('\n--- Step 8: Staff Marks Completed ➔ Student Tracker Transitions to COMPLETED ---');
  studentUpdatePromise = waitForEvent(studentSocket, 'order:completed');

  const completeRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: `/api/orders/${createdOrder._id}/status`,
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${staffToken}`,
      },
    },
    { status: 'completed' }
  );
  assert(completeRes.status === 200, 'Staff PATCH order status to "completed"');

  const completeData = await studentUpdatePromise;
  assert(completeData !== null, 'Student socket received "order:completed" event in real time!');
  assert(completeData.order?.orderStatus === 'completed', 'Student status updated to "completed"');
  console.log('   ⚡ Student tracking screen stepped to: COMPLETED');

  // Clean up
  staffSocket.disconnect();
  studentSocket.disconnect();

  console.log('\n================================================================');
  console.log(`📊 REAL-TIME SOCKET TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 SOCKET.IO REAL-TIME ORDER SYSTEM IS 100% OPERATIONAL & VERIFIED!');
  } else {
    process.exit(1);
  }
}

runRealtimeSocketTests().catch((err) => {
  console.error('Fatal realtime test error:', err);
  process.exit(1);
});
