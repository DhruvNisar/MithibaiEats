import { FoodItem } from '../models/FoodItem';
import { Canteen } from '../models/Canteen';
import { config } from '../config/env';

export interface RecommendationRequest {
  budget?: number;
  canteenId?: string;
  canteenSlug?: string;
  vegetarian?: boolean;
  jain?: boolean;
  spiceLevel?: string;
  maxPrepTime?: number;
  craving?: string;
  category?: string;
  query?: string;
}

export interface ScoredFoodItem {
  item: any;
  score: number;
  reason: string;
}

export interface ParsedNLQuery {
  budget?: number;
  canteenSlug?: string;
  vegetarian?: boolean;
  jain?: boolean;
  spiceLevel?: string;
  maxPrepTime?: number;
  cravingKeywords: string[];
  detectedFloorName?: string;
}

/**
 * Intelligent Rule-Based Natural Language Query Parser
 * Extracts budget, dietary constraints, spice level, prep time, canteen floor, and food items from free-form text.
 */
export const parseNLQuery = (queryText: string): ParsedNLQuery => {
  const text = queryText.toLowerCase().trim();
  const result: ParsedNLQuery = {
    cravingKeywords: [],
  };

  // 1. Budget extraction (e.g. "under 100", "under ₹80", "budget 120", "below 150 rs", "for 70")
  const budgetRegexes = [
    /(?:under|below|within|max|budget|upto|less than)\s*(?:rs\.?|inr|₹)?\s*(\d+)/i,
    /(?:rs\.?|inr|₹)\s*(\d+)/i,
    /(\d+)\s*(?:rs|rupees|bucks)/i,
  ];
  for (const regex of budgetRegexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      const b = parseInt(match[1], 10);
      if (b > 10 && b < 1000) {
        result.budget = b;
        break;
      }
    }
  }

  // 2. Prep time extraction (e.g. "5 mins", "in 10 minutes", "quick", "hurry", "fast")
  const timeMatch = text.match(/(\d+)\s*(?:min|mins|minute|minutes)/i);
  if (timeMatch && timeMatch[1]) {
    result.maxPrepTime = parseInt(timeMatch[1], 10);
  } else if (text.includes('quick') || text.includes('fast') || text.includes('hurry') || text.includes('rush') || text.includes('late')) {
    result.maxPrepTime = 10;
  }

  // 3. Dietary constraints
  if (text.includes('jain') || text.includes('no onion') || text.includes('no garlic') || text.includes('swaminarayan')) {
    result.jain = true;
    result.vegetarian = true;
  } else if (text.includes('veg') && !text.includes('non-veg') && !text.includes('nonveg')) {
    result.vegetarian = true;
  }

  // 4. Spice level
  if (text.includes('very spicy') || text.includes('spicy') || text.includes('hot') || text.includes('tikha') || text.includes('extra spicy')) {
    result.spiceLevel = 'spicy';
  } else if (text.includes('medium spicy') || text.includes('medium spice') || text.includes('normal spice')) {
    result.spiceLevel = 'medium';
  } else if (text.includes('mild') || text.includes('sweet') || text.includes('non spicy') || text.includes('bland') || text.includes('not spicy')) {
    result.spiceLevel = 'mild';
  }

  // 5. Canteen floor detection
  if (text.includes('ground') || text.includes('gf') || text.includes('street') || text.includes('juice') || text.includes('south indian')) {
    result.canteenSlug = 'ground';
    result.detectedFloorName = 'Ground Floor Canteen';
  } else if (text.includes('6th') || text.includes('sixth') || text.includes('thali') || text.includes('lunch') || text.includes('chinese') || text.includes('maggi')) {
    result.canteenSlug = '6th';
    result.detectedFloorName = '6th Floor Canteen';
  } else if (text.includes('8th') || text.includes('eighth') || text.includes('bakery') || text.includes('cafe') || text.includes('coffee') || text.includes('terrace') || text.includes('panini')) {
    result.canteenSlug = '8th';
    result.detectedFloorName = '8th Floor Canteen';
  }

  // 6. Food item and craving keywords
  const candidateKeywords = [
    'sandwich', 'toast', 'grilled', 'dosa', 'idli', 'vada', 'pav', 'bhaji', 'misal', 'chaat',
    'bhel', 'sevpuri', 'pani puri', 'frankie', 'roll', 'juice', 'shake', 'smoothie',
    'thali', 'paneer', 'roti', 'dal', 'rice', 'biryani', 'pulao', 'noodles', 'manchurian',
    'fried rice', 'maggi', 'pizza', 'burger', 'pasta', 'cheese', 'chilli',
    'coffee', 'cappuccino', 'iced coffee', 'cold brew', 'croissant', 'muffin', 'cake',
    'brownie', 'dessert', 'salad', 'wrap', 'panini', 'waffle', 'tea', 'chai', 'snack'
  ];

  for (const kw of candidateKeywords) {
    if (text.includes(kw)) {
      result.cravingKeywords.push(kw);
    }
  }

  return result;
};

/**
 * Smart Multi-Criteria Recommendation Engine Grounded in MongoDB Food Data
 */
export const getAIRecommendations = async (params: RecommendationRequest): Promise<{
  recommendations: ScoredFoodItem[];
  summary: string;
  totalMatches: number;
  parsedCriteria?: ParsedNLQuery;
}> => {
  // 1. If query string is provided, extract semantic attributes
  let parsed: ParsedNLQuery | undefined;
  if (params.query) {
    parsed = parseNLQuery(params.query);
  }

  // Merge parameters (explicit params override or augment parsed query)
  const budget = params.budget !== undefined ? params.budget : parsed?.budget;
  const maxPrepTime = params.maxPrepTime !== undefined ? params.maxPrepTime : parsed?.maxPrepTime;
  const vegetarian = params.vegetarian !== undefined ? params.vegetarian : parsed?.vegetarian;
  const jain = params.jain !== undefined ? params.jain : parsed?.jain;
  const spiceLevel = params.spiceLevel || parsed?.spiceLevel;
  const canteenSlug = params.canteenSlug || parsed?.canteenSlug;

  const filter: Record<string, any> = { isActive: true, available: true };

  // Resolve canteen if slug provided
  if (canteenSlug && !params.canteenId) {
    const canteen = await Canteen.findOne({ slug: canteenSlug });
    if (canteen) filter.canteen = canteen._id;
  } else if (params.canteenId) {
    filter.canteen = params.canteenId;
  }

  // Dietary constraints
  if (jain) {
    filter.jainAvailable = true;
  } else if (vegetarian) {
    filter.vegetarian = true;
  }

  // Budget constraint
  if (budget && budget > 0) {
    filter.price = { $lte: budget };
  }

  // Max prep time constraint
  if (maxPrepTime && maxPrepTime > 0) {
    filter.preparationTime = { $lte: maxPrepTime };
  }

  // Fetch candidate food items directly from MongoDB
  let candidates = await FoodItem.find(filter)
    .populate('category', 'name slug icon')
    .populate('canteen', 'name slug floor')
    .lean();

  // If budget or prep time was too strict and returned 0 items, relax slightly to provide nearest matches
  if (candidates.length === 0 && (budget || maxPrepTime)) {
    const relaxedFilter = { ...filter };
    delete relaxedFilter.price;
    delete relaxedFilter.preparationTime;
    candidates = await FoodItem.find(relaxedFilter)
      .populate('category', 'name slug icon')
      .populate('canteen', 'name slug floor')
      .limit(40)
      .lean();
  }

  // Collect keyword tokens for relevance scoring
  const cravingKeywords = [
    ...(parsed?.cravingKeywords || []),
    ...(params.craving ? params.craving.toLowerCase().split(/\s+/).filter((k) => k.length > 2) : []),
  ];

  // 2. Multi-factor scoring algorithm
  const scoredItems: ScoredFoodItem[] = candidates.map((item: any) => {
    let score = 50; // base score
    const reasons: string[] = [];

    // Factor 1: Rating contribution (up to 25 pts)
    score += (item.rating || 4.2) * 5;

    // Factor 2: Popularity contribution (up to 20 pts)
    score += Math.min((item.popularityScore || 0) * 1.8, 20);

    // Factor 3: Spice match
    if (spiceLevel && spiceLevel !== 'any') {
      if (item.spicyLevel === spiceLevel) {
        score += 15;
        reasons.push(`Matches ${item.spicyLevel} spice`);
      }
    }

    // Factor 4: Budget optimization
    if (budget && budget > 0) {
      if (item.price <= budget) {
        score += 15;
        const saving = budget - item.price;
        if (saving > 0) {
          reasons.push(`₹${item.price} (within ₹${budget} budget)`);
        } else {
          reasons.push(`Exact budget fit (₹${item.price})`);
        }
      } else {
        score -= 25; // penalty if relaxed candidate exceeded budget
      }
    }

    // Factor 5: Preparation speed
    if (item.preparationTime <= 7) {
      score += 15;
      reasons.push(`Express ${item.preparationTime}m pickup`);
    } else if (item.preparationTime <= 12) {
      score += 8;
      reasons.push(`Ready in ~${item.preparationTime} mins`);
    }

    // Factor 6: Keyword matching
    if (cravingKeywords.length > 0) {
      const targetText = `${item.name} ${item.description} ${(item.tags || []).join(' ')}`.toLowerCase();
      let matchCount = 0;
      for (const kw of cravingKeywords) {
        if (targetText.includes(kw)) matchCount++;
      }
      if (matchCount > 0) {
        score += matchCount * 25;
        reasons.push(`Matches your craving keywords`);
      }
    }

    // Factor 7: Pure Jain callout
    if (jain && item.jainAvailable) {
      score += 10;
      reasons.push(`100% Pure Jain`);
    }

    // Factor 8: Floor indicator if all canteens were queried
    if (!filter.canteen && item.canteen?.floor) {
      reasons.push(item.canteen.floor);
    }

    if (reasons.length === 0) {
      reasons.push(`Campus favorite rated ${item.rating}★`);
    }

    return {
      item,
      score,
      reason: reasons.join(' • '),
    };
  });

  // Sort descending by calculated score
  scoredItems.sort((a, b) => b.score - a.score);
  const topRecommendations = scoredItems.slice(0, 10);

  // Generate natural language summary
  let summary = `Found ${candidates.length} options matching your preferences.`;
  if (topRecommendations.length > 0) {
    const top = topRecommendations[0].item;
    summary = `Top recommendation: **${top.name}** (₹${top.price}) from **${top.canteen?.name || 'Canteen'}**! Ready in ~${top.preparationTime} mins with a ${top.rating}★ rating.`;
  }

  return {
    recommendations: topRecommendations,
    summary,
    totalMatches: candidates.length,
    parsedCriteria: parsed,
  };
};

/**
 * Conversational AI Assistant with Fallback to Rule-Based Intelligence
 */
export const chatWithAIAssistant = async ({
  message,
  currentCanteenSlug,
  currentCanteenId,
  userPreferences,
}: {
  message: string;
  currentCanteenSlug?: string;
  currentCanteenId?: string;
  userPreferences?: { vegetarian?: boolean; jain?: boolean; spiceLevel?: string };
}): Promise<{
  reply: string;
  recommendations: any[];
  parsedCriteria: ParsedNLQuery;
}> => {
  // 1. Parse natural language message
  const parsed = parseNLQuery(message);

  // Blend in user's profile defaults if not overridden
  const effectiveJain = parsed.jain ?? userPreferences?.jain;
  const effectiveVeg = parsed.vegetarian ?? (effectiveJain ? true : userPreferences?.vegetarian);
  const effectiveSpice = parsed.spiceLevel || userPreferences?.spiceLevel;

  // 2. Fetch recommendations grounded in MongoDB
  const recResult = await getAIRecommendations({
    query: message,
    budget: parsed.budget,
    maxPrepTime: parsed.maxPrepTime,
    vegetarian: effectiveVeg,
    jain: effectiveJain,
    spiceLevel: effectiveSpice,
    canteenSlug: parsed.canteenSlug || currentCanteenSlug,
    canteenId: currentCanteenId,
  });

  const dishes = recResult.recommendations.map((r) => r.item);

  // 3. Generate response: If AI API key is available, use generative model; otherwise use Rule-Based Fallback
  let reply = '';

  if (config.aiApiKey) {
    try {
      // Call external AI API (e.g. Gemini)
      const prompt = `You are "Mithibai Foodie Bot", the official AI campus dining assistant for SVKM Mithibai College (Mumbai).
A student asked: "${message}".
Context:
- Canteens: Ground Floor (Street food, Sandwiches, Chaat), 6th Floor (Thalis, Biryani, Indo-Chinese, Maggi), 8th Floor (Bakery, Gourmet Cafe, Pure Jain counter, Coffee).
- Relevant available dishes from MongoDB:
${dishes.slice(0, 4).map((d: any) => `- ${d.name} (₹${d.price}, ~${d.preparationTime}m prep, ${d.canteen?.name}, ${d.rating}★)`).join('\n')}

Respond in a warm, concise, friendly Mumbai college student tone (under 3 sentences). Recommend the top 1 or 2 dishes and explain why they match the student's request. Mention the canteen floor.`;

      // Example fetch to Gemini / AI API
      const aiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${config.aiApiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (aiResponse.ok) {
        const aiData: any = await aiResponse.json();
        reply = aiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      }
    } catch {
      // Graceful fallback to rule-based generation below
    }
  }

  // Rule-Based Conversational Fallback
  if (!reply) {
    if (dishes.length === 0) {
      reply = `I searched all 3 canteens but couldn't find an exact match for "${message}". Try expanding your budget or checking without dietary restrictions!`;
    } else {
      const top1 = dishes[0];
      const top2 = dishes[1];

      const greetings = ['Hey Mithibai student!', 'Great choice!', 'Here is what I recommend for you:'];
      const greeting = greetings[Math.floor(Math.random() * greetings.length)];

      let recommendationDetail = `I highly recommend the **${top1.name}** for just ₹${top1.price} from the **${top1.canteen?.name || 'canteen'}** (${top1.preparationTime} mins prep, ${top1.rating}★).`;
      if (top2) {
        recommendationDetail += ` Another great option is the **${top2.name}** at ₹${top2.price} (${top2.canteen?.floor}).`;
      }

      if (parsed.budget) {
        recommendationDetail += ` Both fit neatly within your ₹${parsed.budget} budget.`;
      }
      if (parsed.jain) {
        recommendationDetail += ` Prepared with 100% pure Jain ingredients.`;
      }

      reply = `${greeting} ${recommendationDetail} Tap "Add to Cart" to order ahead for quick counter pickup!`;
    }
  }

  return {
    reply,
    recommendations: recResult.recommendations,
    parsedCriteria: parsed,
  };
};
