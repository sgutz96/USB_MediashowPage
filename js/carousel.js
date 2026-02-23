/* ══════════════════════════════════
   CAROUSEL.JS — Scroll y drag
   ══════════════════════════════════ */

function scrollCar(id, dir) {
  const el = document.getElementById(id);
  el.scrollBy({ left: dir * 320, behavior: 'smooth' });
}

// DRAG TO SCROLL CAROUSELS
document.querySelectorAll('.carousel').forEach(car => {
  let isDown = false, startX, scrollLeft;
  car.addEventListener('mousedown', e => {
    isDown = true; car.classList.add('grabbing');
    startX = e.pageX - car.offsetLeft;
    scrollLeft = car.scrollLeft;
  });
  car.addEventListener('mouseleave', () => { isDown = false; car.classList.remove('grabbing'); });
  car.addEventListener('mouseup', () => { isDown = false; car.classList.remove('grabbing'); });
  car.addEventListener('mousemove', e => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - car.offsetLeft;
    car.scrollLeft = scrollLeft - (x - startX) * 1.2;
  });
});
