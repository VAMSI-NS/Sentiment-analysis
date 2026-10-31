import os
import sys
import tempfile
import unittest
from pathlib import Path

from fastapi.testclient import TestClient


TEMP_DATABASE = tempfile.TemporaryDirectory()
os.environ["DATABASE_URL"] = f"sqlite:///{(Path(TEMP_DATABASE.name) / 'feedback-test.db').as_posix()}"
os.environ["DEAN_EMAIL"] = "dean@example.edu"
os.environ["DEAN_INITIAL_PASSWORD"] = "private-test-dean-password"
os.environ["SESSION_COOKIE_SECURE"] = "false"
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app.database import SessionLocal, User, engine  # noqa: E402
from app.main import app  # noqa: E402


ORIGIN = "https://sentiment-analysis-frontend-y6rc.onrender.com"


class AuthApiTests(unittest.TestCase):
    @classmethod
    def tearDownClass(cls):
        engine.dispose()
        TEMP_DATABASE.cleanup()

    def test_persistent_student_and_dean_access_controls(self):
        with TestClient(app) as client:
            dean_login = client.post(
                "/api/auth/login",
                headers={"Origin": ORIGIN},
                json={
                    "email": "dean@example.edu",
                    "password": "private-test-dean-password",
                    "role": "dean",
                },
            )
            self.assertEqual(dean_login.status_code, 200)
            self.assertNotIn("password", dean_login.json())
            self.assertIn("httponly", dean_login.headers["set-cookie"].lower())

            with SessionLocal() as db:
                dean = db.query(User).filter_by(email="dean@example.edu").one()
                self.assertNotEqual(dean.password_hash, "private-test-dean-password")
                self.assertTrue(dean.password_hash.startswith("$argon2"))

            self.assertEqual(client.get("/api/admin/summary").status_code, 200)
            self.assertEqual(
                client.post(
                    "/api/auth/register",
                    headers={"Origin": ORIGIN},
                    json={"email": "dean@example.edu", "password": "another-private-password"},
                ).status_code,
                409,
            )
            self.assertEqual(
                client.post(
                    "/api/auth/logout",
                    headers={"Origin": ORIGIN},
                ).status_code,
                204,
            )

            student_register = client.post(
                "/api/auth/register",
                headers={"Origin": ORIGIN},
                json={"email": "student@example.edu", "password": "student-private-password"},
            )
            self.assertEqual(student_register.status_code, 201)
            self.assertEqual(student_register.json()["role"], "student")
            self.assertNotIn("password", student_register.json())

            wrong_role = client.post(
                "/api/auth/login",
                headers={"Origin": ORIGIN},
                json={
                    "email": "student@example.edu",
                    "password": "student-private-password",
                    "role": "dean",
                },
            )
            self.assertEqual(wrong_role.status_code, 403)

            first = client.post(
                "/api/predict",
                headers={"Origin": ORIGIN},
                json={"text": "The helpful professor made the class excellent."},
            )
            second = client.post(
                "/api/predict",
                headers={"Origin": ORIGIN},
                json={"text": "The broken equipment is frustrating."},
            )
            self.assertEqual(first.status_code, 200)
            self.assertEqual(second.status_code, 200)
            self.assertEqual(first.json()["sentiment"], "positive")
            self.assertEqual(second.json()["sentiment"], "negative")
            self.assertNotEqual(first.json()["id"], second.json()["id"])

            own_feedback = client.get("/api/feedback/mine")
            self.assertEqual(own_feedback.status_code, 200)
            self.assertEqual(len(own_feedback.json()), 2)
            self.assertTrue(all(record["text"] for record in own_feedback.json()))
            self.assertEqual(client.get("/api/admin/summary").status_code, 403)
            self.assertEqual(client.get("/api/admin/feedback").status_code, 403)
            self.assertEqual(client.get("/api/admin/students").status_code, 403)

            client.post(
                "/api/auth/logout",
                headers={"Origin": ORIGIN},
            )
            other_student = client.post(
                "/api/auth/register",
                headers={"Origin": ORIGIN},
                json={"email": "other@example.edu", "password": "another-private-password"},
            )
            self.assertEqual(other_student.status_code, 201)
            self.assertEqual(
                client.post(
                    "/api/predict",
                    headers={"Origin": ORIGIN},
                    json={"text": "The course covers the published syllabus."},
                ).status_code,
                200,
            )
            self.assertEqual(len(client.get("/api/feedback/mine").json()), 1)
            client.post("/api/auth/logout", headers={"Origin": ORIGIN})

            client.post(
                "/api/auth/login",
                headers={"Origin": ORIGIN},
                json={
                    "email": "student@example.edu",
                    "password": "student-private-password",
                    "role": "student",
                },
            )
            self.assertEqual(len(client.get("/api/feedback/mine").json()), 2)
            client.post("/api/auth/logout", headers={"Origin": ORIGIN})
            self.assertEqual(client.get("/api/feedback/mine").status_code, 401)
            self.assertEqual(client.post("/api/predict", json={"text": "Should not be accepted."}).status_code, 401)

            dean_login = client.post(
                "/api/auth/login",
                headers={"Origin": ORIGIN},
                json={
                    "email": "dean@example.edu",
                    "password": "private-test-dean-password",
                    "role": "dean",
                },
            )
            self.assertEqual(dean_login.status_code, 200)
            summary = client.get("/api/admin/summary")
            self.assertEqual(summary.status_code, 200)
            self.assertEqual(summary.json()["total_feedback"], 3)
            self.assertEqual(summary.json()["total_students"], 2)
            self.assertEqual(summary.json()["sentiment_counts"], {"positive": 1, "neutral": 1, "negative": 1})
            self.assertEqual(len(summary.json()["trend"]), 7)

            records = client.get("/api/admin/feedback?sentiment=negative&search=broken")
            self.assertEqual(records.status_code, 200)
            self.assertEqual(records.json()["total"], 1)
            self.assertEqual(records.json()["items"][0]["student_email"], "student@example.edu")
            students = client.get("/api/admin/students")
            self.assertEqual(students.status_code, 200)
            self.assertEqual(students.json()["total"], 2)
            self.assertEqual(sum(student["feedback_count"] for student in students.json()["items"]), 3)
            self.assertNotIn("password_hash", students.text)

            rejected_origin = client.post(
                "/api/auth/logout",
                headers={"Origin": "https://malicious.example"},
            )
            self.assertEqual(rejected_origin.status_code, 403)
            self.assertEqual(client.get("/api/admin/summary").status_code, 200)

            self.assertEqual(
                client.post(
                    "/api/auth/logout",
                    headers={"Origin": ORIGIN},
                ).status_code,
                204,
            )
            self.assertEqual(client.get("/api/admin/summary").status_code, 401)


if __name__ == "__main__":
    unittest.main()
