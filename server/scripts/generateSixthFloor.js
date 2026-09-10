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
    image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    rating: +(4.0 + Math.random() * 0.9).toFixed(1),
    popularityScore: Math.floor(Math.random() * 80) + 20,
    stock: 50,
    available: true,
    customizations: custom || [
      { name: 'Spice Level', options: ['Medium', 'Mild', 'Extra Spicy'], required: false },
      { name: 'Bread/Rice Choice', options: ['With 2 Butter Rotis', 'With Steamed Rice', 'With Jeera Rice (+₹15)'], required: false }
    ]
  });
}

// 1. North Indian Curries (20 items)
add("Paneer Butter Masala", "Cubes of fresh cottage cheese simmered in a velvety, rich tomato, butter, and cashew gravy.", 130, "north-indian", 12, "mild", true, true, ["paneer", "makhani", "curry", "bestseller"]);
add("Kadai Paneer", "Cottage cheese and crisp bell peppers wok-tossed in freshly ground coriander and red chilli masala.", 135, "north-indian", 13, "spicy", true, false, ["kadai paneer", "spicy"]);
add("Shahi Paneer", "Royal dish of paneer cubes cooked in a fragrant white onion, almond, and saffron cream sauce.", 140, "north-indian", 12, "mild", true, true, ["shahi paneer", "royal", "creamy"]);
add("Palak Paneer", "Fresh spinach puree slow-simmered with garlic, cumin, cream, and tender cottage cheese cubes.", 125, "north-indian", 12, "medium", true, false, ["palak paneer", "spinach", "healthy"]);
add("Paneer Tikka Masala", "Charcoal-grilled marinated paneer cubes drenched in spicy, aromatic onion-tomato gravy.", 145, "north-indian", 14, "spicy", true, false, ["tikka masala", "tandoori"]);
add("Paneer Bhurji Gravy", "Scrambled cottage cheese cooked with onions, tomatoes, green chillies, and aromatic spices.", 135, "north-indian", 10, "medium", true, false, ["paneer bhurji", "protein"]);
add("Mutter Paneer", "Home-style comforting curry made with green peas and paneer cubes in tomato gravy.", 120, "north-indian", 11, "medium", true, true, ["mutter paneer", "comfort"]);
add("Malai Kofta", "Melt-in-mouth cottage cheese and potato dumplings bathed in a luxurious sweet-savory cashew cream sauce.", 140, "north-indian", 14, "mild", true, true, ["malai kofta", "indulgent"]);
add("Mix Vegetable Handi", "Medley of seasonal cauliflower, carrots, beans, and peas cooked in earthen pot style spices.", 110, "north-indian", 11, "medium", true, false, ["mix veg", "handi"]);
add("Veg Kolhapuri", "Fiery and robust mixed vegetable curry cooked with toasted sesame, coconut, and whole red chillies.", 115, "north-indian", 12, "extra_spicy", true, false, ["kolhapuri", "fiery", "spicy"]);
add("Aloo Gobi Masala", "Pan-fried potatoes and tender cauliflower florets spiced with turmeric, cumin, and ginger.", 95, "north-indian", 10, "medium", true, false, ["aloo gobi", "homestyle"]);
add("Dum Aloo Kashmiri", "Baby potatoes simmered in a yogurt-based gravy scented with fennel and dry ginger.", 110, "north-indian", 12, "mild", true, false, ["dum aloo", "kashmiri"]);
add("Amritsari Chole", "Slow-cooked dark chickpeas infused with tea leaves, roasted cumin, pomegranate seeds, and ginger.", 100, "north-indian", 10, "medium", true, false, ["chole", "punjabi"]);
add("Punjabi Rajma Masala", "Kidney beans slow-cooked to melt-in-mouth tenderness with onions, tomatoes, and garam masala.", 100, "north-indian", 10, "medium", true, false, ["rajma", "classic"]);
add("Dal Makhani", "Black lentils and kidney beans slow-simmered overnight with butter, cream, and mild spices.", 115, "north-indian", 10, "mild", true, true, ["dal makhani", "creamy", "popular"]);
add("Dal Tadka", "Yellow toor dal tempered with ghee, cumin seeds, garlic, red chillies, and asafoetida.", 90, "north-indian", 8, "medium", true, false, ["dal tadka", "ghee"]);
add("Dal Fry", "Comforting yellow lentil stew cooked with onions, tomatoes, and green chillies.", 85, "north-indian", 8, "medium", true, false, ["dal fry", "homestyle"]);
add("Kaju Curry (Cashew Gravy)", "Roasted whole cashews simmered in an indulgent tomato butter gravy.", 150, "north-indian", 13, "mild", true, true, ["kaju curry", "rich"]);
add("Mushroom Masala", "Plump button mushrooms cooked with sauteed bell peppers in a spicy onion gravy.", 130, "north-indian", 12, "medium", true, false, ["mushroom", "curry"]);
add("Veg Jalfrezi", "Sauteed julienned vegetables and paneer strips tossed with tangy tomato vinegar glaze.", 120, "north-indian", 11, "medium", true, false, ["jalfrezi", "tangy"]);

// 2. Meals & Thalis (12 items)
add("Mithibai Deluxe Punjabi Thali", "Grand thali: Paneer Butter Masala, Dal Makhani, Mix Veg, Jeera Rice, 2 Butter Naan, Raita, Gulab Jamun, Salad.", 180, "meals", 15, "medium", true, false, ["deluxe thali", "feast", "bestseller"]);
add("Mini Student Thali", "Student budget friendly: Dal Fry, Paneer Sabzi, Jeera Rice, 3 Phulkas, and Pickle.", 110, "meals", 10, "medium", true, false, ["mini thali", "budget", "filling"]);
add("Amritsari Chole Bhature", "2 giant puffed golden bhaturas served with spicy Amritsari chole, pickled onions, and green chilli.", 120, "meals", 10, "spicy", true, false, ["chole bhature", "iconic"]);
add("Rajma Chawal Bowl", "Generous bowl of fragrant steamed basmati rice smothered in rich Punjabi rajma gravy.", 95, "meals", 7, "medium", true, false, ["rajma chawal", "comfort"]);
add("Chole Chawal Bowl", "Steamed basmati rice topped with spicy Amritsari chole, onions, and lemon wedge.", 95, "meals", 7, "medium", true, false, ["chole chawal", "quick lunch"]);
add("Dal Makhani Rice Bowl", "Fragrant jeera rice layered with velvety Dal Makhani and a swirl of cream.", 105, "meals", 7, "mild", true, true, ["dal makhani rice", "rich"]);
add("Kadhi Pakoda Chawal Bowl", "Crisp onion and gram flour pakodas simmered in tangy spiced yogurt kadhi over steamed rice.", 90, "meals", 7, "medium", true, false, ["kadhi chawal", "tangy"]);
add("Paneer Butter Masala Rice Bowl", "Steamed basmati rice accompanied by rich creamy Paneer Butter Masala.", 120, "meals", 8, "mild", true, true, ["paneer bowl", "lunch"]);
add("Jain Special Deluxe Thali", "Complete Jain meal: Jain Paneer Gravy, Jain Dal Fry, Jain Mix Veg, 3 Rotis, Steamed Rice, Sweet, Salad.", 170, "meals", 15, "mild", true, true, ["jain thali", "pure jain"]);
add("Chole Kulche Plate", "2 soft spiced tandoori kulchas served with spicy dry-style Amritsari chole and green chutney.", 110, "meals", 9, "spicy", true, false, ["chole kulche", "delhi style"]);
add("Paneer Paratha Thali", "2 large tandoori Paneer Parathas served with Dal Makhani, sweet curd, and mixed pickle.", 140, "meals", 12, "medium", true, false, ["paneer paratha thali", "filling"]);
add("Aloo Paratha Student Meal", "2 stuffed spiced potato parathas served with fresh curd, Amul butter cube, and pickle.", 100, "meals", 10, "medium", true, false, ["aloo paratha", "breakfast lunch"]);

// 3. Roti & Indian Breads (10 items)
add("Tawa Roti with Butter (2 pcs)", "Soft, puffed whole wheat rotis coated with fresh butter.", 25, "north-indian", 4, "mild", true, true, ["roti", "phulka"]);
add("Plain Tandoori Roti", "Traditional whole wheat flatbread baked inside clay tandoor oven.", 20, "north-indian", 5, "mild", true, true, ["tandoori roti"]);
add("Butter Tandoori Roti", "Clay oven roasted wheat roti brushed with melted Amul butter.", 25, "north-indian", 5, "mild", true, true, ["butter roti"]);
add("Plain Naan", "Soft, leavened refined flour flatbread baked crisp in tandoor.", 35, "north-indian", 6, "mild", true, true, ["plain naan"]);
add("Butter Naan", "Fluffy tandoori naan brushed generously with melted butter.", 45, "north-indian", 6, "mild", true, true, ["butter naan"]);
add("Garlic Naan", "Tandoor baked naan studded with minced roasted garlic and fresh coriander.", 55, "north-indian", 7, "medium", true, false, ["garlic naan", "bestseller"]);
add("Cheese Garlic Naan", "Decadent naan stuffed with molten cheese and topped with garlic butter.", 80, "north-indian", 8, "mild", true, false, ["cheese garlic naan", "cheesy"]);
add("Laccha Paratha", "Multi-layered crispy flaky whole wheat paratha baked in tandoor.", 40, "north-indian", 7, "mild", true, true, ["laccha paratha"]);
add("Pudina Paratha", "Flaky layered tandoori paratha infused with fragrant dried mint powder.", 45, "north-indian", 7, "mild", true, true, ["pudina paratha"]);
add("Missi Roti", "Nutritious spiced gram flour and wheat flatbread with carom seeds and fenugreek.", 35, "north-indian", 6, "medium", true, true, ["missi roti"]);

// 4. Rice & Biryani (15 items)
add("Mithibai Veg Dum Biryani", "Layered fragrant basmati rice with marinated spiced vegetables, mint, fried onions, and saffron.", 130, "biryani", 12, "medium", true, false, ["dum biryani", "bestseller"]);
add("Paneer Tikka Biryani", "Smoky charcoal tandoor roasted paneer cubes layered with aromatic basmati rice and biryani gravy.", 150, "biryani", 13, "spicy", true, false, ["paneer biryani", "tikka"]);
add("Hyderabadi Veg Biryani", "Fiery Nizami style rice preparation cooked in dum with fried onions and spices, served with raita.", 140, "biryani", 13, "spicy", true, false, ["hyderabadi", "spicy"]);
add("Matka Dum Biryani", "Fragrant vegetable biryani sealed and slow-baked in traditional earthen clay pot.", 155, "biryani", 14, "medium", true, false, ["matka biryani", "clay pot"]);
add("Awadhi Vegetable Biryani", "Subtly spiced royal Lucknowi style biryani scented with kewra water and rose essence.", 145, "biryani", 13, "mild", true, true, ["awadhi", "aromatic"]);
add("Jeera Rice", "Basmati rice sauteed with aromatic cumin seeds and a touch of desi ghee.", 75, "rice", 5, "mild", true, true, ["jeera rice", "side"]);
add("Steamed Basmati Rice", "Long-grain fragrant steamed white basmati rice.", 60, "rice", 4, "mild", true, true, ["steamed rice", "plain"]);
add("Ghee Rice", "Fragrant basmati rice gently tossed with pure desi ghee, cashews, and whole spices.", 90, "rice", 6, "mild", true, true, ["ghee rice", "rich"]);
add("Veg Pulao", "Mildly spiced basmati rice tossed with garden fresh peas, carrots, and french beans.", 95, "rice", 8, "mild", true, true, ["veg pulao", "comfort"]);
add("Kashmiri Pulao", "Sweet-scented saffron rice loaded with dry fruits, fresh pomegranate pearls, and apple cubes.", 120, "rice", 9, "mild", true, true, ["kashmiri pulao", "dry fruit"]);
add("Curd Rice with South Indian Tadka", "Cooling mashed rice mixed with fresh yogurt and tempered with mustard, curry leaves, and ginger.", 75, "rice", 4, "mild", true, true, ["curd rice", "cooling", "digestive"]);
add("Dal Khichdi with Desi Ghee", "Comforting yellow moong dal and rice porridge tempered with garlic, cumin, and hot desi ghee.", 90, "rice", 8, "mild", true, false, ["dal khichdi", "comfort food"]);
add("Palak Khichdi", "Nutritious blend of moong lentils, rice, and pureed spinach topped with brown garlic.", 95, "rice", 9, "medium", true, false, ["palak khichdi", "healthy"]);
add("Tawa Pulao (Mumbai Street Style)", "Basmati rice stir-fried on large iron tawa with pav bhaji butter masala, tomatoes, and capsicum.", 100, "rice", 9, "spicy", true, false, ["tawa pulao", "mumbai street"]);
add("Cheese Tawa Pulao", "Mumbai tawa pulao finished with a generous blanket of melted Amul cheese.", 125, "rice", 10, "spicy", true, false, ["cheese tawa pulao", "cheesy"]);

// 5. Chinese & Indo-Chinese (26 items)
add("Veg Hakka Noodles", "Wok-tossed thin noodles with crunchy cabbage, bell peppers, carrots, spring onions, and soya sauce.", 90, "chinese", 8, "medium", true, false, ["hakka noodles", "chinese classic"]);
add("Schezwan Hakka Noodles", "Spicy stir-fried noodles tossed with homemade fiery schezwan pepper sauce and vegetables.", 105, "chinese", 8, "spicy", true, false, ["schezwan noodles", "spicy"]);
add("Chilli Garlic Noodles", "Noodles tossed with roasted crushed garlic flakes, spicy red chillies, and spring onion greens.", 100, "chinese", 8, "spicy", true, false, ["chilli garlic", "garlicky"]);
add("Burnt Garlic Noodles", "Fragrant wok-charred noodles infused with golden fried garlic chips.", 105, "chinese", 8, "medium", true, false, ["burnt garlic", "aromatic"]);
add("Singapore Rice Noodles", "Thin vermicelli noodles wok-tossed with curry powder, crunchy bell peppers, and bean sprouts.", 115, "chinese", 9, "medium", true, false, ["singapore noodles", "curry flavor"]);
add("Veg Fried Rice", "Fluffy long grain rice stir-fried with finely diced vegetables, garlic, and light soya sauce.", 90, "chinese", 8, "mild", true, false, ["fried rice", "classic"]);
add("Schezwan Fried Rice", "Wok-fried rice tossed with fiery red schezwan sauce, capsicum, and spring onions.", 105, "chinese", 8, "spicy", true, false, ["schezwan rice", "bestseller"]);
add("Triple Schezwan Fried Rice", "Mumbai cult favorite: layers of schezwan rice, crispy noodles, and spicy vegetable manchurian gravy.", 145, "chinese", 12, "spicy", true, false, ["triple schezwan", "mumbai favorite", "huge"]);
add("Burnt Garlic Fried Rice", "Aromatic stir-fried rice loaded with crunchy golden brown fried garlic cloves.", 105, "chinese", 8, "medium", true, false, ["burnt garlic rice"]);
add("Hong Kong Fried Rice", "Sweet and spicy stir-fried rice with baby corn, mushrooms, and dry red chillies.", 115, "chinese", 9, "medium", true, false, ["hong kong rice"]);
add("Veg Manchurian Dry (8 pcs)", "Crispy deep-fried mixed vegetable balls tossed in dry ginger, garlic, green chilli, and coriander glaze.", 100, "indo-chinese", 9, "medium", true, false, ["manchurian dry", "starter"]);
add("Veg Manchurian Gravy", "Savory vegetable dumplings simmered in rich dark soya-garlic Chinese gravy.", 105, "indo-chinese", 10, "medium", true, false, ["manchurian gravy", "main course"]);
add("Paneer Chilli Dry", "Crisp coated cottage cheese cubes wok-tossed with capsicum, onions, garlic, and green chillies.", 130, "indo-chinese", 10, "spicy", true, false, ["paneer chilli", "protein starter"]);
add("Paneer Chilli Gravy", "Soft paneer cubes simmered in a spicy, tangy soya-chilli broth with crunchy bell peppers.", 135, "indo-chinese", 11, "spicy", true, false, ["paneer chilli gravy"]);
add("Crispy Thread Paneer", "Paneer fingers wrapped in delicate noodle strands and fried golden crisp with schezwan dip.", 135, "indo-chinese", 11, "medium", true, false, ["thread paneer", "crispy"]);
add("Honey Chilli Potato", "Crispy fried potato batons glazed in sweet honey, roasted sesame seeds, and spicy red chilli sauce.", 100, "indo-chinese", 9, "medium", true, false, ["honey chilli", "sweet and spicy"]);
add("Dragon Paneer", "Crispy paneer strips tossed in sweet and fiery red dragon sauce with roasted cashews.", 140, "indo-chinese", 11, "spicy", true, false, ["dragon paneer", "chef special"]);
add("Crispy Fried Corn Schezwan", "Golden fried sweet corn kernels tossed with peppers, garlic, and schezwan spice.", 95, "indo-chinese", 8, "medium", true, false, ["crispy corn", "chinese"]);
add("Veg Spring Rolls with Sweet Chilli Dip (6 pcs)", "Crispy rolled wonton wraps filled with stir-fried Chinese vegetables.", 85, "indo-chinese", 8, "mild", true, true, ["spring roll", "finger food"]);
add("Chinese Bhel (Wok Tossed)", "Crispy fried noodles, cabbage, onions, and capsicum tossed in hot spicy schezwan sauce.", 75, "indo-chinese", 6, "spicy", true, false, ["chinese bhel", "quick snack"]);
add("Veg American Chopsuey", "Crispy fried noodle mound topped with sweet and tangy sweet-sour vegetable gravy.", 120, "indo-chinese", 11, "mild", true, false, ["chopsuey", "sweet sour"]);
add("Mushroom Chilli Dry", "Button mushrooms sauteed in high flame with dark soya sauce, celery, and green chillies.", 125, "indo-chinese", 10, "spicy", true, false, ["mushroom chilli"]);
add("Babycorn Mushroom Schezwan", "Crisp babycorn spears and fresh button mushrooms tossed in spicy schezwan sauce.", 125, "indo-chinese", 10, "spicy", true, false, ["babycorn", "schezwan"]);
add("Paneer 65", "South-meets-Chinese spicy yoghurt and curry leaf marinated crispy paneer cubes.", 130, "indo-chinese", 10, "spicy", true, false, ["paneer 65", "crispy"]);
add("Veg Kothey (Pan Fried)", "Pan-seared vegetable dumplings glazed with sesame oil and light soya sauce.", 95, "indo-chinese", 9, "mild", true, false, ["kothey", "dumplings"]);
add("Hakka Noodles & Manchurian Combo Bowl", "Half portion Veg Hakka Noodles served with hot vegetable Manchurian gravy.", 130, "combos", 9, "medium", true, false, ["combo", "noodles manchurian"]);

// 6. Maggi Specials (16 items)
add("Classic Masala Maggi", "Nostalgic yellow 2-minute noodles cooked with authentic tastemaker broth.", 40, "maggi", 5, "mild", true, false, ["maggi", "classic", "comfort"]);
add("Double Masala Maggi", "Maggi noodles prepared with extra tastemaker and chopped green chillies.", 45, "maggi", 5, "medium", true, false, ["double masala", "spicy"]);
add("Cheese Maggi", "Hot steaming Maggi noodles smothered in a thick layer of melted Amul cheese.", 65, "maggi", 6, "mild", true, false, ["cheese maggi", "bestseller"]);
add("Butter Masala Maggi", "Maggi tossed with a big pat of melting salted butter and extra spices.", 55, "maggi", 5, "mild", true, false, ["butter maggi"]);
add("Schezwan Maggi", "Noodles spiked with a dollop of spicy homemade schezwan sauce.", 55, "maggi", 6, "spicy", true, false, ["schezwan maggi", "spicy"]);
add("Vegetable Loaded Maggi", "Maggi packed with sauteed green peas, carrots, onions, tomatoes, and capsicum.", 55, "maggi", 7, "mild", true, false, ["veg maggi", "veggies"]);
add("Peri Peri Maggi", "Spicy noodles dusted with zesty African peri peri masala seasoning.", 55, "maggi", 6, "spicy", true, false, ["peri peri", "maggi"]);
add("Cheese Garlic Maggi", "Aromatic noodles sauteed with minced garlic butter and melted cheese.", 75, "maggi", 6, "medium", true, false, ["garlic cheese", "maggi"]);
add("Corn & Cheese Maggi", "Sweet golden corn kernels and molten cheese folded into hot noodles.", 70, "maggi", 6, "mild", true, true, ["corn cheese maggi"]);
add("Paneer Tikka Maggi", "Spiced paneer cubes and capsicum tossed into masala Maggi noodles.", 80, "maggi", 7, "medium", true, false, ["paneer maggi", "protein"]);
add("Chilli Cheese Maggi", "Fiery green chillies and molten gooey cheese over steaming Maggi.", 70, "maggi", 6, "spicy", true, false, ["chilli cheese maggi"]);
add("Tadka Maggi (Desi Style)", "Maggi tempered with cumin seeds, mustard, curry leaves, and green chillies.", 50, "maggi", 6, "medium", true, false, ["tadka maggi"]);
add("Pahadi Maggi", "Mountain station style soupy Maggi cooked with ginger, garlic, and crushed pepper.", 50, "maggi", 6, "medium", true, false, ["pahadi maggi", "soupy"]);
add("Italian Herb Maggi", "Maggi seasoned with oregano, chilli flakes, basil, and olive oil.", 60, "maggi", 6, "mild", true, false, ["italian maggi", "fusion"]);
add("Mayonnaise Cheese Maggi", "Ultra creamy Maggi whipped with eggless mayo and melted cheese.", 75, "maggi", 6, "mild", true, false, ["mayo maggi"]);
add("Midnight Street Maggi", "Dry roasted Maggi cooked with butter, fried onions, and extra spices.", 55, "maggi", 6, "medium", true, false, ["street maggi"]);

// 7. Pav Bhaji & Fast Food (14 items)
add("Mithibai Special Pav Bhaji", "Rich, slow-simmered vegetable mash prepared with potatoes, tomatoes, and peas, served with 2 butter-toasted pavs.", 90, "pav", 8, "medium", true, false, ["pav bhaji", "mumbai iconic", "bestseller"]);
add("Butter Pav Bhaji (Extra Maska)", "Pav bhaji topped with a huge melting slab of Amul butter and 2 butter-drenched pavs.", 110, "pav", 8, "medium", true, false, ["butter pav bhaji"]);
add("Cheese Pav Bhaji", "Thick mashed vegetable curry smothered in an avalanche of shredded Amul cheese.", 125, "pav", 9, "medium", true, false, ["cheese pav bhaji", "cheesy"]);
add("Jain Pav Bhaji", "Authentic Jain pav bhaji made from raw green bananas, tomatoes, and capsicum (no potatoes, onions, garlic).", 95, "pav", 8, "medium", true, true, ["jain pav bhaji", "pure jain"]);
add("Khada Pav Bhaji", "Vegetables coarsely crushed rather than pureed, retaining crunchy texture and rich buttery spices.", 105, "pav", 9, "medium", true, false, ["khada pav bhaji"]);
add("Paneer Pav Bhaji", "Savory bhaji studded with soft marinated paneer cubes and topped with butter.", 120, "pav", 9, "medium", true, false, ["paneer pav bhaji"]);
add("Extra Pav (Pair of 2)", "Two soft pavs toasted in golden butter on hot tawa.", 20, "pav", 2, "mild", true, true, ["extra pav", "side"]);
add("Aloo Tikki Burger", "Crispy spiced potato patty layered with tomatoes, cucumber, and creamy eggless mayonnaise in sesame bun.", 65, "burgers", 6, "mild", true, false, ["burger", "aloo tikki"]);
add("Veg Supreme Burger", "Hearty vegetable patty topped with melted cheese slice, lettuce, onions, and tangy burger sauce.", 85, "burgers", 7, "mild", true, false, ["supreme burger", "cheese"]);
add("Crispy Paneer Burger", "Thick spiced paneer slab fried golden, topped with coleslaw, chipotle mayo, and cheese.", 110, "burgers", 8, "medium", true, false, ["paneer burger", "protein"]);
add("Schezwan Burger", "Spicy potato patty tossed in fiery schezwan sauce with shredded cabbage inside soft bun.", 75, "burgers", 7, "spicy", true, false, ["schezwan burger"]);
add("Double Cheese Burger", "Juicy vegetable patty flanked by two slices of melted cheddar cheese and caramelized onions.", 100, "burgers", 7, "mild", true, false, ["double cheese burger"]);
add("Veggie Burger with Fries Combo", "Aloo tikki burger served with a basket of salted golden French fries.", 115, "combos", 8, "mild", true, false, ["burger fries combo"]);
add("Paneer Burger with Fries Combo", "Crispy paneer burger served with peri peri fries and dip.", 160, "combos", 9, "medium", true, false, ["paneer burger combo"]);

// 8. Pizza & Pasta (18 items)
add("Margherita Pizza (7 inch)", "Classic hand-stretched crust with rich Italian herb tomato sauce and melted mozzarella cheese.", 110, "pizza", 12, "mild", true, true, ["margherita", "pizza"]);
add("Cheese Corn Pizza (7 inch)", "Golden sweet corn kernels scattered over a bubbling layer of mozzarella and cheddar cheese.", 130, "pizza", 12, "mild", true, true, ["cheese corn pizza"]);
add("Veggie Supreme Pizza (7 inch)", "Loaded with diced bell peppers, red onions, mushrooms, juicy tomatoes, and black olives.", 145, "pizza", 13, "mild", true, false, ["veggie supreme", "loaded"]);
add("Paneer Makhani Pizza (7 inch)", "Desi fusion: spiced paneer cubes on makhani pizza sauce with onions and coriander.", 155, "pizza", 14, "medium", true, false, ["paneer pizza", "fusion"]);
add("Farmhouse Pizza (7 inch)", "Fresh capsicum, sliced mushrooms, ripe tomatoes, and onions with Italian herbs.", 140, "pizza", 13, "mild", true, false, ["farmhouse", "fresh veggies"]);
add("Spicy Schezwan Pizza (7 inch)", "Fiery Indo-Chinese schezwan base topped with capsicum, onions, and melted cheese.", 135, "pizza", 13, "spicy", true, false, ["schezwan pizza", "spicy"]);
add("Tandoori Paneer Pizza (7 inch)", "Marinated tandoori cottage cheese chunks with crunchy capsicum and mozzarella.", 160, "pizza", 14, "spicy", true, false, ["tandoori pizza"]);
add("Cheese Burst Double Cheese Pizza", "Crust stuffed with hot liquid cheese and crowned with baked cheddar.", 165, "pizza", 14, "mild", true, true, ["cheese burst", "cheesy"]);
add("White Sauce Alfredo Pasta", "Penne pasta tossed in velvety rich cream, butter, garlic, and parmesan style cheese.", 130, "pasta", 11, "mild", true, false, ["alfredo", "white sauce", "creamy"]);
add("Red Sauce Arrabiata Pasta", "Penne pasta simmered in spicy garlic, crushed tomatoes, olive oil, and red chilli flakes.", 125, "pasta", 11, "spicy", true, false, ["arrabiata", "red sauce", "tangy"]);
add("Pink Sauce Mixed Pasta", "The best of both worlds: creamy alfredo meets tangy arrabiata sauce with bell peppers.", 140, "pasta", 12, "medium", true, false, ["pink sauce", "bestseller"]);
add("Cheesy Baked Penne Pasta", "Penne pasta baked in casserole dish under a golden brown crust of mozzarella cheese.", 150, "pasta", 14, "mild", true, false, ["baked pasta", "cheesy"]);
add("Masala Macaroni (Desi Style)", "Elbow macaroni stir-fried street style with onions, tomatoes, green chillies, and chaat masala.", 80, "pasta", 8, "medium", true, false, ["masala macaroni", "desi"]);
add("Aglio Olio Peperoncino", "Spaghetti tossed in extra virgin olive oil, sliced golden garlic, and dried red chilli flakes.", 135, "pasta", 10, "medium", true, false, ["aglio olio", "classic italian"]);
add("Penne Makhani Fusion Pasta", "Tender penne pasta coated in buttery Indian makhani sauce with paneer cubes.", 145, "pasta", 12, "mild", true, false, ["makhani pasta", "fusion"]);
add("Corn & Olive White Sauce Pasta", "Penne pasta with sweet corn, sliced black olives, and rich creamy cheese sauce.", 135, "pasta", 11, "mild", true, true, ["corn olive pasta"]);
add("Cheese Garlic Bread (4 pcs)", "Toasted French baguette slices infused with garlic butter and melted mozzarella.", 85, "fast-food", 7, "mild", true, false, ["garlic bread", "cheesy"]);
add("Exotic Garlic Bread with Jalapeno & Corn", "Garlic bread topped with sweet corn, spicy jalapenos, and bubbling cheese.", 95, "fast-food", 8, "medium", true, false, ["exotic garlic bread"]);

// 9. Beverages & Desserts (15 items)
add("Masala Chaas (Spiced Buttermilk)", "Chilled churned yogurt drink spiced with roasted cumin, black salt, and fresh coriander.", 25, "tea", 2, "mild", true, true, ["chaas", "buttermilk", "cooling"]);
add("Sweet Punjabi Lassi", "Thick, creamy churned sweet yogurt topped with a dollop of malai (clotted cream).", 50, "tea", 3, "mild", true, true, ["lassi", "punjabi", "sweet"]);
add("Mango Lassi", "Alphonso mango pulp whipped with rich sweet curd and green cardamom.", 65, "tea", 3, "mild", true, true, ["mango lassi", "thick"]);
add("Nimbu Pani (Fresh Lemonade)", "Refreshing chilled water mixed with freshly squeezed lemon, sugar, and cumin.", 25, "juices", 2, "mild", true, true, ["nimbu pani", "refreshing"]);
add("Fresh Lime Soda (Sweet/Salt)", "Sparkling club soda mixed with fresh lime juice, sugar syrup, and black rock salt.", 40, "juices", 3, "mild", true, true, ["lime soda", "fizzy"]);
add("Jaljeera Cooler", "Tangy and digestive cumin-mint cooler served with crunchy boondi pearls.", 30, "juices", 2, "medium", true, true, ["jaljeera", "digestive"]);
add("Cold Coffee with Chocolate Drizzle", "Rich blended cold coffee served with Hershey's chocolate syrup swirls.", 65, "coffee", 3, "mild", true, true, ["cold coffee", "beverage"]);
add("Gulab Jamun (Plate of 2)", "Soft fried milk dough dumplings soaked in warm rose and cardamom scented sugar syrup.", 40, "desserts", 2, "mild", true, true, ["gulab jamun", "sweet"]);
add("Rasgulla (Plate of 2)", "Spongy cottage cheese balls simmered in light sugar syrup.", 40, "desserts", 2, "mild", true, true, ["rasgulla", "bengali sweet"]);
add("Warm Gajar Ka Halwa", "Slow-cooked grated carrots with whole milk, mawa, desi ghee, and slivered almonds.", 60, "desserts", 3, "mild", true, true, ["gajar halwa", "winter sweet"]);
add("Moong Dal Halwa", "Rich, nutty roasted yellow lentil halwa prepared in aromatic desi ghee.", 65, "desserts", 3, "mild", true, true, ["moong dal halwa", "rich"]);
add("Vanilla Ice Cream Cup", "Smooth and creamy vanilla bean ice cream scoop.", 35, "ice-cream", 1, "mild", true, true, ["vanilla", "ice cream"]);
add("Chocolate Ice Cream Cup", "Decadent Dutch chocolate ice cream scoop.", 40, "ice-cream", 1, "mild", true, true, ["chocolate", "ice cream"]);
add("Kesar Pista Kulfi", "Traditional dense Indian ice cream flavored with Kashmiri saffron and crunchy pistachios.", 45, "ice-cream", 2, "mild", true, true, ["kulfi", "kesar pista"]);
add("Piping Hot Masala Chai", "Strong brewed college tea with fresh ginger, cinnamon, and cloves.", 15, "tea", 2, "mild", true, true, ["masala chai", "hot tea"]);
add("Paneer Butter Masala + 2 Laccha Parathas Combo", "Tender paneer butter masala served with 2 crispy layered laccha parathas.", 150, "combos", 12, "mild", true, false, ["combo", "paneer paratha"]);
add("Dal Makhani + Jeera Rice Combo", "Slow cooked black lentils with aromatic jeera rice and pickle.", 135, "combos", 10, "mild", true, true, ["combo", "dal makhani"]);
add("Fried Rice + Chilli Paneer Combo", "Veg fried rice bowl paired with spicy cottage cheese chilli gravy.", 150, "combos", 11, "spicy", true, false, ["combo", "chinese"]);
add("Pav Bhaji + Fresh Lime Soda Combo", "Signature Mumbai Pav Bhaji served with refreshing sweet and salty fresh lime soda.", 120, "combos", 9, "medium", true, false, ["combo", "pav bhaji", "soda"]);

console.log(`Total 6th Floor Items: ${items.length}`);
fs.writeFileSync(path.join(seedDir, 'sixthFloor.json'), JSON.stringify(items, null, 2));
console.log('Saved sixthFloor.json');
