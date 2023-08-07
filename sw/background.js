chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ automaticRtl: true }, () => {
    chrome.action.setBadgeText({
      text: "ON",
    });
  });
});

chrome.storage.onChanged.addListener((changes) => {
  if (changes.automaticRtl) {
    chrome.action.setBadgeText({
      text: changes.automaticRtl.newValue ? "ON" : "OFF",
    });
  }
});
