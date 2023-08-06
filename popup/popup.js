const automaticRtlCheckbox = document.querySelector("#automatic-rtl");

automaticRtlCheckbox.addEventListener("change", () => {
  console.log("Automatic RTL", automaticRtlCheckbox.checked);
});
