const music = document.getElementById("bg-music");
const button = document.getElementById("music-btn");

let isPlaying = false;

// Algunos navegadores bloquean autoplay,
// así que iniciamos cuando el usuario interactúe
button.addEventListener("click", () => {
  if (isPlaying) {
    music.pause();
    button.textContent = "▶";
  } else {
    music.play();
    button.textContent = "⏸";
  }
  isPlaying = !isPlaying;
});