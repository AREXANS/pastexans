from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto("http://localhost:8080")

        time.sleep(5)

        # Find the first Loadstring button
        # The button text might be "Loadstring" + icon, so get_by_role("button", name="Loadstring") is better
        # Or checking the text content.

        # In the screenshot, it says "Loadstring".
        # If the button is a dropdown trigger, clicking it should open the menu.

        buttons = page.get_by_role("button", name="Loadstring").all()
        if buttons:
            print(f"Found {len(buttons)} buttons")
            buttons[0].click()
            time.sleep(2)
            page.screenshot(path="verification/dropdown.png")
        else:
            print("No Loadstring buttons found")
            page.screenshot(path="verification/no_buttons.png")

        browser.close()

if __name__ == "__main__":
    run()
