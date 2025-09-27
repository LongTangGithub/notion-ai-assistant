console.log("🚀 Notion AI Assistant: Content script loaded!")

function isNotionPage() {
    return document.querySelector(',notion-app-inner') !== null;
}

function getPageTitle() {
    // Method 1: Look for the title in the page header
    const titleElement = document.querySelector('[data-content-editable-leaf="true"][placeholder="Untitled"]')
    return titleElement ? titleElement.textContent.trim() : null;

    // Method 2: Look for any h1 with role="textbox"
    const h1Element = document.querySelector('h1[role="textbox');
    return h1Element ? h1Element.textContent.trim() : null;

    // Method 3: Fallback to document title
    return document.title.replace(' | Notion', '');;
}

function waitForNotion() {
    const checkInterval = setInterval(() => {
        if ( isNotionPage() ) {
            clearInterval( checkInterval );
            console.log("✅ Notion detected!");

            const title = getPageTitle();
            console.log(`📄 Page Title: ${title}`);

            // Store the page title so popup can access it
            chrome.storage.local.set({
                currentPageTitle: title,
                isNotionPage: true
            });
        }
    }, 1000); // Check every second
}

// Start detection when page loads
waitForNotion();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if( request.action === "getPageInfo") {
        sendResponse({
            isNotion: isNotionPage(),
            title: getPageTitle()
        });
    }
});