from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080")

        # Wait for potential data loading
        time.sleep(5)

        page.screenshot(path="verification/home.png")
        browser.close()

if __name__ == "__main__":
    run()
