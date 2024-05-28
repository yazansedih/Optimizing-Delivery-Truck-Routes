document.addEventListener("DOMContentLoaded", () => {
  const labels = document.querySelectorAll(".delivary-point label");

  labels.forEach((label) => {
    label.innerHTML = label.innerText
      .split("")
      .map(
        (letter, idx) =>
          `<span style="transition-delay: ${idx * 40}ms">${letter}</span>`
      )
      .join("");
  });
});
