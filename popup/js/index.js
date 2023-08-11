function getStorage(keys) {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(keys, (items) => {
      if (typeof keys === "string") {
        resolve(items[keys]);
      } else {
        resolve(items);
      }
    });
  });
}

const blacklistedWebsites = await getStorage("blacklist");

const blacklist = document.querySelector(".black-lists");

function createBlackListWebsite({ website }) {
  const itemDiv = document.createElement("div");
  itemDiv.classList.add("black-list-item");

  const p = document.createElement("p");
  p.classList.add("black-list-website");
  p.textContent = website;

  const iconImg = document.createElement("img");
  iconImg.classList.add("black-list-icon");
  iconImg.src = "./x.svg";

  iconImg.addEventListener("click", () => {
    const newList = blacklistedWebsites.filter((w) => w !== website);
    chrome.storage.sync.set({ blacklist: newList }, () => {
      itemDiv.remove();
    });
  });

  itemDiv.append(p, iconImg);

  return itemDiv;
}

function addNewBlacklistItem() {
  const blacklistInput = document.querySelector("#black-list-input");
  const website = blacklistInput.value;

  blacklistInput.classList.remove("error");

  // TODO: Better validation
  if (!website || website.split(".").length <= 1) {
    blacklistInput.classList.add("error");
    return;
  }

  const newList = [...blacklistedWebsites, website];
  chrome.storage.sync.set({ blacklist: newList }, () => {
    blacklistInput.value = "";
    const newItem = createBlackListWebsite({ website });
    blacklist.append(newItem);
  });
}

document
  .querySelector("#black-list-add-button")
  .addEventListener("click", addNewBlacklistItem);

document.querySelector("#black-list-input").addEventListener("keyup", (e) => {
  e.preventDefault();

  if (e.key === "Enter") {
    addNewBlacklistItem();
  }
});

blacklistedWebsites.forEach((address) => {
  const blacklistItem = createBlackListWebsite({ website: address });
  blacklist.append(blacklistItem);
});

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

function autoRtlHandleView(state = "on") {
  if (state.toLowerCase() === "on") {
    automaticRtlOn.classList.add("active");
    automaticRtlOff.classList.remove("active");
  } else if (state.toLowerCase() === "off") {
    automaticRtlOff.classList.add("active");
    automaticRtlOn.classList.remove("active");
  }
}

chrome.storage.sync.get({ automaticRtl: true }, (items) => {
  autoRtlHandleView(items.automaticRtl ? "on" : "off");
});

automaticRtlOn.addEventListener("click", () => {
  chrome.storage.sync.set({ automaticRtl: true }, () => {
    autoRtlHandleView("on");
  });
});

automaticRtlOff.addEventListener("click", () => {
  chrome.storage.sync.set({ automaticRtl: false }, () => {
    autoRtlHandleView("off");
  });
});
