console.log(
  "-------------------------- RTLIT Content script loadead --------------------------",
);

class Rtlit {
  CLASS_NAME = "RTLIT_RTL";
  STYLE_ID = "RTLIT_STYLE";

  // link: https://stackoverflow.com/questions/4446244/how-to-check-if-any-arabic-character-exists-in-the-string-javascript
  arabicLetterRegex = /[\u0600-\u06FF]/;
  targetElements: HTMLElement[] = [];
  changedElements: HTMLElement[] = [];
  styleEl: HTMLStyleElement | null = null;
  currentUrl = new URL(document.URL);
  blacklisted = false;
  autoRtl = true;

  foo = 0;

  constructor(autoRtl = true) {
    this.autoRtl = autoRtl;

    const paragraphs = document.querySelectorAll("p");
    const spans = document.querySelectorAll("span");

    this.targetElements = [
      ...this.targetElements,
      ...Array.from(paragraphs),
      ...Array.from(spans),
    ];

    this.shouldRTL();
  }

  init() {
    console.log("---------------- RTLIT: init ----------------");
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

  // FIXME: `target` should not be ChildNode!
  // Either handle the ChildNode situation or just pass HTMLElement
  addRtlClass(target: HTMLElement | ChildNode) {
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

    if (this.blacklisted || !this.autoRtl) {
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
        this.autoRtl = changes.automaticRtl.newValue;

        if (changes.automaticRtl.newValue) {
          this.addStyleTag();
        } else {
          this.removeStyleTag();
        }
      }

      if (changes.blacklist) {
        // TODO: I can just pass the new blacklist here! Why am I getting it from the setting again in the function below?
        this.shouldRTL();
      }
    });
  }

  observeAddedNodes(target = document.body) {
    console.log("---------------- RTLIT: observer ----------------");

    const observer = new MutationObserver((mutations) => {
      if (this.foo > 1_000) {
        return;
      }

      const id = parseInt((Date.now() * Math.random()).toString().slice(0, 2));
      console.log("-------- RTLIT: Mutations", id);

      mutations.forEach((mutation) => {
        this.foo++;

        if (this.foo > 1_000) {
          return;
        }

        console.log("----- RTLIT: mu", mutation);

        mutation.addedNodes.forEach((node) => {
          if (this.foo > 1_000) {
            return;
          }
          if (
            node instanceof HTMLElement &&
            !node.classList.contains(this.CLASS_NAME)
          ) {
            this.addRtlClass(node);
          }
        });
      });
    });

    observer.observe(target, { childList: true, subtree: true });
  }

  log(...toPrint: any[]) {
    console.log("RTLIT: ", ...toPrint);
  }
}

chrome.storage.sync.get("automaticRtl", (items) => {
  const rtlit = new Rtlit(items.automaticRtl);

  rtlit.init();
});
