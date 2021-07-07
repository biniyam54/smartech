let defferedPrompt;

// register sw
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./sw.js")
      .then(() => console.log(`Service worker registered!`));
  });
}

window.addEventListener("beforeinstallprompt", (e) => {
  console.log("before install fired");
  e.preventDefault();
  defferedPrompt = e;
  return false;
});

// menu bar
const menuBtn = document.querySelector(".menu-btn-wrapper");
const header = document.querySelector("header");

menuBtn.addEventListener("click", () => {
  header.classList.toggle("active");
});

// faqs
const faqs = document.querySelectorAll(".faq");
const faqBtn = document.querySelectorAll(".faq-btn");

faqBtn.forEach((btn, idx) => {
  btn.addEventListener("click", () => {
    faqs[idx].classList.toggle("active");
  });
});

// user info
const dropdown = document.querySelector(".dropdown");
const dropdownBtn = document.querySelector(".dropdown .user-img");
// const dropdownContent = document.querySelector(".dropdown-content");

dropdownBtn.addEventListener("click", (e) => {
  if (defferedPrompt) {
    defferedPrompt.prompt();

    defferedPrompt.userChoice.then((cres) => {
      if (cres.outcome === "dismissed") {
        console.log(`User canceled installation`);
      } else {
        console.log(`User added to homescreen`);
      }
      defferedPrompt = null;
    });
  }
  dropdown.classList.toggle("active");
});

// search tbn
const searchBtn = document.querySelector(".search-btn");
const sOpen = document.querySelector("#s_open");
const sClose = document.querySelector("#s_close");

sOpen.addEventListener("click", () => {
  searchBtn.classList.add("active");
});
sClose.addEventListener("click", () => {
  searchBtn.classList.remove("active");
});
