import requests
import json

# === CONFIG ===
GITHUB_TOKEN = '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'
REPO_OWNER = 'devAshu-4299'
REPO_NAME = 'ashish-truce-hackathon-2025'

headers = {
    "Authorization": f"token {GITHUB_TOKEN}",
    "Accept": "application/vnd.github.v3+json"
}

# === Already Created ISSUE DATA ===
# issues =[
#   {
#     "title": "Create project scaffold using Vue 3 + TailwindCSS",
#     "body": "Category: frontend\nLabel: chore\nPriority: P1",
#     "labels": ["frontend", "chore", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Implement landing page UI with CTA",
#     "body": "Category: frontend\nLabel: feature\nPriority: P1",
#     "labels": ["frontend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Create user registration/login pages with Supabase Auth",
#     "body": "Category: frontend\nLabel: feature\nPriority: P0",
#     "labels": ["frontend", "feature", "P0"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Dashboard UI to display summarized consents and status",
#     "body": "Category: frontend\nLabel: feature\nPriority: P1",
#     "labels": ["frontend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Consent detail modal with revoke option",
#     "body": "Category: frontend\nLabel: feature\nPriority: P1",
#     "labels": ["frontend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Integrate API with backend for user data",
#     "body": "Category: frontend\nLabel: feature\nPriority: P1",
#     "labels": ["frontend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Add loading states, error handling, and UX polish",
#     "body": "Category: frontend\nLabel: tech-debt\nPriority: P2",
#     "labels": ["frontend", "tech-debt", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Unit test for components and auth guards",
#     "body": "Category: frontend\nLabel: feature\nPriority: P2",
#     "labels": ["frontend", "feature", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Set up FastAPI project with basic structure",
#     "body": "Category: backend\nLabel: chore\nPriority: P1",
#     "labels": ["backend", "chore", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Implement /summarize-policy endpoint using OpenAI or LangChain",
#     "body": "Category: backend\nLabel: feature\nPriority: P0",
#     "labels": ["backend", "feature", "P0"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Create /consents and /revoke endpoints (CRUD)",
#     "body": "Category: backend\nLabel: feature\nPriority: P1",
#     "labels": ["backend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Integrate Supabase DB with FastAPI",
#     "body": "Category: backend\nLabel: feature\nPriority: P1",
#     "labels": ["backend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Token-based auth middleware (verify JWT from Supabase)",
#     "body": "Category: backend\nLabel: feature\nPriority: P0",
#     "labels": ["backend", "feature", "P0"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Cache LLM results to reduce cost (optional Redis or Supabase)",
#     "body": "Category: backend\nLabel: tech-debt\nPriority: P2",
#     "labels": ["backend", "tech-debt", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Write unit tests for API routes",
#     "body": "Category: backend\nLabel: feature\nPriority: P1",
#     "labels": ["backend", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Evaluate and select AI model (OpenAI vs OSS)",
#     "body": "Category: ai\nLabel: chore\nPriority: P1",
#     "labels": ["ai", "chore", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Integrate LangChain for summarization",
#     "body": "Category: ai\nLabel: feature\nPriority: P1",
#     "labels": ["ai", "feature", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Prompt tuning for summarizing policies",
#     "body": "Category: ai\nLabel: feature\nPriority: P2",
#     "labels": ["ai", "feature", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Configure frontend CI/CD on Vercel",
#     "body": "Category: infra\nLabel: chore\nPriority: P1",
#     "labels": ["infra", "chore", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Deploy FastAPI backend on Render.com",
#     "body": "Category: infra\nLabel: chore\nPriority: P1",
#     "labels": ["infra", "chore", "P1"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Set up GitHub Actions for backend tests",
#     "body": "Category: infra\nLabel: chore\nPriority: P2",
#     "labels": ["infra", "chore", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Write README with setup instructions",
#     "body": "Category: docs\nLabel: chore\nPriority: P2",
#     "labels": ["docs", "chore", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Add CONTRIBUTING.md and PR template",
#     "body": "Category: docs\nLabel: chore\nPriority: P2",
#     "labels": ["docs", "chore", "P2"],
#     "assignees": ["devAshu-4299"]
#   },
#   {
#     "title": "Create issue templates in GitHub",
#     "body": "Category: docs\nLabel: chore\nPriority: P2",
#     "labels": ["docs", "chore", "P2"],
#     "assignees": ["devAshu-4299"]
#   }
# ]


# === CREATE ISSUES ===
def create_issue(issue):
    url = f"https://api.github.com/repos/{REPO_OWNER}/{REPO_NAME}/issues"
    response = requests.post(url, headers=headers, json=issue)
    if response.status_code == 201:
        print(f"✅ Created issue: {issue['title']}")
    else:
        print(f"❌ Failed to create issue: {issue['title']} - {response.status_code} - {response.text}")

for issue in issues:
    create_issue(issue)
