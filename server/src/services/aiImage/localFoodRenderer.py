import os
import sys
import math
import random
import argparse
from PIL import Image, ImageDraw, ImageFilter, ImageEnhance

def clamp(val, min_v, max_v):
    return max(min_v, min(val, max_v))

def create_radial_gradient(width, height, center_color, edge_color, radius=None):
    img = Image.new('RGB', (width, height), edge_color)
    draw = ImageDraw.Draw(img)
    cx, cy = width // 2, height // 2
    if radius is None:
        radius = int(math.hypot(cx, cy))
    
    # Draw smooth gradient concentric circles
    steps = 40
    for i in range(steps, 0, -1):
        r = int(radius * (i / steps))
        factor = i / steps
        r_col = int(edge_color[0] * factor + center_color[0] * (1 - factor))
        g_col = int(edge_color[1] * factor + center_color[1] * (1 - factor))
        b_col = int(edge_color[2] * factor + center_color[2] * (1 - factor))
        draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=(r_col, g_col, b_col))
    
    return img.filter(ImageFilter.GaussianBlur(15))

def add_surface_texture(base_img, opacity=0.08):
    width, height = base_img.size
    noise = Image.new('L', (width, height))
    pixels = noise.load()
    rng = random.Random(42)
    for y in range(0, height, 2):
        for x in range(0, width, 2):
            val = rng.randint(40, 215)
            pixels[x, y] = val
            if x + 1 < width: pixels[x + 1, y] = val
            if y + 1 < height: pixels[x, y + 1] = val
            if x + 1 < width and y + 1 < height: pixels[x + 1, y + 1] = val
    
    noise = noise.filter(ImageFilter.GaussianBlur(1))
    noise_rgb = Image.merge('RGB', (noise, noise, noise))
    return Image.blend(base_img, noise_rgb, opacity)

def draw_shadow(draw, box, blur_radius=20, offset=(0, 15), fill=(10, 10, 14, 180)):
    x0, y0, x1, y1 = box
    ox, oy = offset
    draw.ellipse([x0 + ox, y0 + oy, x1 + ox, y1 + oy], fill=fill)

def render_food_image(dish_name, category='', tags='', output_path='output.webp'):
    width, height = 800, 600
    combined = f'{dish_name.lower()} {category.lower()} {tags.lower()}'
    
    # Use dish name to seed deterministic RNG for variation
    seed_val = sum(ord(c) * (i + 1) for i, c in enumerate(dish_name))
    rng = random.Random(seed_val)

    # Base background: Dark warm slate / rustic timber
    bg_center = (45, 40, 42)
    bg_edge = (18, 16, 18)
    img = create_radial_gradient(width, height, bg_center, bg_edge)
    img = add_surface_texture(img, 0.05)
    
    overlay = Image.new('RGBA', (width, height), (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    
    cx, cy = 400, 310

    # Categorize dish presentation
    is_dosa = 'dosa' in combined or 'uttapam' in combined
    is_idli_vada = 'idli' in combined or 'vada' in combined
    is_pav_bhaji = 'pav bhaji' in combined or 'pav-bhaji' in combined or 'misal' in combined
    is_sandwich = 'sandwich' in combined or 'toast' in combined or 'panini' in combined
    is_frankie = 'frankie' in combined or 'roll' in combined or 'wrap' in combined
    is_biryani = 'biryani' in combined or 'pulao' in combined or 'rice' in combined
    is_noodles = 'noodle' in combined or 'maggi' in combined or 'chow mein' in combined or 'pasta' in combined
    is_curry = 'paneer' in combined or 'dal' in combined or 'curry' in combined or 'sabzi' in combined or 'chole' in combined or 'rajma' in combined
    is_thali = 'thali' in combined or 'meal' in combined or 'lunch' in combined
    is_pizza = 'pizza' in combined
    is_burger = 'burger' in combined
    is_bakery = 'croissant' in combined or 'cake' in combined or 'pastry' in combined or 'brownie' in combined or 'cheesecake' in combined or 'muffin' in combined
    is_beverage = 'chaas' in combined or 'coffee' in combined or 'tea' in combined or 'chai' in combined or 'juice' in combined or 'shake' in combined or 'smoothie' in combined or 'beverage' in combined or 'falooda' in combined
    is_chaat = 'chaat' in combined or 'bhel' in combined or 'sev puri' in combined or 'dahi puri' in combined or 'samosa' in combined
    is_poha = 'poha' in combined or 'upma' in combined or 'breakfast' in combined

    # Plating Geometry
    if is_beverage:
        # Tall glassware with beverage
        # Shadow
        draw.ellipse([cx - 90, cy + 150, cx + 90, cy + 210], fill=(0, 0, 0, 160))
        # Wooden / marble coaster
        draw.ellipse([cx - 105, cy + 140, cx + 105, cy + 195], fill=(70, 52, 40, 240), outline=(120, 95, 75, 255), width=3)
        # Glass body
        gx0, gy0, gx1, gy1 = cx - 75, cy - 160, cx + 75, cy + 160
        
        # Determine beverage color
        if 'coffee' in combined:
            liq_col = (92, 58, 38)
            froth_col = (215, 195, 175)
        elif 'chaas' in combined:
            liq_col = (240, 240, 235)
            froth_col = (250, 250, 245)
        elif 'chai' in combined or 'tea' in combined:
            liq_col = (185, 115, 65)
            froth_col = (220, 160, 110)
        elif 'mango' in combined or 'orange' in combined:
            liq_col = (245, 145, 25)
            froth_col = (255, 200, 120)
        elif 'rose' in combined or 'falooda' in combined or 'strawberry' in combined:
            liq_col = (225, 60, 110)
            froth_col = (250, 210, 225)
        else:
            liq_col = (210, 85, 45)
            froth_col = (245, 165, 125)
            
        # Liquid fill
        draw.polygon([(gx0 + 10, gy1 - 10), (gx0 + 5, gy0 + 30), (gx1 - 5, gy0 + 30), (gx1 - 10, gy1 - 10)], fill=liq_col)
        # Foam / top layer
        draw.ellipse([gx0 + 5, gy0 + 15, gx1 - 5, gy0 + 45], fill=froth_col)
        # Ice cubes
        draw.rectangle([cx - 40, cy - 60, cx - 5, cy - 25], outline=(255, 255, 255, 140), width=2)
        draw.rectangle([cx + 5, cy - 30, cx + 45, cy + 5], outline=(255, 255, 255, 140), width=2)
        # Glass reflections
        draw.line([(gx0 + 8, gy0 + 40), (gx0 + 12, gy1 - 20)], fill=(255, 255, 255, 120), width=4)
        draw.line([(gx1 - 14, gy0 + 40), (gx1 - 18, gy1 - 20)], fill=(255, 255, 255, 70), width=3)
        # Glass rim highlight
        draw.ellipse([gx0, gy0 - 15, gx1, gy0 + 15], outline=(255, 255, 255, 180), width=3)
        
        # Garnish: Mint / citrus wheel / cumin sprinkle
        if 'chaas' in combined:
            # Cumin powder dots
            for _ in range(35):
                rx = rng.randint(gx0 + 15, gx1 - 15)
                ry = rng.randint(gy0 + 20, gy0 + 40)
                draw.ellipse([rx, ry, rx + 2, ry + 2], fill=(60, 45, 30))
            # Green coriander leaf
            draw.ellipse([cx - 8, gy0 + 25, cx + 8, gy0 + 33], fill=(34, 160, 60))
        elif 'coffee' in combined:
            # Coffee beans near base
            draw.ellipse([cx + 70, cy + 150, cx + 88, cy + 162], fill=(45, 25, 15))
            draw.ellipse([cx - 85, cy + 155, cx - 68, cy + 167], fill=(45, 25, 15))
            
    else:
        # Ceramic / Metallic Serving Platter Base
        # Drop shadow
        draw.ellipse([cx - 275, cy - 130, cx + 275, cy + 225], fill=(0, 0, 0, 150))
        
        # Platter style
        if is_dosa or is_thali:
            # Brass / Stainless steel large platter or banana leaf
            plate_edge = (160, 140, 90) if is_dosa else (190, 195, 205)
            plate_inner = (130, 110, 65) if is_dosa else (150, 155, 165)
        else:
            # Modern dark slate or artisan matte ceramic
            plate_edge = (60, 58, 62)
            plate_inner = (38, 36, 40)
            
        draw.ellipse([cx - 260, cy - 165, cx + 260, cy + 175], fill=plate_edge, outline=(255, 255, 255, 40), width=2)
        draw.ellipse([cx - 240, cy - 150, cx + 240, cy + 155], fill=plate_inner)
        draw.ellipse([cx - 225, cy - 138, cx + 225, cy + 140], fill=(28, 26, 30))

        # Distinct Dish Content Rendering
        if is_dosa:
            # Banana leaf base
            draw.ellipse([cx - 210, cy - 110, cx + 210, cy + 115], fill=(30, 115, 45))
            # Crisp Golden Rolled Dosa (cylindrical diagonal)
            dosa_col = (215, 155, 65)
            dosa_crisp = (170, 105, 35)
            draw.polygon([(cx - 180, cy - 15), (cx + 170, cy - 75), (cx + 190, cy + 25), (cx - 160, cy + 85)], fill=dosa_col)
            # Golden brown roasted ridges
            for off in range(-140, 150, 25):
                draw.line([(cx + off, cy - 35), (cx + off + 20, cy + 55)], fill=dosa_crisp, width=5)
            # Sambar bowl (top left)
            draw.ellipse([cx - 160, cy - 120, cx - 80, cy - 50], fill=(180, 80, 25), outline=(210, 215, 220), width=3)
            # Coconut chutney bowl (top right)
            draw.ellipse([cx + 70, cy - 120, cx + 150, cy - 50], fill=(245, 245, 240), outline=(210, 215, 220), width=3)
            draw.ellipse([cx + 105, cy - 88, cx + 115, cy - 82], fill=(25, 130, 45)) # curry leaf
            
        elif is_pav_bhaji:
            # Shallow bowl of rich red spiced bhaji
            draw.ellipse([cx - 140, cy - 70, cx + 140, cy + 110], fill=(195, 65, 30), outline=(140, 40, 15), width=3)
            # Texture specks in bhaji
            for _ in range(80):
                rx = rng.randint(cx - 110, cx + 110)
                ry = rng.randint(cy - 50, cy + 90)
                draw.ellipse([rx, ry, rx + 4, ry + 4], fill=(225, 85, 40))
            # Melting Yellow Amul Butter Slab
            draw.polygon([(cx - 25, cy + 5), (cx + 25, cy - 5), (cx + 35, cy + 30), (cx - 15, cy + 40)], fill=(252, 225, 65))
            # Melted butter ring
            draw.ellipse([cx - 45, cy - 10, cx + 55, cy + 55], outline=(245, 205, 40), width=3)
            # Chopped coriander garnish
            for _ in range(30):
                rx = rng.randint(cx - 70, cx + 70)
                ry = rng.randint(cy - 30, cy + 70)
                draw.ellipse([rx, ry, rx + 3, ry + 3], fill=(30, 155, 45))
            # Two golden toasted buttered pav buns (left & right)
            draw.ellipse([cx - 215, cy - 120, cx - 115, cy - 25], fill=(215, 160, 95), outline=(150, 95, 45), width=3)
            draw.ellipse([cx - 195, cy - 105, cx - 135, cy - 45], fill=(235, 190, 125)) # butter shine
            draw.ellipse([cx + 115, cy - 120, cx + 215, cy - 25], fill=(215, 160, 95), outline=(150, 95, 45), width=3)
            draw.ellipse([cx + 135, cy - 105, cx + 195, cy - 45], fill=(235, 190, 125))
            # Sliced onion rings
            draw.ellipse([cx - 70, cy - 110, cx - 20, cy - 75], outline=(210, 80, 120), width=3)
            
        elif is_sandwich:
            # Two golden toasted diagonal triangular sandwich halves
            s_col = (220, 175, 110)
            draw.polygon([(cx - 170, cy + 60), (cx + 30, cy - 110), (cx + 30, cy + 60)], fill=s_col, outline=(150, 100, 45), width=3)
            draw.polygon([(cx - 20, cy + 85), (cx + 180, cy - 85), (cx + 180, cy + 85)], fill=s_col, outline=(150, 100, 45), width=3)
            # Dark diagonal grill lines
            draw.line([(cx - 120, cy + 50), (cx + 20, cy - 70)], fill=(95, 55, 20), width=5)
            draw.line([(cx - 70, cy + 55), (cx + 25, cy - 20)], fill=(95, 55, 20), width=5)
            draw.line([(cx + 30, cy + 75), (cx + 170, cy - 45)], fill=(95, 55, 20), width=5)
            # Melted Cheese layer and green chutney peeking through
            draw.line([(cx - 150, cy + 58), (cx + 25, cy + 58)], fill=(255, 220, 50), width=6)
            draw.line([(cx - 145, cy + 53), (cx + 20, cy + 53)], fill=(45, 160, 60), width=4)
            # Cheese pull stretch
            draw.line([(cx + 15, cy + 60), (cx + 40, cy + 75)], fill=(255, 225, 75), width=4)
            
        elif is_biryani:
            # Fragrant long-grain basmati mound
            draw.ellipse([cx - 165, cy - 90, cx + 165, cy + 95], fill=(235, 155, 50))
            # Rice grains texture
            for _ in range(160):
                rx = rng.randint(cx - 140, cx + 140)
                ry = rng.randint(cy - 70, cy + 75)
                col = rng.choice([(255, 245, 220), (245, 175, 45), (225, 120, 25)])
                draw.ellipse([rx, ry, rx + 6, ry + 2], fill=col)
            # Caramelized brown fried onions (birista)
            for _ in range(45):
                rx = rng.randint(cx - 100, cx + 100)
                ry = rng.randint(cy - 50, cy + 50)
                draw.line([(rx, ry), (rx + rng.randint(8, 16), ry + rng.randint(-3, 3))], fill=(85, 40, 15), width=2)
            # Fresh mint leaves & cashews
            draw.ellipse([cx - 20, cy - 10, cx + 10, cy + 10], fill=(25, 145, 40))
            draw.ellipse([cx + 40, cy + 15, cx + 60, cy + 28], fill=(245, 230, 195)) # cashew
            
        elif is_pizza:
            # Round golden blistered crust
            draw.ellipse([cx - 170, cy - 110, cx + 170, cy + 115], fill=(205, 145, 80), outline=(135, 85, 35), width=6)
            # Tomato base & melted mozzarella
            draw.ellipse([cx - 150, cy - 95, cx + 150, cy + 98], fill=(245, 215, 115))
            # Charred spots & sauce patches
            for _ in range(25):
                rx = rng.randint(cx - 120, cx + 120)
                ry = rng.randint(cy - 70, cy + 70)
                draw.ellipse([rx, ry, rx + 14, ry + 9], fill=(210, 60, 30))
            # Fresh green basil leaves
            draw.ellipse([cx - 40, cy - 20, cx - 10, cy + 5], fill=(35, 150, 45))
            draw.ellipse([cx + 30, cy + 15, cx + 60, cy + 35], fill=(35, 150, 45))
            # Sliced black olives
            for _ in range(12):
                rx = rng.randint(cx - 110, cx + 110)
                ry = rng.randint(cy - 60, cy + 60)
                draw.ellipse([rx, ry, rx + 10, ry + 10], fill=(30, 30, 35), outline=(60, 60, 65), width=2)
                
        elif is_noodles:
            # Steaming bowl of noodles / maggi / pasta
            draw.ellipse([cx - 160, cy - 85, cx + 160, cy + 95], fill=(235, 185, 80), outline=(180, 120, 40), width=3)
            # Wavy noodle strands
            for _ in range(60):
                rx = rng.randint(cx - 130, cx + 110)
                ry = rng.randint(cy - 60, cy + 70)
                draw.arc([rx, ry, rx + 40, ry + 25], start=0, end=180, fill=(255, 210, 95), width=3)
            # Julienned bell peppers & spring onions
            for _ in range(35):
                rx = rng.randint(cx - 110, cx + 110)
                ry = rng.randint(cy - 50, cy + 60)
                col = rng.choice([(215, 45, 30), (35, 160, 50), (250, 160, 30)])
                draw.line([(rx, ry), (rx + rng.randint(10, 20), ry + rng.randint(-4, 4))], fill=col, width=3)
                
        elif is_curry:
            # Rich curry with cream swirl and paneer / dal
            c_col = (195, 75, 25) if 'dal' not in combined else (145, 95, 40)
            draw.ellipse([cx - 150, cy - 80, cx + 150, cy + 90], fill=c_col, outline=(180, 190, 200), width=4)
            # Paneer cubes or dal tempering
            if 'paneer' in combined:
                for off in [(-50, -10), (20, -30), (45, 15), (-15, 35)]:
                    px, py = cx + off[0], cy + off[1]
                    draw.rectangle([px, py, px + 28, py + 22], fill=(250, 250, 245), outline=(225, 210, 190), width=2)
            # Cream swirl (spiral arc)
            draw.arc([cx - 60, cy - 35, cx + 60, cy + 35], start=45, end=270, fill=(255, 255, 250), width=4)
            draw.arc([cx - 30, cy - 18, cx + 30, cy + 18], start=180, end=360, fill=(255, 255, 250), width=3)
            # Kasuri methi flakes
            for _ in range(30):
                rx = rng.randint(cx - 80, cx + 80)
                ry = rng.randint(cy - 40, cy + 50)
                draw.ellipse([rx, ry, rx + 2, ry + 2], fill=(45, 110, 35))
                
        elif is_thali:
            # Grand Thali with 4 katoris, rotis, rice
            # Katoris
            draw.ellipse([cx - 160, cy - 90, cx - 80, cy - 25], fill=(210, 75, 30), outline=(210, 215, 220), width=3) # Paneer
            draw.ellipse([cx - 40, cy - 120, cx + 40, cy - 55], fill=(185, 130, 35), outline=(210, 215, 220), width=3) # Dal
            draw.ellipse([cx + 80, cy - 90, cx + 160, cy - 25], fill=(45, 140, 60), outline=(210, 215, 220), width=3) # Sabzi
            draw.ellipse([cx + 100, cy - 5, cx + 175, cy + 55], fill=(245, 245, 240), outline=(210, 215, 220), width=3) # Dahi
            # Steamed Basmati Rice Mound (center)
            draw.ellipse([cx - 50, cy - 15, cx + 50, cy + 45], fill=(250, 248, 242))
            # 2 Butter Rotis (bottom left)
            draw.ellipse([cx - 150, cy + 10, cx - 40, cy + 95], fill=(225, 185, 125), outline=(175, 130, 70), width=2)
            draw.ellipse([cx - 110, cy + 25, cx - 10, cy + 110], fill=(235, 195, 135), outline=(175, 130, 70), width=2)
            
        elif is_bakery:
            # Golden flaky croissant or cake slice
            if 'croissant' in combined:
                # Crescent curve
                c_col = (215, 145, 60)
                draw.arc([cx - 150, cy - 80, cx + 150, cy + 80], start=20, end=160, fill=c_col, width=48)
                # Pastry folds
                for off in range(-90, 100, 25):
                    draw.line([(cx + off, cy - 15), (cx + off + 10, cy + 30)], fill=(150, 85, 25), width=3)
            else:
                # Cake / Cheesecake slice
                draw.polygon([(cx - 90, cy + 60), (cx + 90, cy - 50), (cx + 90, cy + 40), (cx - 90, cy + 90)], fill=(85, 45, 30))
                # Cream / fruit topping
                draw.line([(cx - 90, cy + 60), (cx + 90, cy - 50)], fill=(220, 50, 90), width=8)
                draw.ellipse([cx + 10, cy - 25, cx + 35, cy - 5], fill=(180, 20, 50)) # berry
                
        elif is_chaat:
            # Papdis with sev & chutneys
            for off in [(-90, 0), (-30, -35), (35, -30), (85, 10), (0, 30), (-60, 25)]:
                px, py = cx + off[0], cy + off[1]
                draw.ellipse([px - 35, py - 20, px + 35, py + 20], fill=(215, 165, 95), outline=(160, 110, 50), width=2)
                draw.ellipse([px - 15, py - 10, px + 15, py + 10], fill=(230, 190, 120)) # potato
            # Sev mound (yellow lines)
            for _ in range(120):
                rx = rng.randint(cx - 110, cx + 110)
                ry = rng.randint(cy - 45, cy + 45)
                draw.line([(rx, ry), (rx + rng.randint(4, 10), ry + rng.randint(-2, 2))], fill=(255, 220, 55), width=2)
            # Pomegranate rubies
            for _ in range(18):
                rx = rng.randint(cx - 80, cx + 80)
                ry = rng.randint(cy - 30, cy + 35)
                draw.ellipse([rx, ry, rx + 5, ry + 5], fill=(205, 25, 45))
                
        elif is_poha:
            # Yellow Poha flattened rice with peanuts and coriander
            draw.ellipse([cx - 150, cy - 80, cx + 150, cy + 90], fill=(245, 210, 45))
            # Poha flakes
            for _ in range(140):
                rx = rng.randint(cx - 130, cx + 130)
                ry = rng.randint(cy - 65, cy + 70)
                draw.ellipse([rx, ry, rx + 6, ry + 3], fill=(255, 235, 85))
            # Crunchy peanuts
            for _ in range(25):
                rx = rng.randint(cx - 100, cx + 100)
                ry = rng.randint(cy - 50, cy + 55)
                draw.ellipse([rx, ry, rx + 12, ry + 7], fill=(130, 65, 30))
            # Curry leaves & lemon wedge
            for _ in range(8):
                rx = rng.randint(cx - 90, cx + 90)
                ry = rng.randint(cy - 40, cy + 40)
                draw.ellipse([rx, ry, rx + 14, ry + 6], fill=(25, 135, 40))
            draw.polygon([(cx + 90, cy + 10), (cx + 135, cy + 40), (cx + 100, cy + 60)], fill=(240, 240, 60))
            
        else:
            # Generic artisanal Indian dish
            draw.ellipse([cx - 145, cy - 75, cx + 145, cy + 85], fill=(205, 135, 55), outline=(160, 95, 35), width=3)
            for _ in range(70):
                rx = rng.randint(cx - 110, cx + 110)
                ry = rng.randint(cy - 50, cy + 60)
                draw.ellipse([rx, ry, rx + 8, ry + 6], fill=(235, 175, 75))
            for _ in range(25):
                rx = rng.randint(cx - 80, cx + 80)
                ry = rng.randint(cy - 40, cy + 40)
                draw.ellipse([rx, ry, rx + 3, ry + 3], fill=(35, 150, 45))

    # Composite overlay onto base image
    final_img = Image.alpha_composite(img.convert('RGBA'), overlay)
    
    # Soft vignette & warm culinary contrast enhancement
    final_rgb = final_img.convert('RGB')
    enhancer = ImageEnhance.Contrast(final_rgb)
    final_rgb = enhancer.enhance(1.08)
    color_enhancer = ImageEnhance.Color(final_rgb)
    final_rgb = color_enhancer.enhance(1.06)
    
    # Save optimized WebP
    if os.path.dirname(output_path): os.makedirs(os.path.dirname(output_path), exist_ok=True)
    final_rgb.save(output_path, 'WEBP', quality=88, method=6)
    return output_path

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--name', required=True)
    parser.add_argument('--category', default='')
    parser.add_argument('--tags', default='')
    parser.add_argument('--output', required=True)
    args = parser.parse_args()
    
    render_food_image(args.name, args.category, args.tags, args.output)
    print(f'Generated: {args.output}')
