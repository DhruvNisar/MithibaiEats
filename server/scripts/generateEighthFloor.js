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
    image: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=600&q=80',
    rating: +(4.2 + Math.random() * 0.7).toFixed(1),
    popularityScore: Math.floor(Math.random() * 80) + 20,
    stock: 45,
    available: true,
    customizations: custom || [
      { name: 'Customization', options: ['Regular', 'Make it Jain', 'Extra Sauce'], required: false }
    ]
  });
}

// 1. Bakery & Viennoiserie (18 items)
add("Classic French Butter Croissant", "Flaky, multi-layered golden all-butter French croissant baked fresh daily.", 65, "bakery", 3, "mild", true, true, ["croissant", "bakery", "french"]);
add("Belgian Chocolate Croissant", "Flaky pastry loaded with twin batons of rich Belgian semi-sweet dark chocolate.", 80, "bakery", 3, "mild", true, true, ["pain au chocolat", "chocolate"]);
add("Almond Frangipane Croissant", "Twice-baked croissant filled with rich almond cream and topped with toasted sliced almonds.", 95, "bakery", 4, "mild", true, true, ["almond croissant", "gourmet"]);
add("Wild Blueberry Crumble Muffin", "Moist vanilla muffin bursting with whole blueberries and crowned with cinnamon streusel.", 60, "bakery", 2, "mild", true, true, ["blueberry muffin", "muffin"]);
add("Double Choco-Chip Muffin", "Decadent Dutch cocoa muffin packed with molten dark and milk chocolate chips.", 65, "bakery", 2, "mild", true, true, ["choco muffin", "chocolate"]);
add("Cinnamon Swirl Roll", "Warm rolled pastry ribboned with aromatic Ceylon cinnamon sugar and vanilla cream glaze.", 70, "bakery", 3, "mild", true, true, ["cinnamon roll", "sweet"]);
add("Garlic Herb Breadsticks (4 pcs)", "Crisp baked breadsticks brushed with rosemary garlic butter, served with marinara dip.", 55, "bakery", 5, "mild", true, false, ["breadsticks", "garlic"]);
add("Rosemary Olive Focaccia Slice", "Traditional Italian airy flatbread studded with kalamata olives, sea salt, and fresh rosemary.", 60, "bakery", 3, "mild", true, true, ["focaccia", "italian bread"]);
add("Multigrain Bagel with Cream Cheese", "Toasted dense multigrain bagel spread with whipped Philadelphia-style cream cheese.", 85, "bakery", 5, "mild", true, true, ["bagel", "cream cheese", "healthy"]);
add("Apple Cinnamon Danish", "Puff pastry envelop filled with spiced caramelized apples and vanilla pastry cream.", 75, "bakery", 3, "mild", true, true, ["danish", "apple"]);
add("Banana Walnut Tea Cake Slice", "Moist slice of classic tea cake baked with ripe Cavendish bananas and toasted walnuts.", 50, "bakery", 2, "mild", true, true, ["banana cake", "tea time"]);
add("Marble Swirl Sponge Cake Slice", "Delicate vanilla and chocolate marble sponge cake slice.", 45, "bakery", 2, "mild", true, true, ["marble cake"]);
add("Lemon Poppyseed Loaf Slice", "Zesty citrus sponge cake infused with lemon glaze and crunchy poppy seeds.", 55, "bakery", 2, "mild", true, true, ["lemon loaf", "citrus"]);
add("Molten Choco Lava Cake", "Warm chocolate cake with an irresistible flowing warm liquid chocolate center.", 85, "desserts", 6, "mild", true, true, ["choco lava", "bestseller", "warm dessert"]);
add("Red Velvet Cupcake with Cream Cheese", "Ruby red velvet cake topped with velvety vanilla cream cheese frosting.", 65, "bakery", 2, "mild", true, true, ["red velvet", "cupcake"]);
add("Salted Caramel Cupcake", "Vanilla cupcake filled with gooey salted caramel and crowned with buttercream.", 65, "bakery", 2, "mild", true, true, ["caramel cupcake"]);
add("Belgian Chocolate Glazed Doughnut", "Fluffy yeast doughnut dipped in glossy Belgian dark chocolate ganache.", 60, "bakery", 2, "mild", true, true, ["doughnut", "chocolate"]);
add("Cinnamon Sugar Ring Doughnut", "Classic golden fried doughnut rolled in sweet cinnamon granulated sugar.", 50, "bakery", 2, "mild", true, true, ["cinnamon doughnut"]);

// 2. Gourmet Wraps, Rolls & Paninis (18 items)
add("Paneer Tikka Kathi Roll", "Charcoal spiced paneer cubes, crunchy bell peppers, and mint yoghurt rolled in flaky paratha.", 95, "rolls", 9, "medium", true, false, ["kathi roll", "paneer", "bestseller"]);
add("Smoky BBQ Cottage Cheese Wrap", "Grilled paneer batons tossed in smoky barbecue sauce with caramelized onions and crisp greens.", 105, "wraps", 9, "medium", true, false, ["bbq wrap", "smoky"]);
add("Authentic Falafel & Hummus Wrap", "Crispy chickpea herb falafels, creamy garlic tahini hummus, pickled cucumber, and lettuce in pita wrap.", 95, "wraps", 8, "mild", true, false, ["falafel", "hummus", "mediterranean"]);
add("Mediterranean Grilled Veggie Wrap", "Roasted zucchini, bell peppers, sun-dried tomatoes, and crumbled feta cheese wrapped warm.", 110, "wraps", 9, "mild", true, false, ["mediterranean", "healthy"]);
add("Corn & Spinach Grilled Panini", "Sourdough panini bread pressed with creamed sweet corn, baby spinach, and mozzarella cheese.", 100, "sandwiches", 10, "mild", true, true, ["panini", "corn spinach"]);
add("Pesto Tomato Bocconcini Panini", "Fresh basil pesto, sliced ripe plum tomatoes, and melted mozzarella pressed in ciabatta bread.", 120, "sandwiches", 10, "mild", true, true, ["pesto panini", "italian"]);
add("Mushroom & Caramelized Onion Panini", "Sauteed wild mushrooms, sweet caramelized onions, and swiss style cheese on grilled rye bread.", 115, "sandwiches", 10, "mild", true, false, ["mushroom panini"]);
add("Peri Peri Cottage Cheese Panini", "Spicy peri peri marinated paneer, jalapenos, bell peppers, and melted cheese in toasted panini.", 110, "sandwiches", 10, "spicy", true, false, ["peri peri panini", "spicy"]);
add("Mexican Chipotle Bean Burrito", "Warm flour tortilla loaded with seasoned black beans, Mexican rice, salsa, and guacamole.", 115, "wraps", 10, "medium", true, false, ["burrito", "mexican"]);
add("Crispy Tofu & Avocado Wrap", "Golden sesame-crusted tofu, sliced ripe avocado, and sweet chilli glaze in whole wheat wrap.", 130, "wraps", 10, "mild", true, false, ["tofu wrap", "avocado", "vegan"]);
add("Jain Herb Cottage Cheese Wrap", "Tender paneer tossed in Italian herbs, diced tomatoes, capsicum, and Jain dressing in soft tortilla.", 95, "wraps", 9, "mild", true, true, ["jain wrap", "pure jain"]);
add("Jain Cheese & Sweet Corn Panini", "Golden sweet corn and abundant mozzarella pressed in crusty bread with Jain spices.", 105, "sandwiches", 10, "mild", true, true, ["jain panini"]);
add("Schezwan Cheese Roll", "Spicy Indo-Chinese seasoned potato and bell pepper filling with melted cheese in flaky wrap.", 80, "rolls", 8, "spicy", true, false, ["schezwan roll"]);
add("Harissa Spiced Veggie Wrap", "North African spiced roasted vegetables with garlic yoghurt drizzle in pita bread.", 105, "wraps", 9, "spicy", true, false, ["harissa wrap"]);
add("Greek Salad Pocket Pita", "Warm pita pocket filled with diced cucumber, tomatoes, kalamata olives, feta cheese, and oregano vinaigrette.", 95, "wraps", 6, "mild", true, false, ["pita pocket", "greek"]);
add("Cheesy Jalapeno Quesadilla", "Toasted flour tortilla folded over spicy jalapeno slices, sweet corn, and molten cheddar.", 110, "fast-food", 8, "medium", true, false, ["quesadilla", "mexican"]);
add("Fajita Bell Pepper Quesadilla", "Charred tricolor bell peppers, onions, chipotle salsa, and Monterey Jack cheese in grilled tortilla.", 115, "fast-food", 9, "medium", true, false, ["fajita quesadilla"]);
add("Tandoori Soya Chaap Roll", "High-protein marinated soya chaap pieces grilled in tandoor spices and wrapped in paratha.", 90, "rolls", 9, "medium", true, false, ["soya chaap", "protein"]);

// 3. Healthy Salads & Bowls (16 items)
add("Mediterranean Quinoa Super Salad", "Fluffy organic quinoa tossed with cherry tomatoes, cucumbers, kalamata olives, parsley, and lemon-herb dressing.", 125, "healthy-food", 8, "mild", true, false, ["quinoa salad", "superfood", "gluten-free"]);
add("Sprouts & Sweet Corn Protein Bowl", "Steamed sprouted moong beans and sweet corn kernels seasoned with pink salt, chaat masala, and lime juice.", 75, "healthy-food", 5, "mild", true, true, ["sprouts", "protein", "healthy"]);
add("Eggless Classic Caesar Salad", "Crisp romaine lettuce hearts tossed in creamy parmesan dressing with toasted garlic croutons.", 110, "healthy-food", 7, "mild", true, false, ["caesar salad", "crisp"]);
add("Greek Feta Village Salad", "Chunky cucumbers, heirloom tomatoes, red onions, bell peppers, kalamata olives, and Greek feta slab.", 120, "healthy-food", 7, "mild", true, false, ["greek salad", "fresh"]);
add("Mexican Fiesta Burrito Bowl", "Brown rice base topped with seasoned pinto beans, roasted sweet corn, pico de gallo, and guacamole.", 135, "healthy-food", 9, "medium", true, false, ["burrito bowl", "mexican"]);
add("Teriyaki Tofu Brown Rice Bowl", "Pan-glazed organic tofu steaks served over steamed brown rice, steamed broccoli, and sesame seeds.", 145, "healthy-food", 11, "mild", true, false, ["teriyaki tofu", "protein"]);
add("Roasted Chickpea & Beetroot Salad", "Crispy spiced roasted kabuli chana, roasted ruby beets, baby greens, and tahini dressing.", 110, "healthy-food", 8, "mild", true, false, ["beetroot chickpea", "iron rich"]);
add("Asian Sesame Peanut Soba Noodle Bowl", "Chilled soba noodles tossed with shredded purple cabbage, edamame, and toasted sesame peanut dressing.", 130, "healthy-food", 9, "mild", true, false, ["soba noodles", "asian"]);
add("Rolled Oats & Berry Breakfast Bowl", "Warm rolled oats cooked in almond milk, topped with chia seeds, wild berries, and raw honey.", 95, "healthy-food", 6, "mild", true, true, ["oatmeal", "breakfast"]);
add("Mango Chia Seed Coconut Pudding", "Chilled coconut milk chia seed pudding layered with fresh Alphonso mango puree.", 90, "healthy-food", 4, "mild", true, true, ["chia pudding", "superfood"]);
add("Green Goddess Detox Salad", "Finely chopped green cabbage, cucumbers, baby spinach, and edamame tossed in green herb dressing.", 115, "healthy-food", 7, "mild", true, false, ["green goddess", "detox"]);
add("Lentil & Avocado Superfood Bowl", "Warm beluga and brown lentils tossed with diced hass avocado, sun-dried tomatoes, and lemon olive oil.", 140, "healthy-food", 9, "mild", true, false, ["lentil avocado", "healthy fats"]);
add("Watermelon Mint & Feta Salad", "Juicy cubes of chilled red watermelon, fresh mint leaves, crumbled feta, and balsamic reduction.", 100, "healthy-food", 6, "mild", true, true, ["watermelon feta", "refreshing"]);
add("Steamed Edamame with Pink Sea Salt", "Tender young soybeans in pods steamed fresh and sprinkled with coarse Himalayan pink salt.", 85, "healthy-food", 5, "mild", true, true, ["edamame", "plant protein"]);
add("Cottage Cheese Herb Protein Bowl", "Fresh grilled paneer cubes marinated in Italian herbs, served with sauteed zucchini, bell peppers, and dip.", 135, "healthy-food", 10, "mild", true, false, ["paneer bowl", "keto friendly"]);
add("Mithibai Fresh Garden Salad", "Crisp sliced cucumbers, carrots, beetroots, tomatoes, and green chillies with lemon wedges.", 50, "healthy-food", 4, "mild", true, false, ["garden salad", "raw"]);

// 4. Jain Specialty Counter (18 items)
add("Jain Paneer Makhani Bowl", "Pure Jain cottage cheese cooked in creamy cashew and tomato gravy (no onion, garlic, or root veg) with Jeera Rice.", 145, "jain-food", 11, "mild", true, true, ["jain", "paneer makhani", "pure jain"]);
add("Jain Yellow Dal Fry with Rice", "Yellow lentils tempered with cumin, green chillies, and pure desi ghee served over steamed basmati rice.", 95, "jain-food", 8, "mild", true, true, ["jain dal rice"]);
add("Jain Desi Ghee Moong Khichdi", "Comforting yellow moong and rice khichdi prepared with turmeric, rock salt, and hot desi ghee.", 90, "jain-food", 8, "mild", true, true, ["jain khichdi", "comfort"]);
add("Jain Mumbai Pav Bhaji", "Famous street pav bhaji made from green bananas, ripe tomatoes, bell peppers, and butter, served with 2 pavs.", 100, "jain-food", 9, "medium", true, true, ["jain pav bhaji", "bestseller"]);
add("Jain Cheese Grilled Panini", "Crusty panini bread filled with diced tomatoes, capsicum, sweet corn, and mozzarella cheese.", 105, "jain-food", 10, "mild", true, true, ["jain panini"]);
add("Jain Corn Capsicum Pizza (7 inch)", "Thin crust pizza topped with sweet corn kernels, crunchy green bell peppers, tomato sauce, and mozzarella.", 130, "jain-food", 12, "mild", true, true, ["jain pizza"]);
add("Jain White Sauce Penne Pasta", "Italian penne pasta in rich butter-cream sauce with sweet corn, bell peppers, and parmesan.", 135, "jain-food", 11, "mild", true, true, ["jain pasta"]);
add("Jain Hakka Noodles", "Wok-tossed noodles with shredded cabbage, bell peppers, and light soya sauce (zero onion or garlic).", 95, "jain-food", 9, "medium", true, true, ["jain noodles"]);
add("Jain Veg Fried Rice", "Fragrant wok-fried basmati rice with finely diced capsicum, cabbage, and light seasoning.", 95, "jain-food", 9, "mild", true, true, ["jain fried rice"]);
add("Jain Paneer Manchurian Dry", "Crispy paneer cubes tossed in ginger-free soya chilli glaze with capsicum.", 135, "jain-food", 10, "medium", true, true, ["jain manchurian"]);
add("Jain Raw Banana Cutlet (Plate of 2)", "Crispy golden crumb-coated green banana cutlets served with sweet date chutney.", 50, "jain-food", 6, "mild", true, true, ["jain cutlet"]);
add("Jain Cheese Sev Puri (6 pcs)", "Crispy flat puris with diced tomatoes, raw mango, sweet dates chutney, cheese, and crunchy sev.", 70, "jain-food", 5, "medium", true, true, ["jain sev puri"]);
add("Jain Mayo Veggie Wrap", "Eggless mayo tossed with sweet corn, capsicum, and cottage cheese rolled in warm flatbread.", 90, "jain-food", 8, "mild", true, true, ["jain wrap"]);
add("Jain Chana Masala with Kulcha", "White chickpeas simmered in aromatic tomato and whole spice gravy, served with 2 soft kulchas.", 115, "jain-food", 10, "medium", true, true, ["jain chana"]);
add("Jain Fresh Strawberry Shake", "Pure strawberries blended with rich chilled milk and sugar.", 80, "jain-food", 4, "mild", true, true, ["jain shake"]);
add("Jain Malai Kulfi", "Dense, creamy milk reduction kulfi prepared strictly with pure dairy milk and dry fruits.", 50, "jain-food", 2, "mild", true, true, ["jain kulfi"]);
add("Jain Phulka with Ghee (2 pcs)", "Soft puffed whole wheat rotis smeared with pure desi ghee.", 25, "jain-food", 4, "mild", true, true, ["jain phulka"]);
add("Jain Badam Kheer Bowl", "Slow-cooked creamy rice and milk pudding infused with saffron, cardamom, and almond slivers.", 60, "jain-food", 3, "mild", true, true, ["jain kheer"]);

// 5. Artisan Coffee & Specialty Teas (22 items)
add("Espresso Solo", "Intense, rich 30ml shot of 100% Arabica dark roast coffee with thick golden crema.", 45, "coffee", 2, "mild", true, true, ["espresso", "dark roast"]);
add("Double Shot Espresso (Doppio)", "Double extraction 60ml bold espresso shot for maximum energy.", 65, "coffee", 2, "mild", true, true, ["doppio", "strong coffee"]);
add("Americano (Hot)", "Rich double shot espresso diluted with hot filtered water for a smooth coffee profile.", 60, "coffee", 3, "mild", true, true, ["americano", "hot coffee"]);
add("Classic Cappuccino", "Equal parts rich espresso, steamed whole milk, and thick velvet microfoam, dusted with cocoa.", 80, "coffee", 4, "mild", true, true, ["cappuccino", "coffee favorite"]);
add("Cafe Latte", "Smooth espresso topped with silky steamed milk and a delicate layer of latte art foam.", 85, "coffee", 4, "mild", true, true, ["latte", "creamy"]);
add("Australian Flat White", "Double shot of espresso with thin, velvety steamed microfoam milk.", 90, "coffee", 4, "mild", true, true, ["flat white", "smooth"]);
add("Caramel Macchiato", "Vanilla-flavored steamed milk marked with espresso and topped with rich buttery caramel drizzle.", 105, "coffee", 5, "mild", true, true, ["macchiato", "caramel"]);
add("French Vanilla Latte", "Velvety cafe latte infused with aromatic Madagascar vanilla bean syrup.", 95, "coffee", 4, "mild", true, true, ["vanilla latte"]);
add("Hazelnut Cafe Latte", "Warm espresso and steamed milk flavored with roasted hazelnut syrup.", 95, "coffee", 4, "mild", true, true, ["hazelnut latte"]);
add("Cafe Mocha", "Double espresso blended with rich dark Belgian cocoa and steamed milk, finished with whipped cream.", 100, "coffee", 5, "mild", true, true, ["mocha", "chocolate coffee"]);
add("Iced Americano", "Chilled bold espresso poured over crystal ice cubes and cold water.", 65, "coffee", 3, "mild", true, true, ["iced americano", "refreshing"]);
add("Iced Cafe Latte", "Double shot espresso poured over chilled whole milk and ice.", 90, "coffee", 4, "mild", true, true, ["iced latte", "summer coffee"]);
add("Cold Caramel Frappe", "Blended iced coffee drink whipped with caramel sauce and crowned with whipped cream.", 115, "coffee", 5, "mild", true, true, ["caramel frappe", "frappuccino"]);
add("Hazelnut Cold Coffee Blast", "Thick chilled blended coffee infused with roasted hazelnut puree and vanilla ice cream.", 95, "coffee", 5, "mild", true, true, ["hazelnut coffee", "bestseller"]);
add("Irish Cream Iced Coffee", "Chilled brewed coffee infused with non-alcoholic Irish cream syrup and cream.", 100, "coffee", 4, "mild", true, true, ["irish coffee"]);
add("Mocha Frappuccino", "Thick blended iced espresso with dark chocolate chips and cocoa fudge.", 120, "coffee", 5, "mild", true, true, ["frappuccino", "chocolate"]);
add("Classic Affogato", "A scoop of rich Madagascar vanilla gelato drowned in a shot of piping hot espresso.", 85, "coffee", 3, "mild", true, true, ["affogato", "italian dessert"]);
add("Organic Matcha Green Tea Latte", "Ceremonial Japanese Uji green tea whisked with warm oat or whole milk.", 120, "tea", 5, "mild", true, true, ["matcha", "green tea", "antioxidant"]);
add("Earl Grey Lavender Tea", "Black tea scented with natural bergamot oil and calming French lavender blossoms.", 60, "tea", 4, "mild", true, true, ["earl grey", "black tea"]);
add("Hibiscus Rose Iced Cooler", "Tart Egyptian hibiscus flower infusion brewed cold with sweet rose petals and mint.", 70, "tea", 3, "mild", true, true, ["hibiscus", "iced tea", "caffeine-free"]);
add("Peach Passionfruit Iced Tea", "Brewed Ceylon black tea chilled with ripe peach puree and sweet passionfruit syrup.", 75, "tea", 3, "mild", true, true, ["peach tea", "fruity"]);
add("Golden Turmeric Latte (Haldi Doodh)", "Warming steamed milk infused with fresh Lakadong turmeric, crushed black pepper, and honey.", 65, "tea", 4, "mild", true, true, ["turmeric latte", "immunity"]);

// 6. Gourmet Shakes & Smoothies (20 items)
add("Nutella Hazelnut Thickshake", "Rich spoonfuls of genuine Italian Nutella blended with ice cream and chilled milk.", 110, "shakes", 5, "mild", true, true, ["nutella shake", "bestseller", "indulgent"]);
add("Oreo Overload Monster Shake", "Double portion of crushed chocolate Oreos blended into velvety shake with cookie crumbs.", 95, "shakes", 5, "mild", true, true, ["oreo shake", "favorite"]);
add("Belgian Dark Chocolate Truffle Shake", "Intense 70% dark Belgian cocoa blended into a thick, bittersweet chocolate shake.", 105, "shakes", 5, "mild", true, true, ["dark chocolate", "rich"]);
add("KitKat Crunch Thickshake", "Crispy KitKat wafer bars blended with vanilla malt and chocolate sauce.", 100, "shakes", 5, "mild", true, true, ["kitkat shake"]);
add("Lotus Biscoff Caramel Shake", "Original Belgian spiced Lotus Biscoff cookie spread blended into rich creamy shake.", 125, "shakes", 5, "mild", true, true, ["biscoff", "gourmet shake"]);
add("Ferrero Rocher Royal Shake", "Whole Ferrero Rocher hazelnut chocolates blended with ice cream and chocolate pearls.", 140, "shakes", 6, "mild", true, true, ["ferrero shake", "premium"]);
add("Wild Blueberry Banana Smoothie", "Frozen blueberries, ripe bananas, Greek yogurt, and raw honey pureed into a thick purple smoothie.", 100, "shakes", 5, "mild", true, true, ["blueberry smoothie", "antioxidant"]);
add("Strawberry Greek Yogurt Smoothie", "Fresh Mahabaleshwar strawberries blended with probiotic Greek yogurt and chia seeds.", 95, "shakes", 5, "mild", true, true, ["strawberry smoothie", "probiotic"]);
add("Mango Passionfruit Tropical Smoothie", "Sweet Alphonso mango pulp blended with tangy passionfruit and crushed ice.", 95, "shakes", 5, "mild", true, true, ["tropical smoothie", "mango"]);
add("Green Detox Power Smoothie", "Baby spinach, green apple, cucumber, celery, and lemon juice blended fresh.", 90, "shakes", 5, "mild", true, true, ["green detox", "healthy"]);
add("Peanut Butter Banana Protein Shake", "Creamy roasted peanut butter, ripe bananas, oats, and chilled milk.", 95, "shakes", 5, "mild", true, true, ["protein shake", "peanut butter"]);
add("Salted Caramel Pretzel Shake", "Sweet and salty caramel shake garnished with crunchy salted pretzel pieces.", 110, "shakes", 5, "mild", true, true, ["salted caramel"]);
add("Mixed Berry Antioxidant Shake", "Raspberries, strawberries, and blackberries pureed with chilled sweet milk.", 105, "shakes", 5, "mild", true, true, ["berry shake"]);
add("Cold Bournvita Malt Blast", "Thick chilled malt shake topped with crunchy dry Bournvita granules.", 60, "shakes", 4, "mild", true, true, ["bournvita blast"]);
add("Virgin Pina Colada Cooler", "Refreshing tropical blend of coconut cream, pineapple juice, and crushed ice.", 85, "shakes", 4, "mild", true, true, ["pina colada", "coconut"]);
add("Kiwi Strawberry Yogurt Cooler", "Tangy green kiwi and sweet strawberries layered over chilled yogurt.", 90, "shakes", 4, "mild", true, true, ["kiwi strawberry"]);
add("Creamy Avocado Honey Shake", "Rich and creamy Hass avocado whipped with chilled milk and forest honey.", 120, "shakes", 5, "mild", true, true, ["avocado shake", "healthy fats"]);
add("Dragonfruit Smoothie Bowl", "Vibrant pink pitaya puree topped with granola, chia seeds, sliced bananas, and coconut flakes.", 140, "healthy-food", 7, "mild", true, true, ["dragonfruit bowl", "smoothie bowl"]);
add("Acai Berry Superfood Bowl", "Organic Amazonian acai berry puree crowned with toasted almonds, berries, and pumpkin seeds.", 155, "healthy-food", 7, "mild", true, true, ["acai bowl", "superfood"]);
add("Rose Cardamom Milkshake", "Chilled sweet milk scented with Damask rose petals, cardamom, and pistachio slivers.", 65, "shakes", 3, "mild", true, true, ["rose shake"]);

// 7. Desserts & Gelato (20 items)
add("Warm Walnut Brownie with Gelato", "Fudgy warm walnut chocolate brownie paired with a scoop of Madagascar vanilla gelato.", 95, "desserts", 5, "mild", true, true, ["brownie gelato", "bestseller", "warm dessert"]);
add("Sizzling Brownie on Hot Plate", "Chocolate brownie served on a smoking cast-iron plate with vanilla ice cream and sizzling hot chocolate fudge.", 130, "desserts", 6, "mild", true, true, ["sizzling brownie", "showstopper"]);
add("New York Baked Cheesecake Slice", "Dense, velvety smooth traditional baked cheesecake on a golden graham cracker crust.", 120, "desserts", 3, "mild", true, true, ["cheesecake", "new york"]);
add("Blueberry Compote Cheesecake Slice", "Classic baked cheesecake topped with glossy homemade wild blueberry compote.", 135, "desserts", 3, "mild", true, true, ["blueberry cheesecake"]);
add("Classic Italian Tiramisu Cup", "Espresso-soaked ladyfinger cookies layered with velvety mascarpone cheese and cocoa dust.", 115, "desserts", 3, "mild", true, true, ["tiramisu", "italian dessert"]);
add("Vanilla Bean Panna Cotta", "Silky cooked cream infused with vanilla beans and served with fresh raspberry coulis.", 95, "desserts", 3, "mild", true, true, ["panna cotta"]);
add("Cinnamon Sugar Churros (4 pcs)", "Crisp golden fried Spanish churros rolled in cinnamon sugar with warm Belgian chocolate dip.", 90, "desserts", 6, "mild", true, true, ["churros", "spanish"]);
add("Belgian Waffle with Maple Syrup", "Freshly pressed crispy waffle served with salted butter cube and pure maple syrup.", 95, "desserts", 7, "mild", true, true, ["waffle", "maple"]);
add("Nutella Strawberry Waffle", "Warm golden waffle smothered in melted Nutella and topped with fresh sliced strawberries.", 125, "desserts", 8, "mild", true, true, ["nutella waffle", "popular"]);
add("Royal Rabdi Falooda", "Rich creamy rabdi layered with sweet rose syrup, basil seeds (sabja), vermicelli, and kulfi.", 90, "desserts", 4, "mild", true, true, ["rabdi falooda", "mumbai special"]);
add("Kesar Badam Falooda", "Saffron scented chilled milk with almonds, rose jelly, sabja seeds, and kulfi scoop.", 85, "desserts", 4, "mild", true, true, ["kesar falooda"]);
add("Rose Kulfi Falooda", "Fragrant rose milk topped with sweet noodles, soaked basil seeds, and malai kulfi.", 80, "desserts", 4, "mild", true, true, ["rose falooda"]);
add("Belgian Dark Chocolate Gelato Scoop", "Dense, artisanal churned Italian dark chocolate gelato.", 65, "ice-cream", 2, "mild", true, true, ["chocolate gelato"]);
add("Sicilian Pistachio Gelato Scoop", "Authentic nutty gelato crafted with roasted Sicilian green pistachios.", 75, "ice-cream", 2, "mild", true, true, ["pistachio gelato"]);
add("Alphonso Mango Sorbet Scoop", "Refreshing dairy-free frozen fruit sorbet made from 100% pure Alphonso mangoes.", 60, "ice-cream", 2, "mild", true, true, ["mango sorbet", "vegan"]);
add("Dark Chocolate Truffle Pastry", "Layers of moist chocolate sponge and rich bittersweet chocolate ganache.", 75, "desserts", 2, "mild", true, true, ["truffle pastry"]);
add("French Opera Pastry Slice", "Sophisticated almond sponge cake soaked in coffee syrup, layered with ganache and coffee buttercream.", 95, "desserts", 2, "mild", true, true, ["opera cake"]);
add("Warm Spiced Apple Pie", "Flaky butter crust filled with tender cinnamon-spiced apples, served warm.", 85, "desserts", 5, "mild", true, true, ["apple pie"]);
add("Gulab Jamun Sundae", "Warm soft gulab jamuns nestled under a scoop of cold vanilla ice cream and pistachio dust.", 75, "desserts", 4, "mild", true, true, ["gulab jamun sundae", "fusion"]);
add("Malai Kulfi on a Stick", "Traditional slow-reduced milk kulfi on stick flavored with green cardamom.", 40, "ice-cream", 1, "mild", true, true, ["malai kulfi"]);

// 8. Gourmet Quick Bites & Fries (18 items)
add("Truffle Parmesan Fries", "Crispy French fries tossed in aromatic white truffle oil, sea salt, and grated parmesan cheese.", 110, "fast-food", 7, "mild", true, false, ["truffle fries", "gourmet"]);
add("Peri Peri Curly Fries", "Spiraled crispy potatoes seasoned with fiery African peri peri spice seasoning.", 85, "fast-food", 7, "spicy", true, false, ["curly fries", "spicy"]);
add("Loaded Nachos Supreme", "Crunchy corn tortilla chips smothered in warm cheese sauce, refried beans, salsa, and sour cream.", 120, "fast-food", 8, "mild", true, false, ["loaded nachos", "cheesy"]);
add("Crispy Mozzarella Cheese Sticks (5 pcs)", "Golden herb-crumbed melted mozzarella batons served with warm Italian marinara sauce.", 95, "fast-food", 7, "mild", true, true, ["mozzarella sticks", "cheese pull"]);
add("Jalapeno Cheese Poppers (6 pcs)", "Crispy breaded bites stuffed with diced spicy jalapeno peppers and molten cream cheese.", 90, "fast-food", 7, "medium", true, true, ["jalapeno poppers", "spicy cheese"]);
add("Classic Hummus with Warm Pita Bread", "Velvety chickpea tahini hummus drizzled with extra virgin olive oil, served with 2 warm soft pitas.", 95, "fast-food", 6, "mild", true, false, ["hummus pita", "mediterranean"]);
add("Garlic Herb Bruschetta (3 pcs)", "Toasted garlic baguette slices topped with marinated tomatoes, fresh basil, and balsamic glaze.", 80, "fast-food", 6, "mild", true, false, ["bruschetta", "italian"]);
add("Wild Mushroom & Cheese Crostini (3 pcs)", "Crisp crostini toasts topped with garlic sauteed button mushrooms and melted fontina cheese.", 95, "fast-food", 7, "mild", true, false, ["mushroom crostini"]);
add("Spinach & Corn Baked Tart (2 pcs)", "Individual butter pastry tart shells baked with creamy spinach, sweet corn, and gruyere cheese.", 85, "bakery", 6, "mild", true, true, ["spinach tart"]);
add("Crinkle Cut Golden Fries", "Classic thick crinkle cut potato fries salted and served with garlic mayo.", 70, "fast-food", 6, "mild", true, false, ["crinkle fries"]);
add("Sweet Potato Crispy Fries", "Naturally sweet roasted orange sweet potato fries sprinkled with smoked paprika and sea salt.", 90, "fast-food", 7, "mild", true, false, ["sweet potato fries", "healthy snack"]);
add("Crisp Beer-Battered Onion Rings", "Thick sweet onion rings fried in airy batter, served with ranch dipping sauce.", 75, "fast-food", 6, "mild", true, false, ["onion rings"]);
add("Chilli Cheese Loaded Fries Bowl", "Crispy fries layered with spiced Mexican chilli beans, cheese sauce, and sliced jalapenos.", 115, "fast-food", 8, "medium", true, false, ["chilli cheese fries"]);
add("Crispy Fried Cheese Ravioli (6 pcs)", "Breaded four-cheese raviolis fried crisp and served with spicy arrabiata dipping sauce.", 100, "fast-food", 8, "medium", true, false, ["fried ravioli", "italian snack"]);
add("Warm Cheese Fondue Bowl with Bread Cubes", "Warm pot of molten emmental and cheddar cheese dip accompanied by toasted bread cubes.", 140, "fast-food", 8, "mild", true, true, ["cheese fondue", "sharing"]);
add("Fresh Guacamole with Tortilla Chips", "Hand-mashed ripe avocado with lime, cilantro, onions, and tomatoes with crisp salted chips.", 125, "fast-food", 6, "mild", true, false, ["guacamole", "healthy snack"]);
add("Pesto & Mozzarella Toast Melts", "Toasted sourdough bread slathered with genovese pesto and covered in melted mozzarella.", 85, "sandwiches", 7, "mild", true, true, ["pesto toast"]);
add("Baked Mac & Cheese Pot", "Elbow macaroni in bubbling three-cheese sauce baked with herb breadcrumb crust.", 130, "pasta", 10, "mild", true, true, ["mac and cheese", "comfort food"]);

console.log(`Total 8th Floor Items: ${items.length}`);
fs.writeFileSync(path.join(seedDir, 'eighthFloor.json'), JSON.stringify(items, null, 2));
console.log('Saved eighthFloor.json');
