# Project Analysis: Commit Castre

## Project Overview
"Commit Castre" is a Next.js application designed to automate the creation of work summaries (emails) based on a user's GitHub commit history. It fetches commits for a specified date range and uses Google's Gemini AI to generate a professional email summary.

## Core Logic
1.  **User Input:** Accepts GitHub Token, Username, Start Date, and End Date.
2.  **Data Fetching:**
    -   Fetches user events to identify active repositories.
    -   Fetches commits from those repositories.
    -   Filters and sorts commits.
3.  **AI Generation:**
    -   Sends commit messages and date range to Gemini AI.
    -   Receives a structured email (Subject + Body).
4.  **Display:** Shows the commits and the generated email with a copy-to-clipboard feature.

## Structure
-   **Frontend:** Next.js App Router, Tailwind CSS, React Hook Form.
-   **State/Data:** React Query.
-   **AI:** Google Generative AI SDK (currently client-side).

---

## Proposed Improvements

### 1. Security (Critical)
-   **Move AI Logic to Server:** Currently, `NEXT_PUBLIC_GEMINI_API_KEY` is used, exposing the API key to the browser. This must be moved to a Server Action or API Route.
-   **Secure Token Handling:** The GitHub token is typed into a password field but not persisted. Consider "Remember Me" functionality using secure local storage or session storage (with warnings), or OAuth.

### 2. Functional Improvements
-   **Tone Selection:** Allow users to choose the tone of the email (Professional, Casual, Bullet Points, etc.).
-   **Commit Selection:** Users should be able to manually select/deselect commits to include in the summary (e.g., exclude "typo fix").
-   **Pagination:** The current implementation fetches the first page of events (100) and commits (default 30 per repo?). It needs to handle pagination to ensure all relevant commits are captured.
-   **Date Validation:** Ensure Start Date is strictly before End Date.

### 3. UI/UX Enhancements
-   **Toast Notifications:** Add success/error toasts for actions like "Email Copied" or "Fetch Failed".
-   **Loading Skeletons:** Replace text-based loading with skeleton UI for a better experience.
-   **Persist Form Data:** Remember the username and repository choices to save time on return visits.

### 4. New Features
-   **Pull Request Support:** Fetch PRs instead of just commits for a higher-level summary.
-   **Export Options:** Export as Markdown, PDF, or directly open in default email client (`mailto:`).
-   **Visualization:** A simple activity graph showing commits per day in the selected range.

---

## Implementation Plan
I will proceed to implement the following high-impact changes:
1.  **Security Refactor:** Move Gemini API call to a Server Action.
2.  **Tone Selection:** Add UI and logic for different email tones.
3.  **Commit Selection:** Allow users to filter which commits are sent to the AI.
