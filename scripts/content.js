class Rtlit {
  CLASS_NAME = "RTLIT_RTL";
  STYLE_ID = "RTLIT_STYLE";

  // link: https://stackoverflow.com/questions/4446244/how-to-check-if-any-arabic-character-exists-in-the-string-javascript
  arabicLetterRegex = /[\u0600-\u06FF]/;
  targetElements = [];
  changedElements = [];
  styleEl = null;
  currentUrl = new URL(document.URL);
  blacklisted = false;

  constructor() {
    const parapraphs = document.querySelectorAll("p");
    const spans = document.querySelectorAll("span");

    this.targetElements = [...this.targetElements, ...parapraphs, ...spans];

    this.shouldRTL();
  }

  init() {
    this.createStyleTag();
    this.addStyleTag();

    this.targetElements.forEach((target) => this.addRtlClass(target));

    this.observeAddedNodes();
    this.addStorageEventListener();
  }

  shouldRTL() {
    let nextState = this.blacklisted;

    chrome.storage.sync.get("blacklist", (items) => {
      if (!items.blacklist) {
        nextState = false;
      } else if (Array.isArray(items.blacklist)) {
        // TODO: I can improve it later
        nextState = items.blacklist.some((url) => {
          try {
            const blacklistedURL = new URL(url);
            return blacklistedURL.host === this.currentUrl.host;
          } catch (e) {
            return url === this.currentUrl.host;
          }
        });
      }

      if (nextState !== this.blacklisted) {
        this.blacklisted = nextState;
        if (this.blacklisted) {
          this.removeStyleTag();
        } else {
          this.addStyleTag();
        }
      }
    });
  }

  addRtlClass(target) {
    if (target instanceof HTMLElement) {
      const firstLetter = target.innerHTML.slice(0, 1);
      if (!!firstLetter && firstLetter.match(this.arabicLetterRegex)) {
        target.classList.add(this.CLASS_NAME);
        this.changedElements.push(target);
      }
    }

    if (target.childNodes.length > 0) {
      target.childNodes.forEach((node) => {
        this.addRtlClass(node);
      });
    }
  }

  createStyleTag() {
    const styleEl = document.createElement("style");
    styleEl.id = this.STYLE_ID;
    styleEl.textContent = `
    .${this.CLASS_NAME} {
      direction: rtl;
      text-align: right;
    }
  `;

    this.styleEl = styleEl;
  }

  addStyleTag() {
    if (!this.styleEl) {
      throw new Error("Tried to add style tag before creating it");
    }

    if (this.blacklisted) {
      return;
    }

    document.head.appendChild(this.styleEl);
  }

  removeStyleTag() {
    const styleTag = document.head.querySelector(`#${this.STYLE_ID}`);
    if (styleTag) {
      styleTag.remove();
    }
  }

  addStorageEventListener() {
    chrome.storage.sync.onChanged.addListener((changes) => {
      if (changes.automaticRtl) {
        if (changes.automaticRtl.newValue) {
          this.addStyleTag();
        } else {
          this.removeStyleTag();
        }
      }

      if (changes.blacklist) {
        this.shouldRTL();
      }
    });
  }

  observeAddedNodes(target = document.body) {
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver;
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof HTMLElement) {
            this.addRtlClass(node);
          }
        });
      });
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  log(...toPrint) {
    console.log("RTLIT: ", ...toPrint);
  }
}

const rtlit = new Rtlit();

rtlit.init();
