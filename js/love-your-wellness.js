"use strict";
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !reducedMotion.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target); } });
  }, {threshold: 0.08});
  document.documentElement.classList.add('js-reveals');
  document.querySelectorAll('.reveal').forEach(element => observer.observe(element));
}
const gallery = [...document.querySelectorAll('[data-full]')];
const dialog = document.querySelector('#lightbox');
const image = document.querySelector('#lightbox-image');
const caption = document.querySelector('#lightbox-caption');
const count = document.querySelector('#image-count');
let selected = 0;
let opener;
function displayImage(index) {
  selected = (index + gallery.length) % gallery.length;
  const item = gallery[selected];
  image.src = item.dataset.full;
  image.alt = item.dataset.caption;
  caption.textContent = item.dataset.caption;
  count.textContent = `${selected + 1} / ${gallery.length}`;
}
gallery.forEach((item, index) => item.addEventListener('click', () => {
  opener = item;
  displayImage(index);
  dialog.showModal();
  document.body.classList.add('lightbox-open');
}));
document.querySelector('#close-lightbox').addEventListener('click', () => dialog.close());
document.querySelector('#previous-image').addEventListener('click', () => displayImage(selected - 1));
document.querySelector('#next-image').addEventListener('click', () => displayImage(selected + 1));
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } });
dialog.addEventListener('keydown', event => { if (event.key === 'ArrowRight') {event.preventDefault();displayImage(selected + 1);} if (event.key === 'ArrowLeft') {event.preventDefault();displayImage(selected - 1);} });
dialog.addEventListener('close', () => {document.body.classList.remove('lightbox-open');opener?.focus({preventScroll:true});});

reducedMotion.addEventListener('change', event => {
 if (event.matches) document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
});
