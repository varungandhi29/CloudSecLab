import json
import os

LEVELS_DIR = os.path.join(os.path.dirname(__file__), "..", "content", "levels")
os.makedirs(LEVELS_DIR, exist_ok=True)

# Topics mapping for levels 2..100
TOPICS = [
    # Level 1 is preserved explicitly
    {"id": 1, "title": "What is Cloud Computing?", "track": "beginner", "category": "fundamentals", "platform": "aws"},
    {"id": 2, "title": "Introduction to AWS IAM Users & Groups", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 3, "title": "IAM Managed vs Inline Policies", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 4, "title": "Understanding Least Privilege Principle", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 5, "title": "AWS S3 Bucket Basics & ACLs", "track": "beginner", "category": "storage", "platform": "aws"},
    {"id": 6, "title": "S3 Bucket Policies & Public Access Block", "track": "beginner", "category": "storage", "platform": "aws"},
    {"id": 7, "title": "AWS EC2 Security Groups & Inbound Rules", "track": "beginner", "category": "network", "platform": "aws"},
    {"id": 8, "title": "VPC Network Access Control Lists (NACLs)", "track": "beginner", "category": "network", "platform": "aws"},
    {"id": 9, "title": "Identity-Based vs Resource-Based Policies", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 10, "title": "IAM Roles vs IAM Users", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 11, "title": "Introduction to AWS CloudTrail Audit Logging", "track": "beginner", "category": "logging", "platform": "aws"},
    {"id": 12, "title": "AWS KMS Key Management & Encryption", "track": "beginner", "category": "encryption", "platform": "aws"},
    {"id": 13, "title": "AWS Secrets Manager & Hardcoded Credentials Risk", "track": "beginner", "category": "secrets", "platform": "aws"},
    {"id": 14, "title": "AWS Lambda Function Security Basics", "track": "beginner", "category": "serverless", "platform": "aws"},
    {"id": 15, "title": "AWS Security Hub & GuardDuty Fundamentals", "track": "beginner", "category": "monitoring", "platform": "aws"},
    {"id": 16, "title": "Azure Active Directory / Entra ID Basics", "track": "beginner", "category": "iam", "platform": "azure"},
    {"id": 17, "title": "Azure Role-Based Access Control (RBAC)", "track": "beginner", "category": "iam", "platform": "azure"},
    {"id": 18, "title": "Azure Storage Account Public Access Settings", "track": "beginner", "category": "storage", "platform": "azure"},
    {"id": 19, "title": "GCP IAM Roles & Service Accounts", "track": "beginner", "category": "iam", "platform": "gcp"},
    {"id": 20, "title": "GCP Cloud Storage Bucket Permissions", "track": "beginner", "category": "storage", "platform": "gcp"},
    {"id": 21, "title": "AWS STS Temporary Credentials & AssumeRole", "track": "beginner", "category": "iam", "platform": "aws"},
    {"id": 22, "title": "AWS S3 Bucket Versioning & MFA Delete", "track": "beginner", "category": "storage", "platform": "aws"},
    {"id": 23, "title": "Securing AWS EC2 Instance Metadata Service (IMDSv2)", "track": "beginner", "category": "compute", "platform": "aws"},
    {"id": 24, "title": "Cloud Attack Surface Reconnaissance", "track": "beginner", "category": "recon", "platform": "multi-cloud"},
    {"id": 25, "title": "Beginner Track Final Review & Assessment", "track": "beginner", "category": "assessment", "platform": "aws"},

    # Intermediate Track (26..50)
    {"id": 26, "title": "IAM Wildcard Permissions (*) & Action Over-Granting", "track": "intermediate", "category": "iam", "platform": "aws"},
    {"id": 27, "title": "Over-Privileged PassRole & Privilege Escalation", "track": "intermediate", "category": "privilege_escalation", "platform": "aws"},
    {"id": 28, "title": "S3 Pre-Signed URLs & Unintended Data Exposure", "track": "intermediate", "category": "storage", "platform": "aws"},
    {"id": 29, "title": "Cross-Account Role Delegation & Confused Deputy", "track": "intermediate", "category": "iam", "platform": "aws"},
    {"id": 30, "title": "AWS IAM Policy Evaluation Logic & Explicit Deny", "track": "intermediate", "category": "iam", "platform": "aws"},
    {"id": 31, "title": "AWS Service Control Policies (SCPs) in Organizations", "track": "intermediate", "category": "governance", "platform": "aws"},
    {"id": 32, "title": "EC2 UserData Shell Script Injection & Secret Exposure", "track": "intermediate", "category": "compute", "platform": "aws"},
    {"id": 33, "title": "AWS CloudTrail Log File Integrity Validation & Evasion", "track": "intermediate", "category": "logging", "platform": "aws"},
    {"id": 34, "title": "AWS KMS Key Policy Misconfigurations", "track": "intermediate", "category": "encryption", "platform": "aws"},
    {"id": 35, "title": "Exploiting Unencrypted S3 Snapshots & EBS Volumes", "track": "intermediate", "category": "storage", "platform": "aws"},
    {"id": 36, "title": "Serverless API Gateway & Lambda Privilege Escalation", "track": "intermediate", "category": "serverless", "platform": "aws"},
    {"id": 37, "title": "AWS Secrets Manager Rotation Exploitation", "track": "intermediate", "category": "secrets", "platform": "aws"},
    {"id": 38, "title": "Azure Storage Access Keys & SAS Token Abuse", "track": "intermediate", "category": "storage", "platform": "azure"},
    {"id": 39, "title": "GCP Service Account Impersonation & Token Hijacking", "track": "intermediate", "category": "iam", "platform": "gcp"},
    {"id": 40, "title": "AWS SSM Parameter Store Secret Extraction", "track": "intermediate", "category": "secrets", "platform": "aws"},
    {"id": 41, "title": "IAM Permission Boundaries Bypass & Constraints", "track": "intermediate", "category": "iam", "platform": "aws"},
    {"id": 42, "title": "S3 Bucket Policy Principal Wildcard Misconfigurations", "track": "intermediate", "category": "storage", "platform": "aws"},
    {"id": 43, "title": "VPC Peering & Unrestricted Transit Gateways", "track": "intermediate", "category": "network", "platform": "aws"},
    {"id": 44, "title": "Container Security — AWS ECR Vulnerability Scanning", "track": "intermediate", "category": "containers", "platform": "aws"},
    {"id": 45, "title": "AWS Elastic Beanstalk Environment Compromise", "track": "intermediate", "category": "compute", "platform": "aws"},
    {"id": 46, "title": "CloudTrail Shadow Logging & Disabling Audit Logs", "track": "intermediate", "category": "logging", "platform": "aws"},
    {"id": 47, "title": "IAM CreateAccessKey Backdoor Persistence", "track": "intermediate", "category": "persistence", "platform": "aws"},
    {"id": 48, "title": "AWS Security Hub Automated Findings Analysis", "track": "intermediate", "category": "monitoring", "platform": "aws"},
    {"id": 49, "title": "Red Teaming Cloud Metadata Endpoints (SSRF)", "track": "intermediate", "category": "exploitation", "platform": "aws"},
    {"id": 50, "title": "Intermediate Track Final Review & Assessment", "track": "intermediate", "category": "assessment", "platform": "aws"},

    # Advanced Track (51..75)
    {"id": 51, "title": "Advanced IAM Privilege Escalation — CreatePolicyVersion", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 52, "title": "Advanced IAM Privilege Escalation — SetDefaultPolicyVersion", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 53, "title": "Advanced IAM Privilege Escalation — CreateEC2WithRole", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 54, "title": "Advanced IAM Privilege Escalation — PutGroupPolicy / PutUserPolicy", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 55, "title": "Advanced IAM Privilege Escalation — UpdateAssumeRolePolicy", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 56, "title": "Advanced IAM Privilege Escalation — AttachRolePolicy", "track": "advanced", "category": "privilege_escalation", "platform": "aws"},
    {"id": 57, "title": "AWS CloudTrail Bypass Techniques & Event Filtering", "track": "advanced", "category": "logging", "platform": "aws"},
    {"id": 58, "title": "S3 Ransomware & Bucket Policy Destruction", "track": "advanced", "category": "storage", "platform": "aws"},
    {"id": 59, "title": "KMS Decryption Exploitation & Key Disabling", "track": "advanced", "category": "encryption", "platform": "aws"},
    {"id": 60, "title": "AWS Lambda Layer Code Injection & Environment Exfiltration", "track": "advanced", "category": "serverless", "platform": "aws"},
    {"id": 61, "title": "DynamoDB Injection & Data Exfiltration", "track": "advanced", "category": "database", "platform": "aws"},
    {"id": 62, "title": "Multi-Account CloudTrail Forwarding & Aggregation", "track": "advanced", "category": "logging", "platform": "aws"},
    {"id": 63, "title": "AWS Organizations SCP Bypass via Resource Policies", "track": "advanced", "category": "governance", "platform": "aws"},
    {"id": 64, "title": "Azure Key Vault Access Policy Exploitation", "track": "advanced", "category": "secrets", "platform": "azure"},
    {"id": 65, "title": "GCP IAM Condition Bypasses & Service Account Hijacking", "track": "advanced", "category": "iam", "platform": "gcp"},
    {"id": 66, "title": "Cloud Forensics — Analyzing Memory Dumps from Compromised EC2", "track": "advanced", "category": "forensics", "platform": "aws"},
    {"id": 67, "title": "Cloud Forensics — Investigating S3 Exfiltration via CloudTrail", "track": "advanced", "category": "forensics", "platform": "aws"},
    {"id": 68, "title": "AWS GuardDuty Threat Detection & Anomaly Analysis", "track": "advanced", "category": "monitoring", "platform": "aws"},
    {"id": 69, "title": "Attack Vector Analysis — Compromised CI/CD Pipeline Credentials", "track": "advanced", "category": "cicd", "platform": "aws"},
    {"id": 70, "title": "AWS STS GetSessionToken vs AssumeRole Credential Stealing", "track": "advanced", "category": "iam", "platform": "aws"},
    {"id": 71, "title": "AWS VPC Flow Logs Forensics & Network Exfiltration Tracking", "track": "advanced", "category": "network", "platform": "aws"},
    {"id": 72, "title": "Securing Kubernetes on AWS (EKS Security)", "track": "advanced", "category": "containers", "platform": "aws"},
    {"id": 73, "title": "Cloud Incident Response — Isolating Compromised EC2 & Sessions", "track": "advanced", "category": "incident_response", "platform": "aws"},
    {"id": 74, "title": "Defense-in-Depth Cloud Architecture Review", "track": "advanced", "category": "architecture", "platform": "aws"},
    {"id": 75, "title": "Advanced Track Final Review & Assessment", "track": "advanced", "category": "assessment", "platform": "aws"},

    # Expert CTF Track (76..100)
    {"id": 76, "title": "CTF: Breaking Out of EC2 Metadata & Escalating to Account Admin", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 77, "title": "CTF: Uncovering Hidden S3 Objects & Decrypting KMS Data", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 78, "title": "CTF: Exploiting Lambda Environment Variables to Recover Master Keys", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 79, "title": "CTF: Cross-Account Trust Exploitation & Persistent Backdoors", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 80, "title": "CTF: CloudTrail Log Manipulation & Forensic Reconstruction", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 81, "title": "CTF: ECR Image Poisoning & Reverse Shell in AWS ECS", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 82, "title": "CTF: Bypassing IAM Permission Boundaries via AssumeRole Chaining", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 83, "title": "CTF: Secrets Manager Token Interception & Database Takeover", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 84, "title": "CTF: SSRF in Cloud Web App to EC2 Metadata IMDSv1", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 85, "title": "CTF: Unrestricted S3 Public Bucket Exfiltration & Policy Patching", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 86, "title": "CTF: Compromised Developer Access Key & Persistence Hunting", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 87, "title": "CTF: Azure Blob Storage Anonymous Container Breach", "track": "expert", "category": "ctf", "platform": "azure"},
    {"id": 88, "title": "CTF: GCP Metadata Server Privilege Escalation", "track": "expert", "category": "ctf", "platform": "gcp"},
    {"id": 89, "title": "CTF: AWS CodePipeline Poisoned Pipeline Execution", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 90, "title": "CTF: Cloud Security Posture Management (CSPM) Audit Challenge", "track": "expert", "category": "ctf", "platform": "multi-cloud"},
    {"id": 91, "title": "CTF: Multi-Stage Cloud Attack Vector Analysis", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 92, "title": "CTF: AWS CloudTrail Threat Hunting & Timeline Analysis", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 93, "title": "CTF: Securing Serverless Architecture against RCE", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 94, "title": "CTF: Ransomware Simulation in AWS S3 & Recovery", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 95, "title": "CTF: IAM Policy Audit & Principle of Least Privilege Enforcement", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 96, "title": "CTF: Advanced Cloud Forensics — Reconstruction of Breach", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 97, "title": "CTF: Zero-Trust Cloud Network Architecture Challenge", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 98, "title": "CTF: Master Cloud Security Audit & Hardening", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 99, "title": "CTF: Full Spectrum AWS Pentest Challenge", "track": "expert", "category": "ctf", "platform": "aws"},
    {"id": 100, "title": "CTF Capstone: Master Cloud Security Operations & Defense", "track": "expert", "category": "ctf", "platform": "aws"}
]

def generate_level_data(t):
    lid = t["id"]
    title = t["title"]
    track = t["track"]
    cat = t["category"]
    platform = t["platform"]

    # Specific setup commands per topic
    if "Wildcard" in title or lid == 26:
        target_user = "wildcard-dev"
        target_policy = "WildcardFullAccess"
        flag = "wildcard-dev"
        setup_cmds = [
            f"aws --endpoint-url=http://localhost:4566 iam create-user --user-name {target_user}",
            f"aws --endpoint-url=http://localhost:4566 iam attach-user-policy --user-name {target_user} --policy-arn arn:aws:iam::aws:policy/AdministratorAccess"
        ]
        lab_steps = [
            {
                "step": 1,
                "instruction": f"List all IAM users in LocalStack to locate over-privileged accounts.",
                "command": "aws --endpoint-url=http://localhost:4566 iam list-users",
                "expected_output_contains": target_user,
                "explanation": "Identifies users created in the environment."
            },
            {
                "step": 2,
                "instruction": f"Inspect attached policies for user '{target_user}'.",
                "command": f"aws --endpoint-url=http://localhost:4566 iam list-attached-user-policies --user-name {target_user}",
                "expected_output_contains": "AdministratorAccess",
                "explanation": "Confirms the wildcard administrator policy assignment."
            }
        ]
    elif "S3" in title or "Storage" in title:
        bucket_name = f"csl-data-bucket-lvl{lid:03d}"
        flag = bucket_name
        setup_cmds = [
            f"aws --endpoint-url=http://localhost:4566 s3 mb s3://{bucket_name}",
            f"aws --endpoint-url=http://localhost:4566 s3api put-bucket-acl --bucket {bucket_name} --acl public-read"
        ]
        lab_steps = [
            {
                "step": 1,
                "instruction": "List all S3 buckets in the environment.",
                "command": "aws --endpoint-url=http://localhost:4566 s3 ls",
                "expected_output_contains": bucket_name,
                "explanation": "Queries S3 service to discover buckets."
            },
            {
                "step": 2,
                "instruction": f"Inspect bucket ACL for '{bucket_name}'.",
                "command": f"aws --endpoint-url=http://localhost:4566 s3api get-bucket-acl --bucket {bucket_name}",
                "expected_output_contains": "Grantee",
                "explanation": "Evaluates public access permissions on the bucket."
            }
        ]
    elif "Secrets" in title or "KMS" in title:
        secret_name = f"prod/db/credentials_lvl{lid:03d}"
        flag = "prod/db/credentials"
        setup_cmds = [
            f"aws --endpoint-url=http://localhost:4566 secretsmanager create-secret --name {secret_name} --secret-string '{{\"username\":\"admin\",\"password\":\"SecretPass123!\"}}'"
        ]
        lab_steps = [
            {
                "step": 1,
                "instruction": "List secrets in AWS Secrets Manager.",
                "command": "aws --endpoint-url=http://localhost:4566 secretsmanager list-secrets",
                "expected_output_contains": secret_name,
                "explanation": "Enumerates secrets stored in the account."
            },
            {
                "step": 2,
                "instruction": f"Retrieve secret values for '{secret_name}'.",
                "command": f"aws --endpoint-url=http://localhost:4566 secretsmanager get-secret-value --secret-id {secret_name}",
                "expected_output_contains": "SecretPass123!",
                "explanation": "Exposes sensitive credentials stored in plain text."
            }
        ]
    else:
        user_name = f"user-lvl{lid:03d}"
        flag = user_name
        setup_cmds = [
            f"aws --endpoint-url=http://localhost:4566 iam create-user --user-name {user_name}",
            f"aws --endpoint-url=http://localhost:4566 iam attach-user-policy --user-name {user_name} --policy-arn arn:aws:iam::aws:policy/ReadOnlyAccess"
        ]
        lab_steps = [
            {
                "step": 1,
                "instruction": f"List IAM users to locate target identity '{user_name}'.",
                "command": "aws --endpoint-url=http://localhost:4566 iam list-users",
                "expected_output_contains": user_name,
                "explanation": "Lists users in the account."
            },
            {
                "step": 2,
                "instruction": f"Check policies attached to '{user_name}'.",
                "command": f"aws --endpoint-url=http://localhost:4566 iam list-attached-user-policies --user-name {user_name}",
                "expected_output_contains": "ReadOnlyAccess",
                "explanation": "Verifies managed policies attached to the identity."
            }
        ]

    # Generate complete level JSON structure
    level_json = {
        "level_id": lid,
        "title": title,
        "track": track,
        "category": cat,
        "cloud_platform": platform,
        "xp_reward": 100 if track == "beginner" else (150 if track == "intermediate" else (200 if track == "advanced" else 300)),
        "estimated_minutes": 20,
        "prerequisites": [lid - 1] if lid > 1 else [],

        "theory": {
            "intro": f"{title} is a core security discipline in {platform.upper()} cloud operations.",
            "sections": [
                {
                    "heading": f"Understanding {title}",
                    "type": "text",
                    "content": f"In modern cloud environments, proper configuration of {title} ensures privilege boundaries and access controls prevent unauthorized resource manipulation."
                },
                {
                    "heading": "Security Risks & Attack Vectors",
                    "type": "callout",
                    "callout_type": "warning",
                    "content": f"Misconfigurations related to {title} allow attackers to perform unauthorized reconnaissance, privilege escalation, and persistent access within your cloud tenant."
                },
                {
                    "heading": "Defense & Mitigation Strategies",
                    "type": "text",
                    "content": "Enforce strict principle of least privilege, continuous auditing via CloudTrail/Config, and automated guardrails."
                }
            ],
            "key_terms": [
                {"term": "Least Privilege", "definition": "Granting only minimum permissions required to perform job functions."},
                {"term": "CloudTrail", "definition": "AWS auditing service tracking API activity across account resources."},
                {"term": "Audit Logging", "definition": "Capturing and analyzing event logs for incident detection and forensics."}
            ]
        },

        "tasks": [
            {
                "task_number": 1,
                "title": f"Core Security Principle: {title}",
                "description": f"Evaluate the security impact of {title} in cloud infrastructure.",
                "question": {
                    "type": "multiple_choice",
                    "text": f"What is the primary security risk associated with misconfiguring {title}?",
                    "options": [
                        "Excessive latency in API network calls",
                        "Unauthorized privilege escalation or data exposure",
                        "Increased monthly cloud billing costs",
                        "Automatic deletion of cloud backups"
                    ],
                    "correct": 1,
                    "explanation": f"Misconfiguring {title} directly breaches privilege boundaries, allowing attackers to access unauthorized resources."
                }
            },
            {
                "task_number": 2,
                "title": "Remediation Strategy",
                "description": "Select the recommended defensive control.",
                "question": {
                    "type": "multiple_choice",
                    "text": "Which security framework principle best prevents cloud misconfigurations?",
                    "options": [
                        "Default Allow All Access",
                        "Principle of Least Privilege",
                        "Hardcoded Administrator Keys",
                        "Disabling Audit Logging"
                    ],
                    "correct": 1,
                    "explanation": "The Principle of Least Privilege ensures identities are restricted to minimum required permissions."
                }
            }
        ],

        "lab": {
            "title": f"Hands-On Lab: {title}",
            "scenario": f"You are auditing a cloud environment for compliance and misconfigurations related to {title}.",
            "objective": f"Use the AWS CLI to inspect resources and identify the target configuration value.",
            "setup_commands": setup_cmds,
            "steps": lab_steps,
            "validation": {
                "type": "text_answer",
                "question": f"What is the target resource or user name associated with this lab objective?",
                "correct_answer": flag,
                "case_sensitive": False
            },
            "hints": [
                "Use AWS CLI commands to list resources",
                "Review the step commands for exact parameters"
            ]
        },

        "forensics": {
            "enabled": True,
            "scenario": f"CloudTrail logs captured suspicious API calls related to {title}. Analyze the events below.",
            "log_entries": [
                {
                    "eventTime": "2024-03-15T04:10:12Z",
                    "eventName": "ListUsers" if "IAM" in title else "ListBuckets",
                    "userIdentity": {"type": "IAMUser", "userName": f"analyst-lvl{lid:03d}"},
                    "sourceIPAddress": "198.51.100.55",
                    "userAgent": "aws-cli/2.0"
                },
                {
                    "eventTime": "2024-03-15T04:12:45Z",
                    "eventName": "AttachUserPolicy" if "IAM" in title else "PutBucketAcl",
                    "userIdentity": {"type": "IAMUser", "userName": f"analyst-lvl{lid:03d}"},
                    "sourceIPAddress": "198.51.100.55",
                    "requestParameters": {"target": flag}
                }
            ],
            "questions": [
                {
                    "question_number": 1,
                    "text": "What was the source IP address of the suspicious request?",
                    "correct_answer": "198.51.100.55",
                    "hint": "Check the sourceIPAddress field in the audit log entry."
                },
                {
                    "question_number": 2,
                    "text": "What user identity executed the API calls?",
                    "correct_answer": f"analyst-lvl{lid:03d}",
                    "hint": "Check the userIdentity.userName field."
                }
            ]
        }
    }
    return level_json

def main():
    print("Generating levels 2 to 100...")
    for t in TOPICS:
        lid = t["id"]
        if lid == 1:
            continue  # Do NOT overwrite level_001.json
        filepath = os.path.join(LEVELS_DIR, f"level_{lid:03d}.json")
        data = generate_level_data(t)
        with open(filepath, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    print("Successfully generated levels 2 to 100!")

if __name__ == "__main__":
    main()
