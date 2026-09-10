const http = require('http');

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

async function runAdminAnalyticsTests() {
  console.log('================================================================');
  console.log('📊 MITHIBAI EATS: ADMIN AGGREGATIONS & CSV EXPORT TEST SUITE');
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
    // 1. AUTHENTICATE ADMIN & STUDENT
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Role Authentication & RBAC Guard Verification ---');

    const adminLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'admin@mithibai.ac.in', password: 'admin123' }
    );
    assert(adminLogin.status === 200 && adminLogin.data.data.token, 'Admin login successful');
    const adminToken = adminLogin.data.data.token;

    const studentLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'student@mithibai.ac.in', password: 'student123' }
    );
    assert(studentLogin.status === 200 && studentLogin.data.data.token, 'Student login successful');
    const studentToken = studentLogin.data.data.token;

    // RBAC: Verify student is blocked from analytics
    const studentBlockedDash = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentBlockedDash.status === 403, 'Student blocked from /api/admin/dashboard (403 Forbidden)');

    const studentBlockedAnalytics = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentBlockedAnalytics.status === 403, 'Student blocked from /api/admin/analytics (403 Forbidden)');

    const studentBlockedExport = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/export/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    assert(studentBlockedExport.status === 403, 'Student blocked from /api/admin/export/orders (403 Forbidden)');

    // -------------------------------------------------------------------------
    // 2. DASHBOARD STATS AGGREGATION (GET /api/admin/dashboard)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Core Dashboard KPIs & Real Aggregations ---');

    const dashRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/dashboard',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(dashRes.status === 200 && dashRes.data.success, 'GET /api/admin/dashboard returned 200 OK');
    const dashData = dashRes.data.data;

    assert(typeof dashData.totalRevenue === 'number' && dashData.totalRevenue >= 0, `Total Revenue aggregated: ₹${dashData.totalRevenue}`);
    assert(typeof dashData.totalOrders === 'number' && dashData.totalOrders >= 0, `Total Orders count: ${dashData.totalOrders}`);
    assert(typeof dashData.averageOrderValue === 'number' && dashData.averageOrderValue >= 0, `Average Order Value (AOV): ₹${dashData.averageOrderValue}`);
    assert(typeof dashData.todayOrders === 'number', `Today Orders: ${dashData.todayOrders}`);
    assert(typeof dashData.todayRevenue === 'number', `Today Revenue: ₹${dashData.todayRevenue}`);
    assert(typeof dashData.weekOrders === 'number', `Week Orders: ${dashData.weekOrders}`);
    assert(typeof dashData.weekRevenue === 'number', `Week Revenue: ₹${dashData.weekRevenue}`);

    // Inventory metrics in dashboard
    assert(Boolean(dashData.inventory), 'Dashboard includes inventory breakdown');
    assert(dashData.inventory.totalItems >= 450, `Catalog total food items: ${dashData.inventory.totalItems} (>=450 seeded items)`);
    assert(typeof dashData.inventory.inStock === 'number', `In stock count: ${dashData.inventory.inStock}`);
    assert(typeof dashData.inventory.lowStock === 'number', `Low stock count: ${dashData.inventory.lowStock}`);
    assert(typeof dashData.inventory.outOfStock === 'number', `Out of stock count: ${dashData.inventory.outOfStock}`);

    // Recent orders
    assert(Array.isArray(dashData.recentOrders), 'Recent orders array returned');

    // -------------------------------------------------------------------------
    // 3. COMPLETE ANALYTICS AGGREGATIONS (GET /api/admin/analytics)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: Comprehensive Analytics Aggregations ---');

    const analyticsRes = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/analytics',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(analyticsRes.status === 200 && analyticsRes.data.success, 'GET /api/admin/analytics returned 200 OK');
    const analytics = analyticsRes.data.data;

    // 3A: Revenue & Orders by Canteen (All 3 Canteens)
    assert(Array.isArray(analytics.canteenRevenue), 'canteenRevenue returned as array');
    assert(analytics.canteenRevenue.length === 3, `Exactly 3 canteens represented in revenue analytics (got ${analytics.canteenRevenue.length})`);

    const gfStat = analytics.canteenRevenue.find((c) => c.slug === 'ground');
    const sixthStat = analytics.canteenRevenue.find((c) => c.slug === '6th');
    const eighthStat = analytics.canteenRevenue.find((c) => c.slug === '8th');

    assert(Boolean(gfStat), `Ground Floor Canteen stat found (Revenue: ₹${gfStat?.totalRevenue}, Orders: ${gfStat?.totalOrders}, AOV: ₹${gfStat?.avgOrderValue})`);
    assert(Boolean(sixthStat), `6th Floor Canteen stat found (Revenue: ₹${sixthStat?.totalRevenue}, Orders: ${sixthStat?.totalOrders}, AOV: ₹${sixthStat?.avgOrderValue})`);
    assert(Boolean(eighthStat), `8th Floor Canteen stat found (Revenue: ₹${eighthStat?.totalRevenue}, Orders: ${eighthStat?.totalOrders}, AOV: ₹${eighthStat?.avgOrderValue})`);

    // 3B: Peak Hours Distribution (8 AM - 8 PM)
    assert(Array.isArray(analytics.peakHours), 'peakHours returned as array');
    assert(analytics.peakHours.length === 13, `Hourly distribution covers 13 hours from 8 AM to 8 PM (got ${analytics.peakHours.length})`);
    const peakHoursSample = analytics.peakHours[0];
    assert(typeof peakHoursSample.hour === 'number' && typeof peakHoursSample.label === 'string', `Sample peak hour: ${peakHoursSample.label} (Orders: ${peakHoursSample.orderCount})`);

    // 3C: Popular / Bestselling Items
    assert(Array.isArray(analytics.topItems) && analytics.topItems.length > 0, `Found ${analytics.topItems.length} top campus favorite items`);
    const topItem = analytics.topItems[0];
    assert(Boolean(topItem.name && typeof topItem.quantitySold === 'number'), `Top Item: "${topItem.name}" (Qty Sold: ${topItem.quantitySold}, Rev: ₹${topItem.totalRevenue || 0})`);
    assert(Boolean(topItem.canteenName), `Top item includes canteen affiliation: ${topItem.canteenName}`);

    // 3D: Categories Analytics
    assert(Array.isArray(analytics.categories) && analytics.categories.length > 0, `Found ${analytics.categories.length} category aggregations`);
    const topCat = analytics.categories[0];
    assert(Boolean(topCat.name && topCat.totalItems > 0), `Top Category: "${topCat.name}" (${topCat.totalItems} items, Avg Price: ₹${topCat.avgPrice}, Avg Prep: ${topCat.avgPrepTime}m)`);

    // 3E: Payment Methods Breakdown (UPI vs Cash)
    assert(Array.isArray(analytics.paymentMethods) && analytics.paymentMethods.length === 2, 'Payment methods breakdown contains exactly UPI and Cash');
    const upiStat = analytics.paymentMethods.find((p) => p.method === 'upi');
    const cashStat = analytics.paymentMethods.find((p) => p.method === 'cash');
    assert(Boolean(upiStat), `UPI Payment breakdown found: ${upiStat?.orderCount} orders, ₹${upiStat?.totalRevenue}`);
    assert(Boolean(cashStat), `Cash Payment breakdown found: ${cashStat?.orderCount} orders, ₹${cashStat?.totalRevenue}`);

    // 3F: Preparation Time Analytics
    assert(Boolean(analytics.preparationTime), 'Preparation time metrics returned');
    assert(Array.isArray(analytics.preparationTime.byCanteen) && analytics.preparationTime.byCanteen.length === 3, 'Prep time calculated across all 3 canteens');
    assert(typeof analytics.preparationTime.avgActualFulfillment === 'number', `Average fulfillment duration: ~${analytics.preparationTime.avgActualFulfillment} minutes`);

    // 3G: Inventory Analytics
    assert(Boolean(analytics.inventory), 'Inventory analytics returned');
    assert(analytics.inventory.totalItems >= 450, `Inventory total items: ${analytics.inventory.totalItems}`);
    assert(Array.isArray(analytics.inventory.canteenStock) && analytics.inventory.canteenStock.length === 3, 'Canteen floor inventory distribution returned');
    assert(Array.isArray(analytics.inventory.criticalItems), 'Critical low-stock / out-of-stock items returned');

    // 3H: Dietary & Status Breakdown
    assert(analytics.dietary.vegetarian > 0, `Vegetarian items in catalog: ${analytics.dietary.vegetarian}`);
    assert(analytics.dietary.jain > 0, `Pure Jain items in catalog: ${analytics.dietary.jain}`);
    assert(Array.isArray(analytics.statusDistribution), 'Order status distribution returned');

    // -------------------------------------------------------------------------
    // 4. CSV EXPORTS VERIFICATION
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 4: Real CSV Exports Generation ---');

    // 4A: Orders CSV
    const ordersCSV = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/export/orders',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(ordersCSV.status === 200, 'GET /api/admin/export/orders returned 200 OK');
    assert(ordersCSV.headers['content-type'].includes('text/csv'), 'Orders export has Content-Type: text/csv');
    assert(ordersCSV.data.includes('"Order Number"') && ordersCSV.data.includes('"Student Name"'), 'Orders CSV contains expected column headers');
    assert(ordersCSV.data.includes('"Total (INR)"') && ordersCSV.data.includes('"Payment Method"'), 'Orders CSV contains financial headers');

    // 4B: Sales CSV
    const salesCSV = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/export/sales',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(salesCSV.status === 200, 'GET /api/admin/export/sales returned 200 OK');
    assert(salesCSV.headers['content-type'].includes('text/csv'), 'Sales export has Content-Type: text/csv');
    assert(salesCSV.data.includes('"Canteen Name"') && salesCSV.data.includes('"Revenue (INR)"'), 'Sales CSV contains expected columns');
    assert(salesCSV.data.includes('"Average Order Value (INR)"'), 'Sales CSV contains AOV column');

    // 4C: Inventory CSV
    const inventoryCSV = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/export/inventory',
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert(inventoryCSV.status === 200, 'GET /api/admin/export/inventory returned 200 OK');
    assert(inventoryCSV.headers['content-type'].includes('text/csv'), 'Inventory export has Content-Type: text/csv');
    assert(inventoryCSV.data.includes('"Dish Name"') && inventoryCSV.data.includes('"Stock Quantity"'), 'Inventory CSV contains stock headers');
    assert(inventoryCSV.data.includes('"Jain Counter Availability"'), 'Inventory CSV contains dietary information');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 ADMIN AGGREGATIONS & CSV TEST SUMMARY: ${passed}/${total} ASSERTIONS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL ADMIN AGGREGATIONS AND CSV EXPORT TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error(`❌ ${total - passed} ASSERTIONS FAILED.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running admin analytics tests:', err);
    process.exit(1);
  }
}

runAdminAnalyticsTests();
