chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ automaticRtl: true, blacklist: [] }, () => {
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
