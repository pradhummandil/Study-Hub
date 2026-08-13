import os
import math
from PIL import Image, ImageDraw, ImageFilter, ImageFont

# Colors
C_DARK = (6, 43, 61, 255)       # #062B3D
C_BLUE = (40, 123, 255, 255)    # #287BFF
C_CYAN = (92, 225, 230, 255)    # #5CE1E6
C_INDIGO = (111, 124, 255, 255)# #6F7CFF
C_LAVENDER = (180, 156, 255, 255) # #B49CFF
C_WHITE = (255, 255, 255, 255)  # #FFFFFF
C_LIGHT_BG = (244, 249, 255, 255) # #F4F9FF
C_DARK_BG = (10, 25, 38, 255)

def draw_gradient_rect(draw, box, color1, color2, direction="vertical"):
    x0, y0, x1, y1 = box
    w, h = x1 - x0, y1 - y0
    for i in range(h if direction == "vertical" else w):
        t = i / max(1, (h if direction == "vertical" else w))
        r = int(color1[0] * (1 - t) + color2[0] * t)
        g = int(color1[1] * (1 - t) + color2[1] * t)
        b = int(color1[2] * (1 - t) + color2[2] * t)
        a = int(color1[3] * (1 - t) + color2[3] * t)
        if direction == "vertical":
            draw.line([(x0, y0 + i), (x1, y0 + i)], fill=(r, g, b, a))
        else:
            draw.line([(x0 + i, y0), (x0 + i, y1)], fill=(r, g, b, a))

def draw_rounded_rect(draw, box, radius, fill, outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)

def draw_glowing_circle(img, center, radius, color, blur_radius=20):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(overlay)
    x, y = center
    d.ellipse([x - radius, y - radius, x + radius, y + radius], fill=color)
    overlay = overlay.filter(ImageFilter.GaussianBlur(blur_radius))
    img.alpha_composite(overlay)

# 1. HERO AI STUDY (Pin 1 Concept)
def make_hero_asset():
    W, H = 1200, 900
    img = Image.new("RGBA", (W, H), C_DARK)
    draw = ImageDraw.Draw(img)
    
    # Background glows
    draw_glowing_circle(img, (300, 300), 250, (40, 123, 255, 120), 80)
    draw_glowing_circle(img, (800, 500), 300, (92, 225, 230, 100), 100)
    
    draw = ImageDraw.Draw(img)
    # Glass cards
    # Card 1: Active Recall Flashcard
    draw_rounded_rect(draw, (150, 180, 550, 480), 24, (255, 255, 255, 30), outline=(255, 255, 255, 80), width=2)
    draw_rounded_rect(draw, (180, 220, 280, 250), 12, C_CYAN)
    draw_rounded_rect(draw, (300, 230, 510, 242), 6, C_WHITE)
    draw_rounded_rect(draw, (180, 280, 480, 292), 6, (255, 255, 255, 160))
    draw_rounded_rect(draw, (180, 310, 400, 322), 6, (255, 255, 255, 120))
    # Play controls in card
    draw_rounded_rect(draw, (180, 370, 240, 430), 30, C_BLUE)
    draw.polygon([(205, 390), (205, 410), (225, 400)], fill=C_WHITE)
    
    # Card 2: Neural AI Brain Assistant
    draw_rounded_rect(draw, (620, 240, 1050, 640), 28, (255, 255, 255, 25), outline=(92, 225, 230, 120), width=2)
    # Neural Nodes & Connections
    nodes = [(720, 340), (820, 300), (950, 360), (750, 460), (880, 440), (980, 500), (820, 560)]
    lines = [(0, 1), (1, 2), (0, 3), (1, 4), (2, 5), (3, 4), (4, 5), (4, 6), (3, 6)]
    for i, j in lines:
        draw.line([nodes[i], nodes[j]], fill=(92, 225, 230, 140), width=3)
    for nx, ny in nodes:
        draw.ellipse([nx-12, ny-12, nx+12, ny+12], fill=C_BLUE, outline=C_CYAN, width=3)
    
    # Card 3: Floating Badge
    draw_rounded_rect(draw, (380, 520, 720, 680), 20, (255, 255, 255, 40), outline=(255, 255, 255, 100), width=2)
    draw_rounded_rect(draw, (410, 560, 460, 610), 12, C_INDIGO)
    draw_rounded_rect(draw, (480, 570, 680, 582), 6, C_WHITE)
    draw_rounded_rect(draw, (480, 600, 620, 610), 5, C_CYAN)

    img.save("public/assets/pinterest/hero/hero-ai-study.webp")
    print("Saved hero-ai-study.webp")

# 2. FOCUS ROOM (Pin 2 Concept)
def make_focus_asset():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), C_DARK_BG)
    draw_glowing_circle(img, (540, 960), 450, (92, 225, 230, 80), 120)
    draw = ImageDraw.Draw(img)
    
    # Ambient Focus Shield & Screen
    draw_rounded_rect(draw, (140, 400, 940, 1500), 40, (6, 43, 61, 220), outline=C_CYAN, width=3)
    # Timer Display
    draw_rounded_rect(draw, (340, 550, 740, 650), 30, (255, 255, 255, 20))
    draw_rounded_rect(draw, (380, 750, 700, 950), 24, (40, 123, 255, 180), outline=C_CYAN, width=2)
    # Distraction blocker shield
    draw_rounded_rect(draw, (240, 1100, 840, 1380), 24, (255, 255, 255, 20), outline=(255, 255, 255, 60), width=2)
    draw_rounded_rect(draw, (280, 1160, 440, 1200), 12, C_CYAN)
    draw_rounded_rect(draw, (480, 1170, 780, 1190), 8, C_WHITE)
    draw_rounded_rect(draw, (280, 1240, 400, 1280), 12, (180, 156, 255, 255))
    draw_rounded_rect(draw, (440, 1250, 740, 1270), 8, (255, 255, 255, 180))
    
    img.save("public/assets/pinterest/focus/focus-ambient-room.webp")
    print("Saved focus-ambient-room.webp")

# 3. KNOWLEDGE LIBRARY (Pin 3 Concept)
def make_library_asset():
    W, H = 1168, 1752
    img = Image.new("RGBA", (W, H), C_DARK)
    draw_glowing_circle(img, (584, 876), 400, (40, 123, 255, 90), 100)
    draw = ImageDraw.Draw(img)
    
    # Brain Silhouette matrix filled with shelves
    draw_rounded_rect(draw, (180, 250, 988, 1500), 40, (255, 255, 255, 15), outline=C_CYAN, width=2)
    # Shelf Matrix
    for row in range(5):
        y = 350 + row * 220
        draw.line([(240, y), (928, y)], fill=(255, 255, 255, 60), width=4)
        for col in range(8):
            x = 260 + col * 80
            h = 100 + (col * 17) % 60
            color = C_BLUE if col % 3 == 0 else (C_CYAN if col % 3 == 1 else C_INDIGO)
            draw_rounded_rect(draw, (x, y - h, x + 60, y), 8, color)
            
    img.save("public/assets/pinterest/study/knowledge-library-brain.webp")
    print("Saved knowledge-library-brain.webp")

# 4. EXAM SIMULATOR (Pin 4 Concept)
def make_exam_asset():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), C_LIGHT_BG)
    draw_glowing_circle(img, (540, 960), 500, (40, 123, 255, 40), 120)
    draw = ImageDraw.Draw(img)
    
    # Exam Desk Console
    draw_rounded_rect(draw, (100, 300, 980, 1620), 36, C_WHITE, outline=C_BLUE, width=3)
    # Header bar
    draw_rounded_rect(draw, (150, 360, 930, 480), 20, C_DARK)
    draw_rounded_rect(draw, (200, 400, 400, 440), 10, C_CYAN)
    draw_rounded_rect(draw, (700, 400, 880, 440), 10, C_BLUE)
    
    # Question Card
    draw_rounded_rect(draw, (150, 540, 930, 1100), 24, C_LIGHT_BG, outline=(40, 123, 255, 80), width=2)
    draw_rounded_rect(draw, (200, 600, 600, 624), 8, C_DARK)
    for i in range(4):
        oy = 680 + i * 90
        draw_rounded_rect(draw, (200, oy, 880, oy + 65), 14, C_WHITE, outline=(40, 123, 255, 60), width=2)
        if i == 1: # Correct answer selection
            draw_rounded_rect(draw, (200, oy, 880, oy + 65), 14, (92, 225, 230, 40), outline=C_CYAN, width=3)

    # Score Gauge
    draw_rounded_rect(draw, (150, 1160, 930, 1540), 24, C_DARK)
    draw_rounded_rect(draw, (200, 1220, 880, 1270), 16, (255, 255, 255, 30))
    draw_rounded_rect(draw, (200, 1220, 750, 1270), 16, C_CYAN)

    img.save("public/assets/pinterest/exams/exam-confidence-suite.webp")
    print("Saved exam-confidence-suite.webp")

# 5. ROADMAP PATHWAY (Pin 5 Concept)
def make_roadmap_asset():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), C_DARK)
    draw_glowing_circle(img, (540, 960), 550, (40, 123, 255, 80), 150)
    draw = ImageDraw.Draw(img)
    
    # S-curve path
    points = [(250, 1600), (750, 1350), (300, 1050), (800, 750), (450, 400)]
    for i in range(len(points)-1):
        draw.line([points[i], points[i+1]], fill=C_CYAN, width=12)
        
    milestones = ["Foundation", "Core Concepts", "Practice PYQ", "Mock Exams", "Mastery"]
    for idx, (px, py) in enumerate(points):
        draw.ellipse([px-40, py-40, px+40, py+40], fill=C_BLUE, outline=C_WHITE, width=4)
        draw_rounded_rect(draw, (px + 60 if px < 500 else px - 360, py - 35, px + 340 if px < 500 else px - 60, py + 35), 18, (255, 255, 255, 30), outline=(255, 255, 255, 80), width=2)
        
    img.save("public/assets/pinterest/study/roadmap-pathway-mastery.webp")
    print("Saved roadmap-pathway-mastery.webp")

# 6. PYQ DEEP PRACTICE (Pin 6 Concept)
def make_pyq_asset():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), C_LIGHT_BG)
    draw_glowing_circle(img, (540, 960), 450, (92, 225, 230, 60), 100)
    draw = ImageDraw.Draw(img)
    
    # Open Practice Document
    draw_rounded_rect(draw, (120, 300, 960, 1650), 32, C_WHITE, outline=C_BLUE, width=3)
    draw_rounded_rect(draw, (180, 380, 480, 430), 12, C_DARK)
    draw_rounded_rect(draw, (520, 380, 720, 430), 12, C_CYAN)
    
    # Highlighted question & answer explanation
    draw_rounded_rect(draw, (180, 480, 900, 720), 20, C_LIGHT_BG, outline=C_BLUE, width=2)
    draw_rounded_rect(draw, (180, 760, 900, 1200), 20, (92, 225, 230, 30), outline=C_CYAN, width=2)
    draw_rounded_rect(draw, (180, 1240, 900, 1560), 20, (6, 43, 61, 240))
    
    img.save("public/assets/pinterest/study/pyq-deep-practice.webp")
    print("Saved pyq-deep-practice.webp")

# 7. REVISION FLASHCARDS (Pin 7 Concept)
def make_revision_asset():
    W, H = 800, 800
    img = Image.new("RGBA", (W, H), C_DARK)
    draw_glowing_circle(img, (400, 400), 300, (40, 123, 255, 100), 90)
    draw = ImageDraw.Draw(img)
    
    # Stacked swiping flashcards
    draw_rounded_rect(draw, (150, 240, 650, 620), 24, (255, 255, 255, 20), outline=(255, 255, 255, 60), width=2)
    draw_rounded_rect(draw, (120, 180, 680, 580), 24, (255, 255, 255, 40), outline=(255, 255, 255, 90), width=2)
    draw_rounded_rect(draw, (90, 120, 710, 540), 28, C_WHITE, outline=C_CYAN, width=3)
    
    # Content inside top card
    draw_rounded_rect(draw, (140, 170, 280, 205), 10, C_BLUE)
    draw_rounded_rect(draw, (140, 240, 550, 260), 8, C_DARK)
    draw_rounded_rect(draw, (140, 280, 480, 296), 6, (6, 43, 61, 160))
    draw_rounded_rect(draw, (140, 360, 660, 460), 16, C_LIGHT_BG, outline=C_CYAN, width=2)
    
    img.save("public/assets/pinterest/ui/revision-fast-flashcards.webp")
    print("Saved revision-fast-flashcards.webp")

# 8. ECOSYSTEM JUGGLING (Pin 8 Concept)
def make_ecosystem_asset():
    W, H = 1080, 1920
    img = Image.new("RGBA", (W, H), C_DARK)
    draw_glowing_circle(img, (540, 960), 500, (92, 225, 230, 90), 130)
    draw = ImageDraw.Draw(img)
    
    # Orbit circle
    draw.ellipse([140, 460, 940, 1260], outline=(255, 255, 255, 50), width=3)
    
    # Center Hub Core
    draw_rounded_rect(draw, (390, 710, 690, 1010), 150, C_BLUE, outline=C_CYAN, width=4)
    
    # Orbiting Widgets
    widgets = [(200, 500), (800, 500), (140, 860), (860, 860), (320, 1200), (680, 1200)]
    colors = [C_CYAN, C_INDIGO, C_LAVENDER, C_BLUE, C_CYAN, C_WHITE]
    for idx, (wx, wy) in enumerate(widgets):
        draw_rounded_rect(draw, (wx - 80, wy - 60, wx + 80, wy + 60), 20, (255, 255, 255, 40), outline=colors[idx], width=2)

    img.save("public/assets/pinterest/ui/ecosystem-juggling-widgets.webp")
    print("Saved ecosystem-juggling-widgets.webp")

# 9. COMMUNITY STUDY ROOM (Pin 9 Concept)
def make_community_asset():
    W, H = 800, 800
    img = Image.new("RGBA", (W, H), C_DARK_BG)
    draw_glowing_circle(img, (400, 400), 300, (40, 123, 255, 80), 90)
    draw = ImageDraw.Draw(img)
    
    # Virtual Lounge Table & Avatars
    draw_rounded_rect(draw, (100, 240, 700, 660), 40, (6, 43, 61, 230), outline=C_CYAN, width=3)
    # Avatars in session
    avatars = [(200, 360), (400, 320), (600, 360), (300, 540), (500, 540)]
    for ax, ay in avatars:
        draw.ellipse([ax - 45, ay - 45, ax + 45, ay + 45], fill=C_BLUE, outline=C_CYAN, width=3)
        draw.ellipse([ax - 15, ay - 15, ax + 15, ay + 15], fill=C_WHITE)
        
    img.save("public/assets/pinterest/community/study-room-collaborative.webp")
    print("Saved study-room-collaborative.webp")

# 10. INTERACTIVE CLICK PREVIEW (Pin 10 Concept)
def make_interactive_click_asset():
    W, H = 800, 800
    img = Image.new("RGBA", (W, H), C_LIGHT_BG)
    draw_glowing_circle(img, (400, 400), 280, (92, 225, 230, 70), 80)
    draw = ImageDraw.Draw(img)
    
    # Interactive Card & Mouse Pointer Ripple
    draw_rounded_rect(draw, (120, 160, 680, 640), 32, C_DARK, outline=C_BLUE, width=3)
    draw_rounded_rect(draw, (180, 240, 620, 320), 20, C_BLUE)
    draw_rounded_rect(draw, (180, 360, 540, 390), 12, C_CYAN)
    draw_rounded_rect(draw, (180, 420, 440, 445), 10, C_WHITE)
    
    # Cursor Glow Ripple
    draw.ellipse([420, 260, 540, 380], outline=C_CYAN, width=4)
    draw.polygon([(460, 300), (460, 360), (480, 340), (500, 370), (515, 360), (495, 330), (525, 330)], fill=C_WHITE)

    img.save("public/assets/pinterest/ui/interactive-click-preview.webp")
    print("Saved interactive-click-preview.webp")

# 11. ABOUT FUTURE ASPIRATIONS (Pin 11 Concept)
def make_about_future_asset():
    W, H = 1000, 1120
    img = Image.new("RGBA", (W, H), C_DARK)
    draw_glowing_circle(img, (500, 560), 400, (40, 123, 255, 100), 120)
    draw = ImageDraw.Draw(img)
    
    # Horizon lines & futuristic ascending rays
    for r in range(8):
        y = 700 + r * 50
        draw.line([(100, y), (900, y)], fill=(92, 225, 230, 200 - r * 22), width=3)
    
    # Dreamer glowing portal frame
    draw_rounded_rect(draw, (200, 200, 800, 750), 36, (255, 255, 255, 20), outline=C_CYAN, width=3)
    draw_rounded_rect(draw, (280, 280, 720, 340), 16, C_BLUE)
    draw_rounded_rect(draw, (280, 380, 640, 410), 12, C_WHITE)
    draw_rounded_rect(draw, (280, 440, 580, 465), 10, C_CYAN)

    img.save("public/assets/pinterest/decorative/about-future-aspirations.webp")
    print("Saved about-future-aspirations.webp")

if __name__ == "__main__":
    make_hero_asset()
    make_focus_asset()
    make_library_asset()
    make_exam_asset()
    make_roadmap_asset()
    make_pyq_asset()
    make_revision_asset()
    make_ecosystem_asset()
    make_community_asset()
    make_interactive_click_asset()
    make_about_future_asset()
    print("All 11 Study Hub visual assets created cleanly in public/assets/pinterest/")
