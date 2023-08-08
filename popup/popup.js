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
