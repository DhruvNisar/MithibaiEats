export interface FoodItemPromptInput {
  name: string;
  description?: string;
  categorySlug?: string;
  categoryName?: string;
  tags?: string[];
  spicyLevel?: string;
  vegetarian?: boolean;
  jainAvailable?: boolean;
}

export function generateFoodImagePrompt(item: FoodItemPromptInput): string {
  const name = (item.name || '').trim();
  const desc = (item.description || '').trim();
  const lowerName = name.toLowerCase();
  const lowerDesc = desc.toLowerCase();
  const tags = (item.tags || []).map((t) => t.toLowerCase()).join(' ');
  const combined = `${lowerName} ${lowerDesc} ${tags}`;

  let specificPlating = '';
  let cuisineStyle = 'Indian culinary specialty';

  // 1. South Indian
  if (combined.includes('dosa')) {
    cuisineStyle = 'Authentic South Indian';
    specificPlating = 'large thin golden crispy folded dosa served on a fresh green banana leaf with side stainless steel katoris of white coconut chutney, spicy tomato chutney, and steaming hot lentil sambar';
  } else if (combined.includes('idli') || combined.includes('vada') || combined.includes('medu vada')) {
    cuisineStyle = 'Authentic South Indian tiffin';
    specificPlating = 'soft pillowy steamed white idlis and golden brown crispy medu vada with coconut chutney and hot aromatic sambar garnished with curry leaves';
  } else if (combined.includes('uttapam')) {
    cuisineStyle = 'South Indian';
    specificPlating = 'thick savory golden rice pancake topped with caramelized chopped red onions, ripe tomatoes, green chillies and fresh coriander, served with coconut chutney and sambar';
  }
  // 2. Mumbai Street Food & Chaat
  else if (combined.includes('pav bhaji') || combined.includes('pav-bhaji')) {
    cuisineStyle = 'Iconic Mumbai street food';
    specificPlating = 'thick spiced mashed vegetable bhaji with a generous melting slab of yellow Amul butter on top, served with two golden toasted buttered pav buns, sliced red onions, and a fresh lemon wedge';
  } else if (combined.includes('vada pav') || combined.includes('vadapav')) {
    cuisineStyle = 'Classic Mumbai street food';
    specificPlating = 'golden crispy spiced potato batata vada nestled inside a soft pav bun, smeared with spicy garlic red chutney and tangy green mint chutney, served with a fried salted green chilli';
  } else if (combined.includes('misal')) {
    cuisineStyle = 'Spicy Maharashtrian street food';
    specificPlating = 'steaming bowl of sprouted moth beans in fiery red kat rassa gravy, topped generously with crunchy mixed farsan sev, chopped onions, coriander, served with toasted pav and lemon';
  } else if (combined.includes('samosa')) {
    cuisineStyle = 'Indian street food chaat';
    specificPlating = 'golden flaky crispy samosa crushed in a ceramic bowl, layered with spiced chickpea chole, sweetened thick yogurt, tamarind date chutney, mint coriander chutney, and fine nylon sev';
  } else if (combined.includes('sev puri') || combined.includes('bhel') || combined.includes('dahi puri') || combined.includes('pani puri') || combined.includes('chaat')) {
    cuisineStyle = 'Mumbai street food chaat';
    specificPlating = 'crisp flat papdis artfully arranged and piled high with diced boiled potatoes, sprouted moong, sweetened beaten curd, tangy tamarind chutney, spicy green chutney, mountain of yellow nylon sev and ruby pomegranate seeds';
  }
  // 3. Sandwiches & Toasts
  else if (combined.includes('toast') && !combined.includes('sandwich')) {
    cuisineStyle = 'Mumbai cafe snack';
    specificPlating = 'thick grilled bread toast with melted bubbling golden cheddar cheese, finely chopped green bell peppers, diced green chillies, and oregano herbs cut into triangles';
  } else if (combined.includes('sandwich') || combined.includes('panini')) {
    cuisineStyle = 'Mumbai street cafe grilled sandwich';
    specificPlating = 'triple-decker toasted grilled sandwich cut diagonally showing vibrant layers of spiced potato masala, cucumber slices, beetroot, tomato, gooey melted cheese pull, and spicy green mint chutney';
  }
  // 4. Frankie & Wraps
  else if (combined.includes('frankie') || combined.includes('kathi roll') || combined.includes('wrap')) {
    cuisineStyle = 'Mumbai street style frankie';
    specificPlating = 'warm golden layered roti roll packed with spiced filling, sliced crunchy onions, shredded cabbage, chaat masala, wrapped neatly at the bottom in silver foil, cut diagonally';
  }
  // 5. Indo-Chinese & Maggi
  else if (combined.includes('maggi')) {
    cuisineStyle = 'Indian street-style college special';
    specificPlating = 'steaming hot bowl of 2-minute masala Maggi noodles cooked with sweet corn, green peas, carrots, and melted cheese, fork gently lifting wavy spiced noodles with steam rising';
  } else if (combined.includes('manchurian') || combined.includes('chilli paneer')) {
    cuisineStyle = 'Indo-Chinese street food';
    specificPlating = 'crispy vegetable or paneer balls tossed in a dark glistening soya garlic chilli gravy, garnished generously with freshly chopped spring onion greens and toasted sesame seeds';
  } else if (combined.includes('noodle') || combined.includes('chow mein') || combined.includes('hakka')) {
    cuisineStyle = 'Indo-Chinese street food';
    specificPlating = 'wok-tossed yellow noodles glistening with soya and chilli oil, packed with julienned colorful bell peppers, shredded cabbage, carrots, and spring onions in an authentic shallow wok bowl';
  } else if (combined.includes('fried rice') || combined.includes('schezwan rice')) {
    cuisineStyle = 'Indo-Chinese wok specialty';
    specificPlating = 'vibrant fragrant wok-fried long grain rice with finely diced vegetables, garlic, spring onions, and spicy red Schezwan chili oil, served in a sleek dark ceramic bowl';
  }
  // 6. Biryani, Rice & Thali
  else if (combined.includes('biryani') || combined.includes('pulao')) {
    cuisineStyle = 'Royal Indian aromatic rice dish';
    specificPlating = 'fragrant layered basmati rice infused with saffron, whole spices, caramelized brown onions (birista), fresh mint leaves, roasted cashews, served in an authentic handi pot with creamy vegetable raita on the side';
  } else if (combined.includes('thali') || combined.includes('meal') || combined.includes('executive lunch')) {
    cuisineStyle = 'Grand Indian college thali';
    specificPlating = 'circular polished stainless steel thali platter containing small katoris of paneer curry, yellow dal tadka, dry seasonal vegetable sabzi, steamed basmati rice, warm butter rotis, papad, pickle, and a sweet dessert';
  } else if (combined.includes('paneer') || combined.includes('shahi paneer') || combined.includes('kadai paneer') || combined.includes('palak paneer')) {
    cuisineStyle = 'Rich North Indian curry';
    specificPlating = 'tender cubes of fresh cottage cheese simmered in a velvety aromatic tomato cashew gravy, finished with a spiral swirl of fresh white cream, crushed kasuri methi, and coriander garnish in a copper handi';
  } else if (combined.includes('dal') || combined.includes('makhani') || combined.includes('tadka') || combined.includes('rajma') || combined.includes('chole')) {
    cuisineStyle = 'Homestyle North Indian specialty';
    specificPlating = 'slow-cooked rich lentil curry in a warm ceramic bowl with aromatic sizzling ghee tempering of cumin seeds, dried red Kashmiri chillies, and garlic, garnished with chopped fresh cilantro';
  }
  // 7. Pizza, Pasta & Burgers
  else if (combined.includes('pizza')) {
    cuisineStyle = 'Artisan cafe pizza';
    specificPlating = 'rustic thin-crust wood-fired pizza with blistered crust, rich crushed tomato sauce, molten melted mozzarella cheese, fresh green basil leaves, sliced black olives, and oregano sprinkles';
  } else if (combined.includes('pasta') || combined.includes('penne') || combined.includes('alfredo') || combined.includes('arrabbiata')) {
    cuisineStyle = 'Gourmet Italian cafe pasta';
    specificPlating = 'al dente penne pasta coated evenly in a rich silky sauce, garnished with shaved parmesan cheese, cracked black peppercorns, and fresh parsley in a wide-brim white porcelain pasta bowl';
  } else if (combined.includes('burger')) {
    cuisineStyle = 'Gourmet cafe burger';
    specificPlating = 'tall stacked burger with a toasted golden sesame seed brioche bun, crisp ruffled lettuce, thick crunchy spiced herb potato patty, melted yellow cheddar cheese slice, and ripe red tomato slice';
  }
  // 8. Bakery & Desserts
  else if (combined.includes('croissant') || combined.includes('danish') || combined.includes('puff')) {
    cuisineStyle = 'Artisan French bakery pastry';
    specificPlating = 'flaky golden-brown butter croissant with visible delicate laminated pastry layers, placed on parchment paper with light buttery crumbs and a dusting of powdered sugar';
  } else if (combined.includes('cheesecake') || combined.includes('cake') || combined.includes('pastry') || combined.includes('brownie') || combined.includes('muffin')) {
    cuisineStyle = 'Gourmet bakery dessert';
    specificPlating = 'decadent slice of dessert on a clean dessert plate, glossy chocolate ganache or fruit glaze, delicate berry coulis drizzle, and fresh mint garnish';
  } else if (combined.includes('falooda') || combined.includes('kulfi') || combined.includes('sundae') || combined.includes('ice cream') || combined.includes('gulab jamun')) {
    cuisineStyle = 'Traditional Indian royal dessert';
    specificPlating = 'tall elegant glass layered with vibrant rose syrup, soaked basil sabja seeds, silky vermicelli noodles, chilled rabdi, scoop of pistachio kulfi, and sliced almonds';
  }
  // 9. Beverages
  else if (combined.includes('chaas') || combined.includes('buttermilk')) {
    cuisineStyle = 'Traditional chilled Indian cooler';
    specificPlating = 'tall transparent glass of creamy white spiced buttermilk, garnished with roasted cumin powder, black salt, and finely minced fresh coriander leaves, cool condensation droplets on glass';
  } else if (combined.includes('coffee') || combined.includes('frappe') || combined.includes('latte') || combined.includes('cold brew')) {
    cuisineStyle = 'Specialty cafe coffee';
    specificPlating = 'tall ribbed clear glass of iced cold coffee blended with rich mocha, topped with a velvety swirl of frothy cream, chocolate drizzle, and roasted coffee beans scattered on the wooden coaster';
  } else if (combined.includes('chai') || combined.includes('tea')) {
    cuisineStyle = 'Traditional Mumbai cutting chai';
    specificPlating = 'piping hot aromatic ginger cardamom spiced milk tea in an authentic fluted cutting chai glass with steam curls gently rising, placed beside a crisp Parle-G biscuit on a rustic slate saucer';
  } else if (combined.includes('juice') || combined.includes('shake') || combined.includes('smoothie')) {
    cuisineStyle = 'Freshly prepared chilled beverage';
    specificPlating = 'vibrant freshly pressed chilled fruit beverage in a tall clear glass with crystal ice cubes, fresh citrus slice or berry wedge on the rim, and fine condensation drops';
  }
  // 10. Breakfast & Jain
  else if (combined.includes('poha') || combined.includes('upma')) {
    cuisineStyle = 'Traditional Maharashtrian breakfast';
    specificPlating = 'steaming plate of bright yellow flattened rice cooked with turmeric, crunchy roasted peanuts, mustard seeds, curry leaves, finely grated fresh coconut, and a fresh juicy yellow lemon wedge';
  } else if (combined.includes('salad') || combined.includes('bowl')) {
    cuisineStyle = 'Fresh gourmet protein bowl';
    specificPlating = 'shallow ceramic bowl overflowing with crisp mixed greens, chickpeas, sliced cucumbers, cherry tomatoes, herbs, and light olive oil vinaigrette dressing';
  } else {
    cuisineStyle = 'Fresh authentic Indian dish';
    specificPlating = `appetizingly presented ${name} served on a neutral clean ceramic plate, freshly garnished with herbs and culinary spices`;
  }

  const jainNote = item.jainAvailable
    ? 'pure satvik presentation without root vegetables or alliums, using pure cottage cheese and fresh herbs, '
    : '';

  return `Photorealistic Indian food photography of ${name}, ${cuisineStyle}. ${jainNote}${specificPlating}. Centered composition occupying most of the frame, natural soft restaurant studio lighting, warm appetizing culinary tones, clean minimalist neutral ceramic and dark slate tabletop background, shallow depth of field with sharp focus on food textures, 4k ultra-high detail. Strictly no people, no human hands, no text, no words, no letters, no typography, no restaurant logo, no prices, no rupee symbol, no watermark, no labels.`;
}
