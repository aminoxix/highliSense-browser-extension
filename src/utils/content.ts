chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "TRIGGER_EXTRACTION") {
    const selection = window.getSelection()?.toString() || "";
    const context = document.body?.innerText || "";

    sendResponse({
      payload: {
        type: "extension",
        highlighter: selection,
        context,
      },
    });

    return true; // Important if sendResponse is async — keeps channel open
  }
});
