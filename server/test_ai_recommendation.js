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

async function runAITests() {
  console.log('================================================================');
  console.log('🤖 MITHIBAI EATS: AI FOOD ASSISTANT & SMART RECOMMENDATION TEST');
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
    // 1. AUTHENTICATE REGULAR AND JAIN STUDENTS
    // -------------------------------------------------------------------------
    console.log('--- Phase 1: Authenticate Students for Personalized Testing ---');

    const aaravLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'student@mithibai.ac.in', password: 'student123' }
    );
    assert(aaravLogin.status === 200 && aaravLogin.data.data.token, 'Aarav Mehta (Regular Student) authenticated');
    const aaravToken = aaravLogin.data.data.token;

    const priyaLogin = await request(
      { hostname: 'localhost', port: 5000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { email: 'priya.jain@mithibai.ac.in', password: 'student123' }
    );
    assert(priyaLogin.status === 200 && priyaLogin.data.data.token, 'Priya Shah (Pure Jain Student) authenticated');
    const priyaToken = priyaLogin.data.data.token;

    // -------------------------------------------------------------------------
    // 2. BUDGET FILTERING TEST (ACTUAL MONGODB DATA)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 2: Multi-Factor Budget Filter (Budget <= ₹70) ---');

    const budgetRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { budget: 70 }
    );
    assert(budgetRes.status === 200 && budgetRes.data.success, 'POST /api/ai/recommend returned 200 OK');
    assert(Array.isArray(budgetRes.data.data) && budgetRes.data.data.length > 0, `Found ${budgetRes.data.data.length} recommendations within ₹70`);

    const allUnder70 = budgetRes.data.data.every((r) => r.item.price <= 70);
    assert(allUnder70, 'All recommended dishes strictly respect the ₹70 budget constraint');

    const topBudgetDish = budgetRes.data.data[0];
    assert(Boolean(topBudgetDish.item._id && topBudgetDish.item.name), `Top dish from MongoDB: "${topBudgetDish.item.name}" (₹${topBudgetDish.item.price})`);
    assert(typeof topBudgetDish.score === 'number' && topBudgetDish.score > 50, `Dish scored correctly: ${topBudgetDish.score} pts`);
    assert(typeof topBudgetDish.reason === 'string' && topBudgetDish.reason.includes('budget'), `Reason includes budget explanation: "${topBudgetDish.reason}"`);

    // -------------------------------------------------------------------------
    // 3. DIETARY PREFERENCE: PURE JAIN
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 3: Pure Jain Dietary Constraint ---');

    const jainRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { jain: true, budget: 120 }
    );
    assert(jainRes.status === 200 && jainRes.data.data.length > 0, `Found ${jainRes.data.data.length} Jain dishes under ₹120`);
    const allJain = jainRes.data.data.every((r) => r.item.jainAvailable === true);
    assert(allJain, 'Every returned dish is certified Pure Jain (jainAvailable === true)');

    const topJain = jainRes.data.data[0];
    assert(topJain.reason.toLowerCase().includes('jain'), `Jain callout present in reason: "${topJain.reason}"`);

    // -------------------------------------------------------------------------
    // 4. CURRENT CANTEEN FILTERING (ALL 3 CANTEENS)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 4: Floor Canteen Filtering (Ground, 6th, 8th) ---');

    // Ground Floor
    const gfRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { canteenSlug: 'ground' }
    );
    assert(gfRes.status === 200 && gfRes.data.data.length > 0, 'Ground Floor Canteen recommendations returned');
    assert(gfRes.data.data.every((r) => r.item.canteen?.slug === 'ground'), 'All dishes originate strictly from Ground Floor Canteen');

    // 6th Floor
    const sixthRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { canteenSlug: '6th' }
    );
    assert(sixthRes.status === 200 && sixthRes.data.data.length > 0, '6th Floor Canteen recommendations returned');
    assert(sixthRes.data.data.every((r) => r.item.canteen?.slug === '6th'), 'All dishes originate strictly from 6th Floor Canteen');

    // 8th Floor
    const eighthRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { canteenSlug: '8th' }
    );
    assert(eighthRes.status === 200 && eighthRes.data.data.length > 0, '8th Floor Canteen recommendations returned');
    assert(eighthRes.data.data.every((r) => r.item.canteen?.slug === '8th'), 'All dishes originate strictly from 8th Floor Canteen');

    // -------------------------------------------------------------------------
    // 5. PREPARATION TIME CONSTRAINT (EXPRESS BITES <= 8 MINS)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 5: Preparation Speed Constraint (<= 8 mins) ---');

    const prepRes = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { maxPrepTime: 8 }
    );
    assert(prepRes.status === 200 && prepRes.data.data.length > 0, `Found ${prepRes.data.data.length} express dishes under 8 mins`);
    assert(prepRes.data.data.every((r) => r.item.preparationTime <= 8), 'All returned dishes have preparationTime <= 8 minutes');

    // -------------------------------------------------------------------------
    // 6. NATURAL LANGUAGE QUERY PARSER & RULE-BASED FALLBACK
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 6: Natural Language Query Processing & Rule-Based NLP ---');

    // Query A: "I need spicy noodles under 120 on 6th floor"
    const nlQuery1 = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { query: 'I need spicy noodles under 120 on 6th floor' }
    );
    assert(nlQuery1.status === 200, 'NL Query 1 processed successfully');
    const parsed1 = nlQuery1.data.parsedCriteria;
    assert(parsed1.budget === 120, 'NLP correctly extracted budget: ₹120');
    assert(parsed1.canteenSlug === '6th', 'NLP correctly extracted canteen: 6th Floor');
    assert(parsed1.spiceLevel === 'spicy', 'NLP correctly extracted spice level: spicy');
    assert(parsed1.cravingKeywords.includes('noodles'), 'NLP correctly extracted keyword: "noodles"');
    assert(nlQuery1.data.data.every((r) => r.item.canteen?.slug === '6th' && r.item.price <= 120), 'Dishes strictly match extracted 6th floor & budget limits');

    // Query B: "quick pure jain breakfast in 5 mins"
    const nlQuery2 = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { query: 'quick pure jain breakfast in 5 mins' }
    );
    assert(nlQuery2.status === 200, 'NL Query 2 processed successfully');
    const parsed2 = nlQuery2.data.parsedCriteria;
    assert(parsed2.jain === true, 'NLP correctly extracted Jain flag: true');
    assert(parsed2.maxPrepTime === 5, 'NLP correctly extracted max prep time: 5 mins');
    assert(nlQuery2.data.data.every((r) => r.item.jainAvailable === true), 'Dishes strictly match pure Jain constraint');

    // Query C: "grilled cheese sandwich under 90 on ground floor"
    const nlQuery3 = await request(
      { hostname: 'localhost', port: 5000, path: '/api/ai/recommend', method: 'POST', headers: { 'Content-Type': 'application/json' } },
      { query: 'grilled cheese sandwich under 90 on ground floor' }
    );
    assert(nlQuery3.status === 200, 'NL Query 3 processed successfully');
    const parsed3 = nlQuery3.data.parsedCriteria;
    assert(parsed3.budget === 90, 'NLP extracted budget: ₹90');
    assert(parsed3.canteenSlug === 'ground', 'NLP extracted canteen: Ground Floor');
    assert(nlQuery3.data.data.every((r) => r.item.canteen?.slug === 'ground' && r.item.price <= 90), 'Dishes match Ground Floor and <= ₹90');

    // -------------------------------------------------------------------------
    // 7. CONVERSATIONAL CHAT ENDPOINT (POST /api/ai/chat)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 7: Conversational AI Chat Endpoint ---');

    const chatRes = await request(
      {
        hostname: 'localhost',
        port: 5000,
        path: '/api/ai/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${aaravToken}`,
        },
      },
      {
        message: 'What is the best thing to eat under 100 rupees on ground floor between lectures?',
        currentCanteenSlug: 'ground',
      }
    );

    assert(chatRes.status === 200 && chatRes.data.success, 'POST /api/ai/chat responded 200 OK');
    assert(typeof chatRes.data.data.reply === 'string' && chatRes.data.data.reply.length > 20, 'Assistant generated conversational natural language reply');
    assert(Array.isArray(chatRes.data.data.recommendations) && chatRes.data.data.recommendations.length > 0, 'Assistant returned grounded MongoDB dish recommendations');
    const chatTopDish = chatRes.data.data.recommendations[0].item;
    assert(chatTopDish.price <= 100, `Top recommended dish "${chatTopDish.name}" (₹${chatTopDish.price}) is within ₹100 budget`);
    assert(chatTopDish.canteen?.slug === 'ground', 'Top dish is from Ground Floor Canteen');

    // -------------------------------------------------------------------------
    // 8. PERSONALIZED RECOMMENDATIONS (GET /api/ai/personalized)
    // -------------------------------------------------------------------------
    console.log('\n--- Phase 8: Student-Tailored Personalized Recommendations ---');

    // Regular student (Aarav)
    const aaravRec = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/personalized',
      method: 'GET',
      headers: { Authorization: `Bearer ${aaravToken}` },
    });
    assert(aaravRec.status === 200 && aaravRec.data.success, 'GET /api/ai/personalized returned 200 for Aarav');
    assert(Array.isArray(aaravRec.data.data.personalized), 'Returned "personalized" array');
    assert(Array.isArray(aaravRec.data.data.quickBites), 'Returned "quickBites" array');
    assert(Array.isArray(aaravRec.data.data.trending), 'Returned "trending" array');
    assert(aaravRec.data.data.quickBites.every((d) => d.preparationTime <= 10), 'All quickBites are <= 10 mins prep');

    // Pure Jain student (Priya)
    const priyaRec = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/personalized',
      method: 'GET',
      headers: { Authorization: `Bearer ${priyaToken}` },
    });
    assert(priyaRec.status === 200 && priyaRec.data.success, 'GET /api/ai/personalized returned 200 for Priya (Jain)');
    assert(priyaRec.data.data.personalized.every((d) => d.jainAvailable === true), 'All personalized items for Priya are 100% Pure Jain');
    assert(priyaRec.data.data.quickBites.every((d) => d.jainAvailable === true), 'All quickBites for Priya are 100% Pure Jain');

    // Unauthenticated Guest
    const guestRec = await request({
      hostname: 'localhost',
      port: 5000,
      path: '/api/ai/personalized',
      method: 'GET',
    });
    assert(guestRec.status === 200 && guestRec.data.success, 'GET /api/ai/personalized returned 200 for unauthenticated guest');
    assert(guestRec.data.data.trending.length > 0, 'Guest receives campus trending items');

    // -------------------------------------------------------------------------
    // SUMMARY
    // -------------------------------------------------------------------------
    console.log('\n================================================================');
    console.log(`📊 AI & SMART RECOMMENDATION SUMMARY: ${passed}/${total} ASSERTIONS PASSED (${Math.round((passed / total) * 100)}%)`);
    console.log('================================================================\n');

    if (passed === total) {
      console.log('🎉 ALL AI FOOD ASSISTANT AND RECOMMENDATION TESTS PASSED PERFECTLY!\n');
      process.exit(0);
    } else {
      console.error(`❌ ${total - passed} ASSERTIONS FAILED.`);
      process.exit(1);
    }
  } catch (err) {
    console.error('Fatal error running AI recommendation tests:', err);
    process.exit(1);
  }
}

runAITests();
