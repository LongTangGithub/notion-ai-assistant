console.log("🚀 Notion AI Assistant: Content script loaded!")

function isNotionPage() {
    return document.querySelector('.notion-app-inner') !== null;
}

function getPageTitle() {
    console.log("🔧 NEW getPageTitle() function running!");
    try {
        // Method 1: Use the working selector we found
        const titleElement = document.querySelector('h1[contenteditable="true"]');
        if (titleElement && titleElement.textContent.trim()) {
            console.log("✅ Title found via method 1 (contenteditable)");
            return titleElement.textContent.trim();
        }


        const titleElement2 = document.querySelector('h1');
        if (titleElement2 && titleElement2.textContent.trim()) {
            console.log("✅ Title found via method 2 (any h1)");
            return titleElement2.textContent.trim();
        }

        const docTitle = document.title.replace(' | Notion', '').trim();
        if (docTitle && docTitle !== 'Notion') {
            console.log("✅ Title found via method 3 (document title)");
            return docTitle;
        }

        console.log("🔧 No title found!, using fallback");
        return "Untitled Page";

    } catch (error) {
        console.log("🔧 Title extraction error:", error);
        return "Untitled";
    }
}


function waitForNotion() {
    console.log("🔍 Starting waitForNotion function...");

    // Set initial loading state
    chrome.storage.local.set({
        currentPageTitle: "Loading...",
        isNotionPage: false,
        isLoading: true,
    });

    // Wait a bit for Notion to start loading
    setTimeout(() => {
        console.log("🔍 Starting page detection loop...");
        let attempts = 0;
        const maxAttempts = 10;

        const checkInterval = setInterval(() => {
            attempts++;
            console.log(`🔍 Detection attempt ${attempts}/${maxAttempts}`);

            if (isNotionPage()) {
                // Wait a bit more for the title to load
                setTimeout(() => {
                    clearInterval(checkInterval);
                    console.log("✅ Notion page detected!");

                    const title = getPageTitle();
                    console.log("📄 Page title:", title);

                    // Store the title so our popup can access it
                    chrome.storage.local.set({
                        currentPageTitle: title,
                        isNotionPage: true,
                        isLoading: false
                    });
                }, 500);
            } else if (attempts >= maxAttempts) {
                // Failed to detect after max attempts
                clearInterval(checkInterval);
                console.log("❌ Failed to detect Notion page after", maxAttempts, "attempts");
                chrome.storage.local.set({
                    currentPageTitle: "Detection Failed",
                    isNotionPage: false,
                    isLoading: false
                });
            }
        }, 1000);
    }, 2000);
}

// Start detection when page loads
waitForNotion();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageInfo") {
        // Get fresh data instead of calling getPageTitle again
        chrome.storage.local.get(["currentPageTitle", "isNotionPage"], (result) => {
            sendResponse({
                isNotion: result.isNotionPage || false,
                title: result.currentPageTitle || getPageTitle()  // Only call as fallback
            });
        });
        return true;      // Keep the message channel open for sendResponse
    }
});

console.log("🎯 Content script setup complete - detection should start in 2 seconds");

// Detect URL changes in SPAs
let currentUrl = window.location.href;

function detectUrlChange() {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log("📍 Page navigation detected, restarting detection...");
        waitForNotion(); // Restart detection for new page
    }
}

// Check for URL changes every 1 second
setInterval(detectUrlChange, 1000);

// Also listen for browser navigation events
window.addEventListener('popstate', () => {
    console.log("📍 Browser navigation detected");
    waitForNotion();
});