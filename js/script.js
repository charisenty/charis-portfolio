"use strict";

// Mark the current page in the shared navigation.
const currentPage = window.location.pathname.split("/").pop() || "index.html";
document.querySelectorAll('nav[aria-label="Main navigation"] a').forEach((link) => {
  if (link.getAttribute("href") === currentPage) {
    link.setAttribute("aria-current", "page");
  }
});

// Add folder interactions and other portfolio behaviors here later.

// Visitors can pause the decorative star animation.
const motionToggle = document.querySelector('.motion-toggle');
motionToggle?.addEventListener('click', () => {
  const paused = document.querySelector('.home-scene').classList.toggle('stars-paused');
  motionToggle.setAttribute('aria-pressed', String(paused));
  motionToggle.textContent = paused ? 'Animate stars' : 'Pause stars';
});
