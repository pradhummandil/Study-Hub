import json
import os

def create_simple_lottie_json(filepath, title, primary_color, secondary_color):
    data = {
        "v": "5.7.4",
        "fr": 30,
        "ip": 0,
        "op": 60,
        "w": 200,
        "h": 200,
        "nm": title,
        "ddd": 0,
        "assets": [],
        "layers": [
            {
                "ddd": 0,
                "ind": 1,
                "ty": 4,
                "nm": "Circle Pulse",
                "sr": 1,
                "ks": {
                    "o": {"a": 1, "k": [{"t": 0, "s": [100]}, {"t": 30, "s": [40]}, {"t": 60, "s": [100]}]},
                    "r": {"a": 1, "k": [{"t": 0, "s": [0]}, {"t": 60, "s": [360]}]},
                    "p": {"a": 0, "k": [100, 100, 0]},
                    "a": {"a": 0, "k": [0, 0, 0]},
                    "s": {"a": 1, "k": [{"t": 0, "s": [100, 100, 100]}, {"t": 30, "s": [115, 115, 100]}, {"t": 60, "s": [100, 100, 100]}]}
                },
                "shapes": [
                    {
                        "ty": "el",
                        "d": 1,
                        "s": {"a": 0, "k": [120, 120]},
                        "p": {"a": 0, "k": [0, 0]},
                        "nm": "Ellipse Path 1"
                    },
                    {
                        "ty": "st",
                        "c": {"a": 0, "k": primary_color},
                        "o": {"a": 0, "k": 100},
                        "w": {"a": 0, "k": 8},
                        "lc": 2,
                        "lj": 2,
                        "nm": "Stroke 1"
                    }
                ]
            }
        ]
    }
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Generated Lottie JSON: {filepath}")

base = os.path.join("public", "assets", "lottie-v2")

create_simple_lottie_json(
    os.path.join(base, "empty", "empty-state.json"),
    "Empty State Pulse",
    [0.12, 0.37, 0.54, 1], # #1F5F8B
    [0.3, 0.53, 0.72, 1]  # #4E88B7
)

create_simple_lottie_json(
    os.path.join(base, "error", "error-state.json"),
    "Error State Pulse",
    [0.85, 0.25, 0.25, 1],
    [0.95, 0.45, 0.45, 1]
)

create_simple_lottie_json(
    os.path.join(base, "quiz", "quiz-pulse.json"),
    "Quiz Streak Pulse",
    [0.06, 0.13, 0.24, 1], # #10233F
    [0.96, 0.85, 0.71, 1]  # #FCDAB7
)

create_simple_lottie_json(
    os.path.join(base, "research", "code-research.json"),
    "Code Research Pulse",
    [0.12, 0.37, 0.54, 1],
    [0.3, 0.53, 0.72, 1]
)
