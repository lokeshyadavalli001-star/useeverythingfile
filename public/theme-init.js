(function () {
  try {
    var stored = localStorage.getItem("theme");
    var supportDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    if (
      stored === "dark" ||
      (!stored && supportDark) ||
      (stored === "system" && supportDark)
    ) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  } catch (e) {}
})();
