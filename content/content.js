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
            return titleElement.textContent.trim();
        }

        // Method 2: Fallback to document title
        return document.title.replace(' | Notion', '') || "Untitled";

    } catch (error) {
        console.log("🔧 Title extraction error:", error);
        return "Untitled";
    }
}


function waitForNotion() {
    // Wait a bit for Notion to start loading
    setTimeout(() => {
      const checkInterval = setInterval(() => {
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
              isNotionPage: true 
            });
          }, 500); // Wait 500ms after detecting Notion
        }
      }, 1000); // Check every second
      
      // Stop checking after 10 seconds
      setTimeout(() => clearInterval(checkInterval), 10000);
    }, 2000); // Wait 2 seconds before starting
  }

// Start detection when page loads
waitForNotion();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageInfo") {
        sendResponse({
            isNotion: isNotionPage(),
            title: getPageTitle()
        });
    }
});