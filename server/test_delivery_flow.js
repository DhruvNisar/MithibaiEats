const http = require('http');
const assert = require('assert');

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

async function testCampusDeliveryFlow() {
  console.log('================================================================');
  console.log('🚚 MITHIBAI EATS: CAMPUS DELIVERY ORDERING FLOW TEST');
  console.log('================================================================\n');

  // 1. Student Login
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

  assert(loginRes.status === 200, 'Student login successful');
  const token = loginRes.data.data.token;
  console.log('✅ Student logged in successfully');

  // 2. Fetch Canteens
  const canteenRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: '/api/canteens',
    method: 'GET',
  });

  assert(canteenRes.status === 200, 'Canteens fetched');
  const canteen = canteenRes.data.data[0];
  console.log(`✅ Selected Canteen: ${canteen.name}`);

  // 3. Fetch Food Items
  const foodRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/food?canteenId=${canteen._id}&limit=5`,
    method: 'GET',
  });

  assert(foodRes.status === 200, 'Food items fetched');
  const food = foodRes.data.data[0];
  console.log(`✅ Selected Dish: ${food.name} (₹${food.price})`);

  // 4. Create Campus Delivery Order
  const orderRes = await request(
    {
      hostname: 'localhost',
      port: 5000,
      path: '/api/orders',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    },
    {
      canteenId: canteen._id,
      items: [{ foodItemId: food._id, quantity: 2, customizations: {} }],
      fulfillmentType: 'delivery',
      deliveryDetails: {
        building: 'Main College Building',
        floorRoom: '4th Floor, Room 402',
        contactPhone: '+91 98199 55667',
        deliveryNotes: 'Call outside classroom',
      },
      paymentMethod: 'cash',
    }
  );

  assert(orderRes.status === 201, 'Delivery Order created with 201 Created');
  const order = orderRes.data.data;
  assert(order.fulfillmentType === 'delivery', 'Order marked as delivery');
  assert(order.deliveryFee === 10, 'Delivery fee is ₹10');
  assert(order.deliveryDetails.floorRoom === '4th Floor, Room 402', 'Room details saved correctly');

  console.log(`✅ Delivery Order Created: #${order.orderNumber}`);
  console.log(`   Fulfillment: ${order.fulfillmentType.toUpperCase()}`);
  console.log(`   Destination: ${order.deliveryDetails.building} - ${order.deliveryDetails.floorRoom}`);
  console.log(`   Subtotal: ₹${order.subtotal}, Delivery Fee: ₹${order.deliveryFee}, Total: ₹${order.total}`);

  // 5. Query Order Tracking
  const trackRes = await request({
    hostname: 'localhost',
    port: 5000,
    path: `/api/orders/${order._id}`,
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  assert(trackRes.status === 200, 'Order tracking query returned 200 OK');
  assert(trackRes.data.data.fulfillmentType === 'delivery', 'Tracking returns delivery fulfillment type');
  console.log('✅ Order tracking verified for Campus Delivery');

  console.log('\n================================================================');
  console.log('🎉 ALL CAMPUS DELIVERY FLOW TESTS PASSED PERFECTLY!');
  console.log('================================================================\n');
}

testCampusDeliveryFlow().catch((err) => {
  console.error('❌ Delivery Flow Test Failed:', err);
  process.exit(1);
});
