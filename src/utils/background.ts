// background.ts
chrome.runtime.onMessage.addListener(
  (message: { type: string }, sender, sendResponse) => {
    if (message.type === "TRIGGER_EXTRACTION") {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        if (!tab?.id) {
          sendResponse({ error: "No active tab found" });
          return;
        }

        chrome.tabs.sendMessage(
          tab.id,
          { type: "TRIGGER_EXTRACTION" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error(
                "Error sending to content script:",
                chrome.runtime.lastError.message
              );
              sendResponse({ error: "Failed to reach content script" });
            } else sendResponse(response);
          }
        );
      });

      return true; // keep channel open
    }
  }
);
