const { useState, useEffect } = React;

function NotionAssistantPopup() {
    // React state instead of DOM manipulation
    const [status, setStatus] = useState("Checking status...");
    const [statusClass, setrStatusCllass] = useState("");
    const [pageInfo, setPageInfo] = useState("");

    // useEffect runs when component mounts (like our current checkNotionPage)
    useEffect(() => {
        checkNotionPage();
    }, []);

    async function checkNotionPage() {
        try {
            // Get the current tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

            if (!tab.url.includes('notion.so')) {
                setStatus("❌ Not a Notion page");
                setStatusClass("error");
                return;
            }

            // Ask the content script for page info
            const response = await chrome.tabs.sendMessage(tab.id, { action: "getPageInfo" });
            if (response && response.isNotion) {
                setStatus("✅ Notion page detected!");
                setStatusClass("success");
                setPageInfo(`<strong>Page Title:</strong> ${response.title}`);
            } else {
                // Check if we're in loading state
                chrome.storage.local.get(['isLoading', 'currentPageTitle'], (result) => {
                    if(result.isLoading) {
                        setStatus("🔄 Detecting Notion page...");
                        setStatusClass("loading");
                        setPageInfo("<em>Please wait...</em>");
                    } else {
                        setStatus("⏳ Waiting for Notion to load...");
                    }
                })
            }
        } catch (error) {
            console.error("Error:", error);
            setStatus("⚠️ Please refresh the Notion page");
            setStatusClass("warning");
        }
    }

    return (
        <div id="app">
            <h2>Notion AI Assistant</h2>
            <div id="status" className={ statusClass }>{ status }</div>
            <div id="page-info">{ pageInfo }</div>
        </div>
    );
}

ReactDOM.render(<NotionAssistantPopup />, document.getElementById('react-root'));