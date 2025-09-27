console.log("🎨 Popup opened!");

async function checkNotionPage() {
  const statusDiv = document.getElementById('status');
  const pageInfoDiv = document.getElementById('page-info');
  
  try {
    // Get the current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab.url.includes('notion.so')) {
      statusDiv.textContent = "❌ Not a Notion page";
      statusDiv.className = "error";
      return;
    }
    
    // Ask the content script for page info
    const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" });
    
    if (response && response.isNotion) {
      statusDiv.textContent = "✅ Notion page detected!";
      statusDiv.className = "success";
      pageInfoDiv.innerHTML = `<strong>Page Title:</strong> ${response.title}`;
    } else {
      statusDiv.textContent = "⏳ Waiting for Notion to load...";
      statusDiv.className = "warning";
    }
  } catch (error) {
    console.error("Error:", error);
    statusDiv.textContent = "⚠️ Please refresh the Notion page";
    statusDiv.className = "warning";
  }
}

// Check when popup opens
checkNotionPage();