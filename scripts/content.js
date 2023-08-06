const parapraphs = document.querySelectorAll("p");
const divs = document.querySelectorAll("div");

function rtlit(targets) {
  // link: https://stackoverflow.com/questions/4446244/how-to-check-if-any-arabic-character-exists-in-the-string-javascript
  const arabicLetterRegex = /[\u0600-\u06FF]/;

  targets.forEach((target) => {
    if (target.textContent.slice(0, 1).match(arabicLetterRegex)) {
      target.style.direction = "rtl";
    }
  });
}

rtlit(parapraphs);
rtlit(divs);
