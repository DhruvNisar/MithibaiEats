const fs = require('fs');
const path = require('path');

const seedDir = path.join(__dirname, '..', 'src', 'seed', 'seedData');
fs.mkdirSync(seedDir, { recursive: true });

const items = [];

function add(name, desc, price, cat, prep, spice, veg, jain, tags, custom) {
  items.push({
    name,
    description: desc,
    price,
    categorySlug: cat,
    preparationTime: prep,
    spicyLevel: spice,
    vegetarian: veg,
    jainAvailable: jain,
    tags,
    image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=600&q=80',
    rating: +(4.1 + Math.random() * 0.8).toFixed(1),
    popularityScore: Math.floor(Math.random() * 80) + 20,
    stock: 60,
    available: true,
    customizations: custom || [
      { name: 'Spice Level', options: ['Regular', 'Mild', 'Extra Spicy'], required: false },
      { name: 'Add-ons', options: ['Extra Chutney', 'Extra Pav', 'Extra Cheese (+₹20)'], required: false }
    ]
  });
}

// 1. Breakfast (15 items)
add("Kanda Poha", "Traditional Maharashtrian flattened rice cooked with onions, roasted peanuts, curry leaves, and mustard seeds.", 35, "breakfast", 5, "mild", true, false, ["poha", "breakfast", "quick", "maharashtrian"]);
add("Batata Poha", "Light flattened rice tossed with diced potatoes, mustard, turmeric, and fresh coriander.", 35, "breakfast", 5, "mild", true, false, ["poha", "batata", "breakfast"]);
add("Upma with Coconut Chutney", "Fluffy roasted semolina tempered with mustard seeds, ginger, curry leaves, and cashews.", 35, "breakfast", 6, "mild", true, true, ["upma", "healthy", "breakfast"]);
add("Tomato Upma", "Tangy roasted semolina upma with finely chopped ripe tomatoes and aromatic spices.", 40, "breakfast", 6, "medium", true, true, ["upma", "tomato", "tangy"]);
add("Desi Ghee Sheera", "Rich, sweet semolina halwa prepared with pure desi ghee and roasted nuts.", 40, "breakfast", 5, "mild", true, true, ["sweet", "halwa", "breakfast"]);
add("Sabudana Khichdi", "Tapioca pearls tossed with roasted crushed peanuts, green chillies, and cumin seeds.", 50, "breakfast", 8, "medium", true, true, ["fasting", "sabudana", "gluten-free"]);
add("Bun Maska", "Freshly baked soft bun generously spread with creamy salted Amul butter.", 30, "breakfast", 2, "mild", true, true, ["bun maska", "cafe", "irani"]);
add("Bun Maska Jam", "Soft bun loaded with salted Amul butter and mixed fruit jam.", 35, "breakfast", 2, "mild", true, true, ["bun maska", "jam", "sweet"]);
add("Poha Chivda Plate", "Crunchy homemade flattened rice chivda with peanuts and dry fruits.", 30, "breakfast", 2, "mild", true, true, ["snack", "crunchy"]);
add("Masala Bread Butter", "Toasted white bread slices seasoned with spicy Mumbai sandwich masala and butter.", 35, "breakfast", 4, "medium", true, true, ["toast", "quick"]);
add("Sweet Toast (Maska Sugar)", "Crisp golden toasted bread sprinkled with butter and granulated sugar.", 30, "breakfast", 4, "mild", true, true, ["sweet", "quick"]);
add("Idli Chutney Breakfast Plate", "2 pieces of steamed rice-lentil cakes served with fresh coconut chutney.", 40, "breakfast", 4, "mild", true, true, ["idli", "south indian", "healthy"]);
add("Medu Vada Breakfast Plate", "2 crispy fried lentil doughnuts served with hot spicy coconut chutney.", 45, "breakfast", 6, "medium", true, true, ["vada", "south indian"]);
add("Idli Vada Mix Plate", "1 soft steamed idli paired with 1 crispy medu vada and coconut chutney.", 45, "breakfast", 5, "medium", true, true, ["idli", "vada", "combo"]);
add("Upma Sheera Duo", "Half plate savory semolina upma combined with half plate sweet desi ghee sheera.", 45, "breakfast", 5, "mild", true, true, ["combo", "breakfast"]);

// 2. South Indian (20 items)
add("Plain Dosa", "Crispy golden crepe made of fermented rice and black gram batter served with sambar and chutneys.", 50, "south-indian", 8, "mild", true, true, ["dosa", "crispy"]);
add("Masala Dosa", "Crisp rice crepe stuffed with spiced mashed potato bhaji, served with sambar and coconut chutney.", 65, "south-indian", 10, "medium", true, false, ["dosa", "masala", "classic"]);
add("Mysore Plain Dosa", "Crispy dosa smeared on the inside with spicy red garlic-chilli Mysore chutney.", 60, "south-indian", 9, "spicy", true, false, ["mysore", "dosa", "spicy"]);
add("Mysore Masala Dosa", "Signature Mumbai college favorite dosa smeared with red spicy chutney and stuffed with potato bhaji.", 75, "south-indian", 11, "spicy", true, false, ["mysore masala", "popular", "mumbai favorite"]);
add("Cheese Burst Dosa", "Crispy golden dosa generously topped and filled with shredded Amul cheese.", 95, "south-indian", 10, "mild", true, true, ["cheese", "dosa", "cheesy"]);
add("Cheese Masala Dosa", "Spiced aloo masala dosa overloaded with grated melted cheese.", 100, "south-indian", 11, "medium", true, false, ["cheese", "masala dosa"]);
add("Ghee Roast Dosa", "Ultra-crispy paper-thin dosa roasted in aromatic desi ghee.", 85, "south-indian", 9, "mild", true, true, ["ghee", "crisp", "south indian"]);
add("Rava Plain Dosa", "Lacy, crisp semolina crepe sprinkled with crushed peppercorns and cumin seeds.", 65, "south-indian", 12, "medium", true, true, ["rava", "crispy"]);
add("Rava Masala Dosa", "Lacy crispy semolina crepe filled with savory potato masala.", 80, "south-indian", 13, "medium", true, false, ["rava", "masala dosa"]);
add("Rava Onion Dosa", "Crispy semolina dosa studded with finely chopped roasted red onions and green chillies.", 75, "south-indian", 12, "medium", true, false, ["rava", "onion"]);
add("Onion Uttapam", "Thick, fluffy fermented rice pancake topped with golden caramelized onions and coriander.", 70, "south-indian", 11, "medium", true, false, ["uttapam", "onion"]);
add("Tomato Uttapam", "Fluffy thick uttapam topped with juicy diced tomatoes and mild spices.", 70, "south-indian", 10, "mild", true, true, ["uttapam", "tomato", "jain friendly"]);
add("Cheese Tomato Uttapam", "Thick uttapam layered with fresh tomatoes and molten Amul cheese.", 90, "south-indian", 11, "mild", true, true, ["uttapam", "cheese", "tomato"]);
add("Onion Tomato Chilly Uttapam", "Spicy thick pancake loaded with onions, tomatoes, and sliced fiery green chillies.", 80, "south-indian", 11, "spicy", true, false, ["uttapam", "spicy"]);
add("Podi Idli (Ghee Tossed)", "Steamed idlis cut into cubes and tossed in gun powder podi masala and melted ghee.", 60, "south-indian", 7, "medium", true, true, ["podi", "idli", "ghee"]);
add("Button Idlis in Sambar (14 pcs)", "14 miniature bite-sized idlis floating in a bowl of piping hot aromatic sambar.", 65, "south-indian", 6, "medium", true, true, ["mini idli", "sambar"]);
add("Dahi Vada (2 pcs)", "Soft lentil dumplings soaked in sweet and spiced whipped yogurt, topped with cumin and chutneys.", 60, "south-indian", 5, "mild", true, true, ["dahi vada", "refreshing", "cold"]);
add("Set Dosa (3 pcs)", "Plate of 3 small, spongy, soft dosas served with creamy vegetable sagu and coconut chutney.", 75, "south-indian", 9, "mild", true, true, ["set dosa", "spongy"]);
add("Spring Dosa", "Fusion dosa rolled with crunchy shredded cabbage, capsicum, carrots, and Indo-Chinese schezwan sauce.", 90, "south-indian", 12, "spicy", true, true, ["fusion", "spring dosa", "schezwan"]);
add("Paper Masala Dosa", "Two-foot long ultra-crispy paper thin dosa accompanied by potato masala bowl.", 110, "south-indian", 14, "medium", true, false, ["paper dosa", "huge", "crisp"]);

// 3. Pav Specials (18 items)
add("Classic Mithibai Vada Pav", "The undisputed Mumbai college king: spicy potato fritter served in fresh pav with fiery garlic chutney.", 22, "pav", 2, "medium", true, false, ["vada pav", "iconic", "mumbai", "bestseller"]);
add("Cheese Vada Pav", "Classic Mumbai vada pav crowned with a thick slice of melting Amul cheese.", 38, "pav", 3, "medium", true, false, ["cheese", "vada pav"]);
add("Schezwan Vada Pav", "Hot vada pav slathered with bold homemade spicy schezwan sauce.", 30, "pav", 3, "spicy", true, false, ["schezwan", "spicy", "vada pav"]);
add("Schezwan Cheese Vada Pav", "Fiery schezwan sauce meets melted cheese inside a warm buttered pav with batata vada.", 45, "pav", 3, "spicy", true, false, ["schezwan", "cheese", "vada pav"]);
add("Ulta Vada Pav", "Inside-out innovation: pav stuffed with potato masala, dipped in gram flour batter and fried crispy.", 40, "pav", 6, "medium", true, false, ["ulta vada pav", "special", "crunchy"]);
add("Cheese Ulta Vada Pav", "Deep-fried inside-out vada pav stuffed with molten cheese and spicy potato mash.", 55, "pav", 7, "medium", true, false, ["cheese", "ulta vada pav"]);
add("Peri Peri Vada Pav", "Crispy batata vada dusted with African peri peri spice blend in buttered bun.", 32, "pav", 3, "spicy", true, false, ["peri peri", "modern", "vada pav"]);
add("Mayonnaise Vada Pav", "Creamy eggless mayonnaise layered with spicy garlic chutney and hot batata vada.", 35, "pav", 3, "mild", true, false, ["mayo", "creamy"]);
add("Punjabi Samosa Pav", "Crisp spiced potato and green pea triangular samosa pressed inside fresh pav with chutneys.", 25, "pav", 2, "medium", true, false, ["samosa pav", "crunchy"]);
add("Cheese Samosa Pav", "Crushed hot samosa paired with grated cheese and tamarind chutney inside pav.", 40, "pav", 3, "medium", true, false, ["cheese", "samosa pav"]);
add("Schezwan Samosa Pav", "Crushed Punjabi samosa loaded with spicy schezwan dip inside warm pav.", 32, "pav", 3, "spicy", true, false, ["schezwan", "samosa"]);
add("Mumbai Misal Pav", "Fiery sprouted moth bean curry garnished with crunchy farsan, chopped onions, lemon, and 2 pavs.", 70, "pav", 6, "extra_spicy", true, false, ["misal pav", "spicy", "maharashtrian"]);
add("Cheese Misal Pav", "Signature fiery misal bowl topped with a lavish layer of grated cheese to balance the heat.", 90, "pav", 7, "spicy", true, false, ["cheese", "misal pav"]);
add("Kat Vada Pav", "Two piping hot batata vadas submerged in spicy aromatic Kolhapuri kat gravy served with 2 pavs.", 65, "pav", 5, "extra_spicy", true, false, ["kat vada", "gravy", "spicy"]);
add("Kutchi Dabeli", "Sweet and spicy potato mash with roasted peanuts, fresh pomegranate pearls, and nylon sev in pav.", 30, "pav", 3, "medium", true, false, ["dabeli", "kutchi"]);
add("Cheese Kutchi Dabeli", "Traditional Kutchi dabeli overflowing with shredded Amul cheddar cheese.", 45, "pav", 4, "medium", true, false, ["cheese", "dabeli"]);
add("Masala Pav Dry", "Pav tossed in butter on hot tawa with chopped onions, tomatoes, and pav bhaji spice blend.", 50, "pav", 6, "spicy", true, false, ["masala pav", "tawa"]);
add("Cheese Butter Masala Pav", "Tawa-toasted butter masala pav smothered in melted cheese and fresh coriander.", 70, "pav", 7, "medium", true, false, ["cheese", "masala pav"]);

// 4. Chaat (18 items)
add("Mumbai Sev Puri (6 pcs)", "Crisp flat puris layered with potatoes, onions, trio of chutneys, blanketed in crunchy sev.", 50, "chaat", 4, "medium", true, false, ["sev puri", "mumbai chaat", "bestseller"]);
add("Cheese Sev Puri (6 pcs)", "Mumbai sev puri topped generously with finely grated cheddar cheese over crunchy sev.", 70, "chaat", 5, "medium", true, false, ["cheese sev puri", "indulgent"]);
add("Sukha Bhel", "Light and crunchy puffed rice mix with roasted peanuts, crushed puris, raw mango, and dry spices.", 40, "chaat", 3, "medium", true, false, ["sukha bhel", "light", "crispy"]);
add("Geela Bhel Puri", "Tangy and wet puffed rice tossed with potatoes, onions, tamarind chutney, and spicy green chilli paste.", 45, "chaat", 3, "medium", true, false, ["bhel puri", "tangy"]);
add("Cheese Bhel Puri", "Classic Mumbai wet bhel tossed with fresh veggies and smothered in grated cheese.", 65, "chaat", 4, "medium", true, false, ["cheese bhel", "fusion"]);
add("Dahi Batata Puri (6 pcs)", "Puffed crispy puris filled with potatoes, sweetened yogurt, tamarind chutney, and nylon sev.", 60, "chaat", 5, "mild", true, false, ["dahi puri", "sweet and sour", "cooling"]);
add("Pani Puri (6 pcs)", "Hollow crispy puris filled with spiced ragda and dunked in chilled spicy mint-coriander water.", 40, "chaat", 3, "spicy", true, false, ["pani puri", "golgappa", "puchka"]);
add("Ragda Puri", "Crisp puris loaded with warm seasoned white pea stew (ragda), chutneys, and sev.", 50, "chaat", 4, "medium", true, false, ["ragda puri", "warm chaat"]);
add("Ragda Pattice (2 pcs)", "Pan-fried golden potato patties drowned in hot ragda gravy, finished with coriander and chutneys.", 65, "chaat", 6, "medium", true, false, ["ragda pattice", "satisfying"]);
add("Samosa Chaat", "Crushed crisp samosa mixed with warm chana masala, drizzled with curd, sweet tamarind chutney, and sev.", 65, "chaat", 6, "medium", true, false, ["samosa chaat", "spicy"]);
add("Papdi Chaat", "Crispy fried flour crackers topped with potatoes, chickpeas, yogurt, mint chutney, and pomegranate.", 55, "chaat", 5, "mild", true, false, ["papdi chaat", "delhi style"]);
add("Aloo Tikki Chaat", "Crispy pan-seared potato patties served with spiced chickpea curry and assorted chutneys.", 60, "chaat", 7, "medium", true, false, ["aloo tikki", "chaat"]);
add("Chinese Bhel", "Deep-fried crispy noodles tossed with shredded cabbage, capsicum, spring onions, and spicy schezwan sauce.", 60, "chaat", 6, "spicy", true, false, ["chinese bhel", "crunchy", "schezwan"]);
add("Cheese Chinese Bhel", "Crispy fried noodles in spicy schezwan sauce generously garnished with shredded cheese.", 80, "chaat", 7, "spicy", true, false, ["cheese", "chinese bhel"]);
add("Khasta Kachori Chaat", "Flaky lentil-stuffed kachori cracked open and filled with curd, onions, and chutneys.", 55, "chaat", 5, "medium", true, false, ["kachori", "chaat", "flaky"]);
add("Corn Bhel", "Boiled sweet corn kernels tossed with onions, tomatoes, chaat masala, lemon juice, and coriander.", 50, "chaat", 4, "mild", true, true, ["corn", "healthy", "chaat"]);
add("Cheese Papdi Chaat", "Crisp papdi crackers with sweet yogurt, mint chutney, and a thick blanket of cheese.", 75, "chaat", 5, "mild", true, false, ["cheese", "papdi chaat"]);
add("Dahi Papdi Chaat", "Traditional papdi chaat immersed in thick chilled sweet dahi and sprinkled with roasted cumin.", 60, "chaat", 5, "mild", true, false, ["dahi papdi", "cooling"]);

// 5. Sandwiches (18 items)
add("Mumbai Veg Sandwich (Plain)", "Three slices of buttered bread packed with sliced beetroot, potatoes, cucumber, tomatoes, and chutney.", 45, "sandwiches", 4, "mild", true, false, ["bombay sandwich", "fresh"]);
add("Veg Toast Sandwich", "Toasted sandwich filled with spiced potato masala, onions, and spicy coriander chutney.", 50, "sandwiches", 7, "medium", true, false, ["toast sandwich", "crispy"]);
add("Cheese Toast Sandwich", "Crisp toasted bread layered with abundant melting Amul cheese and sandwich masala.", 70, "sandwiches", 7, "mild", true, true, ["cheese toast", "comfort"]);
add("Veg Cheese Grill Sandwich", "Large jumbo sandwich stuffed with fresh vegetables, spiced butter, and melted cheese, grilled to crisp perfection.", 90, "sandwiches", 10, "medium", true, false, ["veg cheese grill", "huge", "bestseller"]);
add("Chocolate Toast Sandwich", "Decadent toasted bread loaded with melted chocolate and chocolate sauce.", 70, "sandwiches", 6, "mild", true, true, ["chocolate", "sweet", "toast"]);
add("Cheese Chilli Toast", "Open or closed toast sandwich featuring chopped green chillies and molten gooey cheese.", 80, "sandwiches", 8, "spicy", true, true, ["cheese chilli", "spicy"]);
add("Paneer Capsicum Grill Sandwich", "Marinated paneer cubes tossed with crunchy bell peppers and grilled with cheese.", 105, "sandwiches", 11, "medium", true, false, ["paneer grill", "protein"]);
add("Corn & Cheese Toast", "Golden sweet corn kernels mixed with creamy melted cheese inside toasted bread.", 85, "sandwiches", 8, "mild", true, true, ["corn cheese", "creamy"]);
add("Veg Club Sandwich (Triple Decker)", "Three layers of toasted bread filled with coleslaw, potato masala, cucumber, tomato, and cheese.", 110, "sandwiches", 12, "medium", true, false, ["club sandwich", "filling"]);
add("Aloo Masala Toast", "Street style sandwich filled with savory mustard-tempered potato mash and mint chutney.", 50, "sandwiches", 7, "medium", true, false, ["aloo toast", "street food"]);
add("Spinach Corn Cheese Sandwich", "Creamy sauteed spinach and sweet corn smothered in melted mozzarella and cheddar.", 95, "sandwiches", 10, "mild", true, true, ["spinach corn", "cafe style"]);
add("Green Chutney Cheese Sandwich", "Simple yet addictive combination of spicy homemade green chutney and shredded cheese.", 65, "sandwiches", 5, "spicy", true, true, ["green chutney", "cheese"]);
add("Pahadi Grill Sandwich", "Spicy mountain style chutney with bell peppers, onions, tomatoes, and grilled cheese.", 100, "sandwiches", 10, "extra_spicy", true, false, ["pahadi", "spicy"]);
add("Mayonnaise Veg Grill Sandwich", "Creamy eggless herb mayo with crunchy diced vegetables and cheese in grilled bread.", 95, "sandwiches", 10, "mild", true, false, ["mayo", "grilled"]);
add("Schezwan Cheese Grill Sandwich", "Fiery Schezwan sauce spread generously with vegetables and molten cheese in grill bread.", 100, "sandwiches", 10, "spicy", true, false, ["schezwan", "grill"]);
add("Mushroom Cheese Toast", "Sauteed button mushrooms tossed with herbs, pepper, and cheese on crisp toast.", 95, "sandwiches", 9, "mild", true, false, ["mushroom", "toast"]);
add("Bread Butter Jam (Plain)", "Comforting soft white bread generously buttered and spread with sweet fruit jam.", 30, "sandwiches", 2, "mild", true, true, ["bread butter", "quick"]);
add("Garlic Cheese Toast", "Crisp toasted bread infused with aromatic garlic butter and topped with bubbling cheese.", 75, "sandwiches", 7, "mild", true, true, ["garlic toast", "cheesy"]);

// 6. Frankies & Wraps (15 items)
add("Classic Veg Frankie", "Warm flaky paratha roll filled with spiced potato cutlet, chopped onions, and chatpata frankie masala.", 50, "frankies", 6, "medium", true, false, ["veg frankie", "mumbai wrap"]);
add("Cheese Veg Frankie", "Classic vegetable frankie rolled with a generous shower of grated cheddar cheese.", 70, "frankies", 7, "medium", true, false, ["cheese frankie", "bestseller"]);
add("Schezwan Veg Frankie", "Potato cutlet roll infused with spicy Indo-Chinese schezwan sauce and crunchy onions.", 60, "frankies", 7, "spicy", true, false, ["schezwan frankie", "spicy"]);
add("Schezwan Cheese Frankie", "Spicy schezwan frankie wrapped with rich melted cheese.", 75, "frankies", 7, "spicy", true, false, ["schezwan cheese", "popular"]);
add("Paneer Frankie", "Spiced marinated cottage cheese batons wrapped with crisp onions and tangy frankie vinegar chillies.", 80, "frankies", 8, "medium", true, false, ["paneer frankie", "protein"]);
add("Paneer Cheese Frankie", "Succulent spiced paneer roll stuffed with extra grated cheese.", 95, "frankies", 8, "medium", true, false, ["paneer cheese", "filling"]);
add("Schezwan Paneer Frankie", "Tender paneer tossed in fiery schezwan wok sauce and rolled in crispy paratha.", 90, "frankies", 8, "spicy", true, false, ["schezwan paneer", "spicy"]);
add("Manchurian Frankie", "Crisp vegetable manchurian balls tossed in soya-chilli glaze rolled in a warm wrap.", 70, "frankies", 8, "medium", true, false, ["manchurian", "chinese wrap"]);
add("Cheese Corn Frankie", "Sweet American corn kernels and melted cheese rolled with special seasoning.", 80, "frankies", 7, "mild", true, true, ["corn cheese", "kid friendly"]);
add("Mayonnaise Paneer Frankie", "Creamy eggless mayonnaise and tender spiced paneer rolled in flaky flatbread.", 90, "frankies", 8, "mild", true, false, ["mayo paneer", "creamy"]);
add("Spicy Aloo Tikki Frankie", "Crispy pan-fried aloo tikki wrapped with mint chutney, onions, and chaat spices.", 55, "frankies", 6, "spicy", true, false, ["aloo tikki", "spicy"]);
add("Maggi Frankie", "Fun college fusion: spiced cooked Maggi noodles rolled inside a warm buttery wrap.", 65, "frankies", 8, "medium", true, false, ["maggi frankie", "fusion"]);
add("Double Cheese Frankie", "Overloaded with mozzarella and cheddar cheese with savory potato filling.", 85, "frankies", 7, "mild", true, false, ["double cheese", "cheesy"]);
add("Chana Masala Frankie", "Flavorful spiced chickpea roll with onions, lemon juice, and tangy frankie masala.", 60, "frankies", 7, "medium", true, false, ["chana", "protein"]);
add("Paneer Makhani Frankie", "Cottage cheese simmered in rich creamy makhani tomato sauce rolled in flatbread.", 95, "frankies", 9, "mild", true, false, ["makhani", "paneer"]);

// 7. Snacks & Fast Food (16 items)
add("Batata Vada (Plate of 2)", "Two steaming hot spiced mashed potato balls fried in gram flour batter served with chutneys.", 35, "snacks", 3, "medium", true, false, ["batata vada", "mumbai snack"]);
add("Punjabi Samosa (Plate of 2)", "Two large golden crispy pastry pyramids stuffed with spiced potatoes and green peas.", 40, "snacks", 3, "medium", true, false, ["samosa", "crispy"]);
add("Veg Cutlet (Plate of 2)", "Heart-shaped crumb-coated deep-fried mixed vegetable cutlets served with tomato ketchup.", 45, "snacks", 6, "mild", true, false, ["cutlet", "tea time"]);
add("Cheese Corn Balls (6 pcs)", "Crispy breaded golden bites filled with molten cheese and sweet corn.", 75, "snacks", 7, "mild", true, true, ["cheese balls", "party snack"]);
add("Veg Spring Rolls (6 pcs)", "Crisp golden wonton sheets rolled with sauteed shredded vegetables, served with dip.", 70, "snacks", 8, "medium", true, true, ["spring roll", "chinese"]);
add("Salted French Fries", "Golden crisp potato fries tossed with light salt, served with mayonnaise and ketchup.", 60, "fast-food", 6, "mild", true, false, ["fries", "salted", "crisp"]);
add("Peri Peri French Fries", "Hot crispy French fries shaken in a spicy and zesty African peri peri seasoning.", 75, "fast-food", 6, "spicy", true, false, ["peri peri fries", "spicy"]);
add("Cheese Loaded Fries", "Crispy French fries smothered in warm cheese sauce and jalapeño bits.", 95, "fast-food", 7, "mild", true, false, ["cheese fries", "loaded"]);
add("Bread Pakoda (Plate of 2)", "Spiced potato sandwich coated in gram flour batter and fried until golden.", 40, "snacks", 5, "medium", true, false, ["bread pakoda", "monsoon"]);
add("Moong Dal Bhajiya", "Crunchy and airy yellow moong lentil fritters served with spicy green chutney.", 50, "snacks", 6, "medium", true, true, ["bhajiya", "pakoda"]);
add("Kanda Bhajiya (Onion Pakoda)", "Crisp, thinly sliced onion fritters deep fried with carom seeds and green chillies.", 45, "snacks", 6, "medium", true, false, ["kanda bhajiya", "onion pakoda"]);
add("Crispy Butter Corn", "Steamed sweet corn kernels tossed in melted butter, black salt, and lemon juice.", 50, "snacks", 4, "mild", true, true, ["corn", "butter"]);
add("Hara Bhara Kebab (4 pcs)", "Pan-seared spiced spinach, green peas, and cottage cheese patties garnished with cashews.", 70, "snacks", 8, "mild", true, false, ["hara bhara", "healthy snack"]);
add("Veg Nuggets (6 pcs)", "Crispy crumbed vegetarian nuggets served with honey mustard and garlic mayo.", 65, "fast-food", 6, "mild", true, false, ["nuggets", "finger food"]);
add("Sabudana Vada (Plate of 2)", "Crisp on the outside, soft on the inside tapioca pearl and potato patties served with sweet curd.", 55, "snacks", 7, "medium", true, true, ["sabudana vada", "fasting"]);
add("Cheese Garlic Pops (8 pcs)", "Bite-sized crumbed potato bites bursting with garlic butter and liquid cheese.", 80, "fast-food", 7, "medium", true, true, ["garlic pops", "cheese"]);

// 8. Fresh Juices (16 items)
add("Fresh Mosambi Juice", "Sweet lime juice freshly extracted and served chilled with black salt.", 50, "juices", 3, "mild", true, true, ["mosambi", "fresh juice", "healthy"]);
add("Fresh Orange Juice", "Freshly squeezed Nagpur orange juice rich in Vitamin C.", 55, "juices", 3, "mild", true, true, ["orange juice", "citrus"]);
add("Fresh Watermelon Juice", "Hydrating and naturally sweet red watermelon juice served ice cold.", 45, "juices", 3, "mild", true, true, ["watermelon", "hydrating"]);
add("Fresh Pineapple Juice", "Tangy and sweet tropical pineapple juice with a hint of roasted cumin.", 50, "juices", 3, "mild", true, true, ["pineapple", "tangy"]);
add("Ganga Jamuna Juice", "Iconic Mumbai juice stall blend: freshly pressed sweet lime and sweet orange juice.", 55, "juices", 3, "mild", true, true, ["ganga jamuna", "mumbai special"]);
add("Mara Mari Juice", "Deliciously tangy fusion of fresh pineapple and sweet lime juices.", 55, "juices", 3, "mild", true, true, ["mara mari", "favorite"]);
add("Apple Beet Carrot (ABC) Juice", "Powerhouse detox blend of fresh red apples, earthy beetroot, and sweet carrots.", 75, "juices", 4, "mild", true, true, ["abc juice", "detox", "healthy"]);
add("Cold Sugarcane Juice", "Sweet, natural sugarcane juice infused with fresh ginger, mint, and lemon juice.", 35, "juices", 2, "mild", true, true, ["sugarcane", "refreshing"]);
add("Fresh Pomegranate (Anaar) Juice", "Antioxidant-rich ruby red pomegranate juice squeezed to perfection.", 80, "juices", 4, "mild", true, true, ["anaar", "pomegranate"]);
add("Lemon Mint Cooler Juice", "Fresh lime juice crushed with fragrant garden mint leaves and crushed ice.", 40, "juices", 3, "mild", true, true, ["lemon mint", "cooling"]);
add("Black Grape Juice", "Seedless sweet black grapes blended into a rich purple refreshing juice.", 60, "juices", 3, "mild", true, true, ["grape juice", "sweet"]);
add("Kiwi Cooler Juice", "Tangy green kiwi blended with chilled water and black salt.", 70, "juices", 4, "mild", true, true, ["kiwi", "exotic"]);
add("Kokum Sharbat", "Traditional Konkani cooling drink prepared with wild mangosteen extract, cumin, and rock salt.", 35, "juices", 2, "mild", true, true, ["kokum", "cooling", "digestive"]);
add("Lemon Iced Tea", "Brewed black tea chilled and flavored with lemon syrup and fresh mint sprigs.", 45, "juices", 2, "mild", true, true, ["iced tea", "tea"]);
add("Fresh Sweet Lime Mint Cooler", "Sweet lime juice topped with sparkling club soda and muddled mint leaves.", 60, "juices", 3, "mild", true, true, ["cooler", "soda"]);
add("Guava Chilli Cooler", "Ripe pink guava nectar served with a chilli-salt rimmed glass.", 60, "juices", 3, "medium", true, true, ["guava chilli", "spicy sweet"]);

// 9. Milkshakes & Hot Beverages (16 items)
add("Chikoo Milkshake", "Creamy sapodilla (chikoo) blended with chilled milk and a scoop of vanilla ice cream.", 65, "shakes", 4, "mild", true, true, ["chikoo", "shake", "creamy"]);
add("Chocolate Milkshake", "Rich Dutch cocoa blended with full cream chilled milk and chocolate syrup.", 65, "shakes", 4, "mild", true, true, ["chocolate shake", "rich"]);
add("Cold Bournvita", "Nostalgic favorite: thick chilled milk whipped with malty Bournvita powder and chocolate sprinkles.", 50, "shakes", 3, "mild", true, true, ["bournvita", "nostalgic"]);
add("Mango Milkshake", "Sweet Alphonso mango pulp blended with rich milk into a velvety golden shake.", 75, "shakes", 4, "mild", true, true, ["mango", "alphonso"]);
add("Fresh Strawberry Shake", "Seasonal Mahabaleshwar strawberries pureed with chilled milk and ice cream.", 75, "shakes", 4, "mild", true, true, ["strawberry", "seasonal"]);
add("Banana Milkshake", "Fresh ripe bananas blended with honey, cardamom, and cold milk.", 50, "shakes", 3, "mild", true, true, ["banana", "energy"]);
add("Cold Coffee with Vanilla Ice Cream", "Strong brewed coffee blended with chilled milk and topped with vanilla ice cream.", 70, "coffee", 4, "mild", true, true, ["cold coffee", "bestseller"]);
add("KitKat Thickshake", "Crisp KitKat chocolate bars crushed and blended into a thick milkshake with chocolate drizzle.", 90, "shakes", 5, "mild", true, true, ["kitkat", "thickshake"]);
add("Oreo Cookie Milkshake", "Crunchy Oreo cookies spun with vanilla ice cream and full cream milk.", 85, "shakes", 5, "mild", true, true, ["oreo", "milkshake"]);
add("Rose Milk", "Chilled milk infused with aromatic sweet Damask rose syrup.", 45, "shakes", 2, "mild", true, true, ["rose milk", "cooling"]);
add("Kesar Badam Milk (Chilled)", "Saffron and crushed almond infused chilled milk with cardamom essence.", 60, "shakes", 3, "mild", true, true, ["kesar badam", "royal"]);
add("Mithibai Cutting Chai", "The pulse of college life: strong boiled black tea with milk and crushed ginger.", 15, "tea", 2, "mild", true, true, ["cutting chai", "tea", "essential"]);
add("Adrak Elaichi Masala Chai", "Aromatic Indian tea infused with fresh ginger, cardamom pods, and cinnamon.", 20, "tea", 3, "mild", true, true, ["masala chai", "ginger"]);
add("South Indian Filter Coffee", "Strong chicory coffee decoction frothed with boiling hot milk in stainless steel dabarah.", 30, "coffee", 3, "mild", true, true, ["filter coffee", "authentic"]);
add("Hot Nescafe Coffee", "Creamy frothed instant Nescafe coffee with a sprinkle of cocoa powder.", 25, "coffee", 3, "mild", true, true, ["nescafe", "hot coffee"]);
add("Black Coffee (Americano Style)", "Clean, piping hot black coffee without milk or sugar.", 25, "coffee", 2, "mild", true, true, ["black coffee", "keto"]);

// 10. Combos & Jain Specials (12 items)
add("Vada Pav & Cutting Chai Combo", "1 iconic Mithibai Vada Pav paired with 1 piping hot ginger cutting chai.", 32, "combos", 3, "medium", true, false, ["combo", "vada pav", "chai", "deal"]);
add("Samosa Pav & Filter Coffee Combo", "1 hot crispy Punjabi Samosa Pav accompanied by 1 South Indian filter coffee.", 50, "combos", 4, "medium", true, false, ["combo", "samosa", "coffee"]);
add("Masala Dosa & Filter Coffee Combo", "Golden crisp Masala Dosa served with sambar, chutney, and aromatic filter coffee.", 85, "combos", 10, "medium", true, false, ["combo", "dosa", "coffee"]);
add("Misal Pav & Sweet Lassi Combo", "Spicy Mumbai Misal Pav paired with a tall glass of soothing sweet lassi.", 110, "combos", 7, "spicy", true, false, ["combo", "misal", "lassi"]);
add("Sev Puri & Fresh Mosambi Juice Combo", "1 plate Mumbai Sev Puri along with 1 glass freshly squeezed sweet lime juice.", 90, "combos", 5, "medium", true, false, ["combo", "sev puri", "juice"]);
add("Veg Cheese Grill & Cold Coffee Combo", "Jumbo Veg Cheese Grill Sandwich served with iced cold coffee.", 150, "combos", 11, "medium", true, false, ["combo", "grill", "coffee"]);
add("Jain Raw Banana Vada Pav", "Authentic Jain vada pav prepared with seasoned raw green bananas, no onion or garlic, in fresh pav.", 25, "jain-food", 3, "medium", true, true, ["jain", "vada pav", "banana"]);
add("Jain Raw Banana Samosa Pav", "Crispy samosa filled with spiced raw banana and green pea stuffing, served in pav.", 30, "jain-food", 3, "medium", true, true, ["jain", "samosa"]);
add("Jain Sev Puri (6 pcs)", "Crisp puris topped with diced cucumber, tomatoes, cumin date chutney, green herb chutney, and sev.", 50, "jain-food", 4, "medium", true, true, ["jain", "sev puri"]);
add("Jain Cheese Toast Sandwich", "Toasted sandwich with tomatoes, capsicum, cucumber, and cheese seasoned with Jain masala.", 75, "jain-food", 7, "mild", true, true, ["jain", "cheese toast"]);
add("Jain Batata Poha", "Steamed beaten rice seasoned with green peas, roasted peanuts, mustard seeds, and lemon juice.", 35, "jain-food", 5, "mild", true, true, ["jain", "poha"]);
add("Jain Tomato Uttapam", "Fluffy rice pancake topped with fresh diced tomatoes, capsicum, and coriander.", 70, "jain-food", 10, "mild", true, true, ["jain", "uttapam"]);

console.log(`Total Ground Floor Items: ${items.length}`);
fs.writeFileSync(path.join(seedDir, 'groundFloor.json'), JSON.stringify(items, null, 2));
console.log('Saved groundFloor.json');
