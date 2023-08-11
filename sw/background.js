chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set({ automaticRtl: true, blacklist: [] }, () => {});
});
