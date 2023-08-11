const goToOptionsButton = document.querySelector("#go-to-options");

if (goToOptionsButton) {
  goToOptionsButton.addEventListener("click", () => {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL("options/options.html"));
    }
  });
}

const automaticRtlOn = document.querySelector(".toggle-autortl .on");
const automaticRtlOff = document.querySelector(".toggle-autortl .off");

automaticRtlOn.addEventListener("click", () => {
  chrome.storage.sync.set({ automaticRtl: true }, () => {
    automaticRtlOn.classList.add("active");
    automaticRtlOff.classList.remove("active");
  });
});

automaticRtlOff.addEventListener("click", () => {
  chrome.storage.sync.set({ automaticRtl: false }, () => {
    automaticRtlOff.classList.add("active");
    automaticRtlOn.classList.remove("active");
  });
});
