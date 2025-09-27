console.log("🎯 Notion AI Assistant: Background script loaded!");

// Listen for when the user clicks on a Notion tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url && tab.url.includes('notion.so')) {
      console.log("User switched to Notion tab:", tab.url);
    }
  });
});