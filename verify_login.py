
from playwright.sync_api import sync_playwright

def verify_login_page():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Go to the home page (which should be the login page now)
        page.goto("http://localhost:3001")

        # Wait for the page to load
        page.wait_for_load_state("networkidle")

        # Verify the "Sign in with GitHub" button exists
        # It's a button inside a form
        signin_button = page.locator("button", has_text="Sign in with GitHub")

        if signin_button.is_visible():
            print("Login button found.")
        else:
            print("Login button NOT found.")

        # Take a screenshot
        page.screenshot(path="verification_login.png")

        browser.close()

if __name__ == "__main__":
    verify_login_page()
