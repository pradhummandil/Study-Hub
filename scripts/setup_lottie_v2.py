import os
import shutil
import json

base_dir = os.path.join("public", "assets", "lottie-v2")

categories = [
    "startup",
    "ai",
    "education",
    "study",
    "focus",
    "quiz",
    "success",
    "empty",
    "error",
    "research",
    "decorative"
]

for cat in categories:
    os.makedirs(os.path.join(base_dir, cat), exist_ok=True)

print("Created directories under public/assets/lottie-v2/")

# Map existing vectors / animations from 'LOTTIE ANIMTIONS' and 'public/assets/lottie'
source_lottie = os.path.join("LOTTIE ANIMTIONS")

mappings = {
    os.path.join(source_lottie, "loading.svg"): os.path.join(base_dir, "startup", "startup-loader.svg"),
    os.path.join(source_lottie, "loading (1).svg"): os.path.join(base_dir, "ai", "studymate-thinking.svg"),
    os.path.join(source_lottie, "loading (2).svg"): os.path.join(base_dir, "ai", "studymate-generating.svg"),
    os.path.join(source_lottie, "Student.svg"): os.path.join(base_dir, "education", "student-study.svg"),
    os.path.join(source_lottie, "Business plan.svg"): os.path.join(base_dir, "education", "knowledge-book.svg"),
    os.path.join(source_lottie, "Analytics Character Animation.svg"): os.path.join(base_dir, "study", "analytics.svg"),
    os.path.join(source_lottie, "success.svg"): os.path.join(base_dir, "success", "quiz-success.svg"),
    os.path.join(source_lottie, "Champion.svg"): os.path.join(base_dir, "success", "champion.svg"),
    os.path.join(source_lottie, "Man with task list.svg"): os.path.join(base_dir, "focus", "focus-timer.svg"),
    os.path.join(source_lottie, "Contact Us.svg"): os.path.join(base_dir, "decorative", "contact-us.svg")
}

for src, dst in mappings.items():
    if os.path.exists(src):
        shutil.copy(src, dst)
        print(f"Copied {src} -> {dst}")

print("Lottie v2 asset setup completed!")
