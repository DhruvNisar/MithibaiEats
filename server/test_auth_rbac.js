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

async function runTests() {
  console.log('================================================================');
  console.log('🧪 MITHIBAI EATS: AUTHENTICATION & RBAC AUTOMATED TEST SUITE');
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

  // TEST 1: Register a new student
  const testStudentEmail = `test.student.${Date.now()}@mithibai.ac.in`;
  console.log(`--- Test 1: Student Registration (${testStudentEmail}) ---`);
  const regRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Rohan Joshi',
      email: testStudentEmail,
      password: 'password123',
      phone: '+91 98201 23456',
      preferences: { vegetarian: true, jain: false, spiceLevel: 'medium' },
    }
  );

  assert(regRes.status === 201, `Student registration returned 201 Created (got ${regRes.status})`);
  assert(regRes.data?.success === true, 'Response indicates success: true');
  assert(regRes.data?.data?.user?.role === 'student', 'Registered user has role "student"');
  assert(typeof regRes.data?.data?.token === 'string', 'JWT token issued upon registration');

  const newStudentToken = regRes.data?.data?.token;

  // TEST 2: Duplicate registration prevention
  console.log('\n--- Test 2: Duplicate Registration Validation ---');
  const dupRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      name: 'Rohan Joshi',
      email: testStudentEmail,
      password: 'password123',
    }
  );
  assert(dupRes.status === 400, `Duplicate registration rejected with 400 Bad Request (got ${dupRes.status})`);
  assert(dupRes.data?.message?.includes('already registered'), 'Proper duplicate email error message returned');

  // TEST 3: Login with wrong password
  console.log('\n--- Test 3: Invalid Credentials Rejection ---');
  const invalidLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: testStudentEmail,
      password: 'wrongpassword',
    }
  );
  assert(invalidLoginRes.status === 401, `Invalid password rejected with 401 Unauthorized (got ${invalidLoginRes.status})`);

  // TEST 4: Login with valid student credentials
  console.log('\n--- Test 4: Student Login (Seeded student@mithibai.ac.in) ---');
  const studentLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'student@mithibai.ac.in',
      password: 'student123',
    }
  );
  assert(studentLoginRes.status === 200, `Student login returned 200 OK (got ${studentLoginRes.status})`);
  assert(studentLoginRes.data?.data?.user?.name === 'Aarav Mehta', 'Correct student profile retrieved (Aarav Mehta)');
  assert(studentLoginRes.data?.data?.user?.role === 'student', 'User role confirmed as "student"');
  const studentToken = studentLoginRes.data?.data?.token;

  // TEST 5: Staff Login (Ground Floor Staff)
  console.log('\n--- Test 5: Staff Login (staff.ground@mithibai.ac.in) ---');
  const staffLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'staff.ground@mithibai.ac.in',
      password: 'staff123',
    }
  );
  assert(staffLoginRes.status === 200, `Staff login returned 200 OK (got ${staffLoginRes.status})`);
  assert(staffLoginRes.data?.data?.user?.role === 'staff', 'Staff user role confirmed as "staff"');
  assert(staffLoginRes.data?.data?.user?.name === 'Ramesh Shinde (GF Lead)', 'Ground staff lead retrieved');
  const staffToken = staffLoginRes.data?.data?.token;

  // TEST 6: Admin Login
  console.log('\n--- Test 6: Admin Login (admin@mithibai.ac.in) ---');
  const adminLoginRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    {
      email: 'admin@mithibai.ac.in',
      password: 'admin123',
    }
  );
  assert(adminLoginRes.status === 200, `Admin login returned 200 OK (got ${adminLoginRes.status})`);
  assert(adminLoginRes.data?.data?.user?.role === 'admin', 'Admin role confirmed as "admin"');
  const adminToken = adminLoginRes.data?.data?.token;

  // TEST 7: Role-Based Access Control (RBAC) - Student blocked from Admin Route
  console.log('\n--- Test 7: RBAC - Student Blocked from Admin Dashboard ---');
  const studentAccessAdmin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${studentToken}` },
  });
  assert(studentAccessAdmin.status === 403, `Student blocked from /api/admin/dashboard with 403 Forbidden (got ${studentAccessAdmin.status})`);
  assert(studentAccessAdmin.data?.message?.includes('not authorized'), 'Proper authorization denial message received');

  // TEST 8: RBAC - Staff blocked from Admin Route
  console.log('\n--- Test 8: RBAC - Staff Blocked from Admin Users & Settings ---');
  const staffAccessAdmin = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/users',
    method: 'GET',
    headers: { Authorization: `Bearer ${staffToken}` },
  });
  assert(staffAccessAdmin.status === 403, `Staff blocked from /api/admin/users with 403 Forbidden (got ${staffAccessAdmin.status})`);

  // TEST 9: RBAC - Unauthenticated request blocked
  console.log('\n--- Test 9: RBAC - Unauthenticated Request Blocked ---');
  const noTokenRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
  });
  assert(noTokenRes.status === 401, `Request without token rejected with 401 Unauthorized (got ${noTokenRes.status})`);

  // TEST 10: RBAC - Tampered / Invalid token rejected
  console.log('\n--- Test 10: RBAC - Tampered Token Rejected ---');
  const tamperedRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: 'Bearer invalid.tampered.jwttoken' },
  });
  assert(tamperedRes.status === 401, `Tampered token rejected with 401 Unauthorized (got ${tamperedRes.status})`);

  // TEST 11: RBAC - Admin authorized to access Admin Dashboard
  console.log('\n--- Test 11: RBAC - Admin Authorized Access ---');
  const adminDashboardRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/admin/dashboard',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });
  assert(adminDashboardRes.status === 200, `Admin successfully accesses /api/admin/dashboard (200 OK)`);
  assert(adminDashboardRes.data?.data?.totalFoodItems !== undefined, 'Admin dashboard stats returned');

  // TEST 12: Verify 3 Canteens and Seeding
  console.log('\n--- Test 12: 3 Canteens Verification ---');
  const canteensRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens',
    method: 'GET',
  });
  assert(canteensRes.status === 200, 'Canteens API returned 200 OK');
  assert(canteensRes.data?.data?.length === 3, `Exactly 3 canteens exist (got ${canteensRes.data?.data?.length})`);

  const canteenSlugs = canteensRes.data?.data?.map((c) => c.slug);
  assert(canteenSlugs.includes('ground'), 'Ground Floor Canteen verified');
  assert(canteenSlugs.includes('6th'), '6th Floor Canteen verified');
  assert(canteenSlugs.includes('8th'), '8th Floor Canteen verified');

  // TEST 13: Food Items Count & Breakdown (~450 items)
  console.log('\n--- Test 13: Realistic Food Items Seed Verification (~450 items) ---');
  const groundCanteen = canteensRes.data?.data?.find((c) => c.slug === 'ground');
  const sixthCanteen = canteensRes.data?.data?.find((c) => c.slug === '6th');
  const eighthCanteen = canteensRes.data?.data?.find((c) => c.slug === '8th');

  const groundFoodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteen=${groundCanteen._id}&limit=200`,
    method: 'GET',
  });
  const sixthFoodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteen=${sixthCanteen._id}&limit=200`,
    method: 'GET',
  });
  const eighthFoodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteen=${eighthCanteen._id}&limit=200`,
    method: 'GET',
  });

  const groundCount = groundFoodRes.data?.pagination?.total || groundFoodRes.data?.data?.length;
  const sixthCount = sixthFoodRes.data?.pagination?.total || sixthFoodRes.data?.data?.length;
  const eighthCount = eighthFoodRes.data?.pagination?.total || eighthFoodRes.data?.data?.length;
  const totalCount = groundCount + sixthCount + eighthCount;

  console.log(`   - Ground Floor Items: ${groundCount}`);
  console.log(`   - 6th Floor Items:    ${sixthCount}`);
  console.log(`   - 8th Floor Items:    ${eighthCount}`);
  console.log(`   - Total Items Seeded: ${totalCount}`);

  assert(groundCount >= 140, `Ground Floor has ~150 items (got ${groundCount})`);
  assert(sixthCount >= 140, `6th Floor has ~150 items (got ${sixthCount})`);
  assert(eighthCount >= 140, `8th Floor has ~150 items (got ${eighthCount})`);
  assert(totalCount >= 440, `Total catalog has ~450 items (got ${totalCount})`);

  console.log('\n================================================================');
  console.log(`📊 TEST SUMMARY: ${passed} / ${total} TESTS PASSED (${((passed / total) * 100).toFixed(0)}%)`);
  console.log('================================================================\n');

  if (passed === total) {
    console.log('🎉 ALL AUTHENTICATION, ROLES, RBAC, AND SEED TESTS PASSED PERFECTLY!');
  } else {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
