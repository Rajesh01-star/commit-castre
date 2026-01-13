
# Agent Instructions

## Authentication Setup
This project uses NextAuth.js for GitHub authentication. To make it work locally, you **must** create a `.env` or `.env.local` file in the root directory with the following variables:

```bash
AUTH_SECRET="your-generated-secret" # Run `npx auth secret` to generate one
GITHUB_ID="your-github-client-id"
GITHUB_SECRET="your-github-client-secret"
GEMINI_API_KEY="your-gemini-api-key"
```

If these are missing, you will see a "Server error" when trying to sign in.
