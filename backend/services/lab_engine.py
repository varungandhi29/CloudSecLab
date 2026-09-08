import boto3
import subprocess
import os
import logging
import httpx
from config import settings

logger = logging.getLogger(__name__)

class LabEngine:
    def __init__(self, level_id: int):
        self.level_id = level_id
        self.endpoint = os.environ.get("LOCALSTACK_ENDPOINT", settings.LOCALSTACK_ENDPOINT)

    def get_client(self, service: str):
        return boto3.client(
            service,
            endpoint_url=self.endpoint,
            region_name="us-east-1",
            aws_access_key_id="test",
            aws_secret_access_key="test"
        )

    async def check_localstack_health(self) -> bool:
        try:
            async with httpx.AsyncClient() as client:
                health_url = f"{self.endpoint}/_localstack/health"
                response = await client.get(health_url, timeout=5)
                return response.status_code == 200
        except Exception as e:
            logger.warning(f"LocalStack health check failed: {e}")
            return False

    async def setup_lab(self, setup_commands: list) -> dict:
        results = []
        env = os.environ.copy()
        env["AWS_ACCESS_KEY_ID"] = "test"
        env["AWS_SECRET_ACCESS_KEY"] = "test"
        env["AWS_DEFAULT_REGION"] = "us-east-1"

        for cmd in setup_commands:
            formatted_cmd = cmd
            if "localhost:4566" in formatted_cmd:
                formatted_cmd = formatted_cmd.replace("http://localhost:4566", self.endpoint).replace("localhost:4566", self.endpoint.replace("http://", ""))
            elif "aws " in formatted_cmd and "--endpoint-url" not in formatted_cmd:
                formatted_cmd = formatted_cmd.replace("aws ", f"aws --endpoint-url={self.endpoint} ")
            
            if "aws " in formatted_cmd and "--region" not in formatted_cmd:
                formatted_cmd += " --region us-east-1"

            try:
                result = subprocess.run(
                    formatted_cmd,
                    shell=True,
                    capture_output=True,
                    text=True,
                    timeout=30,
                    env=env
                )
                success = result.returncode == 0
                results.append({
                    "command": formatted_cmd,
                    "success": success,
                    "output": result.stdout,
                    "error": result.stderr
                })
                if not success:
                    logger.warning(f"Lab setup command failed: {formatted_cmd}\nError: {result.stderr}")
            except Exception as e:
                logger.error(f"Error running setup command {cmd}: {e}")
                results.append({
                    "command": formatted_cmd,
                    "success": False,
                    "output": "",
                    "error": str(e)
                })

        success_count = sum(1 for r in results if r["success"])
        total_commands = len(setup_commands)
        is_successful = success_count >= total_commands * 0.8 if total_commands > 0 else True

        return {
            "success": is_successful,
            "commands_run": len(results),
            "commands_succeeded": success_count,
            "results": results
        }

    async def validate_lab(self, validation: dict, user_answer: str = None, user_input: str = None) -> dict:
        vtype = validation.get("type")
        input_text = (user_answer or user_input or "").strip()

        if vtype == "text_answer":
            answer = input_text
            correct = validation.get("correct_answer", "").strip()
            accepted = validation.get("accepted_answers", [])
            case_sensitive = validation.get("case_sensitive", False)

            if not case_sensitive:
                all_accepted = [correct.lower()] + [a.lower().strip() for a in accepted]
                passed = answer.lower() in all_accepted
            else:
                all_accepted = [correct] + [a.strip() for a in accepted]
                passed = answer in all_accepted

            return {
                "passed": passed,
                "feedback": "Correct! Practical objective achieved." if passed else f"Incorrect answer. Re-examine the lab resources."
            }

        elif vtype == "command_output":
            cmd = validation.get("check", "")
            if "aws " in cmd and "--endpoint-url" not in cmd:
                cmd = cmd.replace("aws ", f"aws --endpoint-url={self.endpoint} ")
            expected = validation.get("expected_contains", "")
            env = os.environ.copy()
            env["AWS_ACCESS_KEY_ID"] = "test"
            env["AWS_SECRET_ACCESS_KEY"] = "test"
            env["AWS_DEFAULT_REGION"] = "us-east-1"

            try:
                result = subprocess.run(
                    cmd, shell=True, capture_output=True, text=True, timeout=15, env=env
                )
                passed = expected.lower() in result.stdout.lower()
                output = result.stdout or result.stderr
            except Exception as e:
                passed = True if expected.lower() in (user_input or "").lower() else False
                output = f"Validation check note: {e}"

            return {
                "passed": passed,
                "feedback": "Correct! Lab objective complete." if passed else f"Not quite. Expected output to contain '{expected}'.",
                "output": output
            }

        return {"passed": False, "feedback": "Unknown validation type"}

    async def reset_lab(self, setup_commands: list) -> dict:
        try:
            iam = self.get_client("iam")
            s3 = self.get_client("s3")

            for user in iam.list_users().get("Users", []):
                try:
                    username = user["UserName"]
                    # Detach attached user policies
                    for policy in iam.list_attached_user_policies(UserName=username).get("AttachedPolicies", []):
                        iam.detach_user_policy(UserName=username, PolicyArn=policy["PolicyArn"])
                    iam.delete_user(UserName=username)
                except Exception:
                    pass

            for bucket in s3.list_buckets().get("Buckets", []):
                try:
                    s3.delete_bucket(Bucket=bucket["Name"])
                except Exception:
                    pass
        except Exception as e:
            logger.info(f"Lab engine reset cleanup notice: {e}")

        return await self.setup_lab(setup_commands)
