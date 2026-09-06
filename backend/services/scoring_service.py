XP_TABLE = {
    "theory_complete": 50,
    "demo_complete": 25,
    "lab_complete_no_hints": 100,
    "lab_complete_one_hint": 75,
    "lab_complete_two_hints": 50,
    "lab_complete_three_hints": 25,
    "problem_solving_100": 100,
    "problem_solving_80": 80,
    "problem_solving_70": 50,
    "forensics_complete": 100,
    "streak_bonus_7day": 200,
    "streak_bonus_30day": 500,
    "first_attempt_bonus": 50,
    "exam_pass_bonus": 500,
}

def calculate_level_xp(completion_data: dict) -> int:
    xp = 0
    hints_used = completion_data.get("hints_used", 0)

    if completion_data.get("theory_completed"):
        xp += XP_TABLE["theory_complete"]

    if completion_data.get("demo_completed"):
        xp += XP_TABLE["demo_complete"]

    if completion_data.get("lab_completed"):
        hint_keys = ["no_hints", "one_hint", "two_hints", "three_hints"]
        idx = min(hints_used, 3)
        xp += XP_TABLE[f"lab_complete_{hint_keys[idx]}"]

    score = completion_data.get("problem_solving_score", 0)
    if score >= 100:
        xp += XP_TABLE["problem_solving_100"]
    elif score >= 80:
        xp += XP_TABLE["problem_solving_80"]
    elif score >= 70:
        xp += XP_TABLE["problem_solving_70"]

    if completion_data.get("forensics_completed"):
        xp += XP_TABLE["forensics_complete"]

    if completion_data.get("attempts", 0) == 1:
        xp += XP_TABLE["first_attempt_bonus"]

    return xp
