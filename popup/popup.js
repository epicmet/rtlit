const goToOptionsButton = document.querySelector("#go-to-options");

goToOptionsButton.addEventListener("click", () => {
  if (chrome.runtime.openOptionsPage) {
    chrome.runtime.openOptionsPage();
  } else {
    window.open(chrome.runtime.getURL("options/options.html"));
  }
});
