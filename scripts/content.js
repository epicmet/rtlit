class Rtlit {
  CLASS_NAME = "RTLIT_RTL";
  STYLE_ID = "RTLIT_STYLE";

  // link: https://stackoverflow.com/questions/4446244/how-to-check-if-any-arabic-character-exists-in-the-string-javascript
  arabicLetterRegex = /[\u0600-\u06FF]/;
  targetElements = [];
  changedElements = [];
  styleEl = null;

  constructor() {
    const parapraphs = document.querySelectorAll("p");
    const spans = document.querySelectorAll("span");

    this.targetElements = [...this.targetElements, ...parapraphs, ...spans];
  }

  init() {
    this.createStyleTag();
    this.addStyleTag();

    this.targetElements.forEach((target) => this.addRtlClass(target));

    this.observeAddedNodes();
    this.addStorageEventListener();
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
      if (changes.automaticRtl.newValue) {
        this.addStyleTag();
      } else {
        this.removeStyleTag();
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

  log = (...toPrint) => {
    console.log("RTLIT: ", ...toPrint);
  };
}

const rtlit = new Rtlit();

rtlit.init();
