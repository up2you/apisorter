# Automation Setup Guide

## GitHub Actions: Daily AI Discovery

We have set up a workflow (`.github/workflows/daily-discovery.yml`) that runs daily at **06:00 UTC** to discover and analyze new APIs.

### 1. Required Secrets
For this to work, you must add the following **Repository Secrets** in GitHub:

1.  Go to your Repository on GitHub.
2.  Navigate to **Settings** > **Secrets and variables** > **Actions**.
3.  Click **New repository secret**.
4.  Add the following:

| Name | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://...` | Your Supabase Transaction or Session Pooler URL. |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `AIza...` | Your Google Gemini API Key. |

### 2. Manual Trigger
You can force run the discovery at any time:
1.  Go to **Actions** tab.
2.  Select **Daily AI Discovery**.
3.  Click **Run workflow**.

### 3. Debugging
-   Check the "Run AI Discovery Engine" step logs for output.
-   If Playwright fails, ensure `npx playwright install chromium --with-deps` is in the workflow (it is already included).
