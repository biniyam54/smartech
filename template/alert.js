// alerts
const alerts = document.querySelectorAll(".alert");
const alertXs = document.querySelectorAll(".alert button");

alertXs.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    alerts[idx].style.display = "none";
  });
});
