import json
import os
from datetime import datetime, timedelta
from config import settings

class ExamService:
    @staticmethod
    def load_exam(exam_id: str) -> dict:
        filename = f"{exam_id}.json"
        if not filename.startswith("exam_"):
            filename = f"exam_{exam_id}.json"
        path = os.path.join(settings.CONTENT_DIR, "exams", filename)
        if not os.path.exists(path):
            # Try direct exam_id matching
            path = os.path.join(settings.CONTENT_DIR, "exams", f"{exam_id}.json")
            if not os.path.exists(path):
                return None
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)

    @staticmethod
    def calculate_score(exam_data: dict, answers: dict) -> dict:
        theory = exam_data.get("theory_section", {})
        questions = theory.get("questions", [])
        theory_correct = 0
        total_theory_pts = len(questions) * theory.get("points_per_question", 10)

        theory_user_answers = answers.get("theory", {})
        for q in questions:
            qid = str(q["id"])
            if theory_user_answers.get(qid) == q["correct"]:
                theory_correct += q.get("points", 10)

        theory_score_pct = (theory_correct / total_theory_pts * 100) if total_theory_pts > 0 else 100.0

        practical = exam_data.get("practical_section", {})
        labs = practical.get("labs", [])
        practical_pts = 0
        total_practical_pts = sum(l.get("points", 30) for l in labs)

        practical_user_answers = answers.get("practical", {})
        for lab in labs:
            lid = str(lab["lab_id"])
            user_ans = str(practical_user_answers.get(lid, "")).strip()
            correct_ans = str(lab.get("validation", {}).get("correct_answer", "")).strip()

            if user_ans.lower() == correct_ans.lower() and len(correct_ans) > 0:
                practical_pts += lab.get("points", 30)

        practical_score_pct = (practical_pts / total_practical_pts * 100) if total_practical_pts > 0 else 100.0

        # Weighted total
        if total_theory_pts > 0 and total_practical_pts > 0:
            total_score = (theory_score_pct * 0.4) + (practical_score_pct * 0.6)
        elif total_theory_pts > 0:
            total_score = theory_score_pct
        else:
            total_score = practical_score_pct

        passed = total_score >= exam_data.get("passing_score", 70)

        return {
            "theory_score": round(theory_score_pct, 2),
            "practical_score": round(practical_score_pct, 2),
            "total_score": round(total_score, 2),
            "passed": passed
        }
