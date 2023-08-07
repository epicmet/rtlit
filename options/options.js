const saveOptions = () => {
  const automaticRtl = document.getElementById("automatic-rtl").checked;

  chrome.storage.sync.set({ automaticRtl }, () => {
    const status = document.getElementById("status");

    status.textContent = `Options saved. ${
      !automaticRtl ? "Reload pages to get rid of already rtled text" : ""
    }`;
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get({ automaticRtl: true }, (items) => {
    document.getElementById("automatic-rtl").checked = items.automaticRtl;
  });
};

document.addEventListener("DOMContentLoaded", restoreOptions);
document.getElementById("save").addEventListener("click", saveOptions);
