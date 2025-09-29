const { useState, useEffect } = React;

function NotionAssistantPopup() {
  const [status, setStatus] = useState("Checking status...");
  const [statusClass, setStatusClass] = useState("");
  const [pageInfo, setPageInfo] = useState("");

  useEffect(() => {
    checkNotionPage();
  }, []);

  async function checkNotionPage() {
    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (!tab.url.includes('notion.so')) {
        setStatus("❌ Not a Notion page");
        setStatusClass("error");
        return;
      }
      
      const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" });
      
      if (response && response.isNotion) {
        setStatus("✅ Notion page detected!");
        setStatusClass("success");
        setPageInfo(`Page Title: ${response.title}`);
      } else {
        chrome.storage.local.get(['isLoading', 'currentPageTitle'], (result) => {
          if (result.isLoading) {
            setStatus("🔄 Detecting Notion page...");
            setStatusClass("loading");
            setPageInfo("Please wait...");
          } else {
            setStatus("⏳ Waiting for Notion to load...");
            setStatusClass("warning");
          }
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setStatus("⚠️ Please refresh the Notion page");
      setStatusClass("warning");
    }
  }

  // Plain JavaScript instead of JSX
  return React.createElement('div', { id: 'app' },
    React.createElement('h2', null, 'Notion AI Assistant'),
    React.createElement('div', { id: 'status', className: statusClass }, status),
    React.createElement('div', { id: 'page-info' }, pageInfo)
  );
}

// Render the component
const root = ReactDOM.createRoot(document.getElementById('react-root'));
root.render(React.createElement(NotionAssistantPopup));