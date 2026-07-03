const birthdayDate = new Date("2026-07-09T19:00:00+05:30").getTime();


const body = document.body;
const countdownGroups = document.querySelectorAll("[data-countdown]");
const confettiCanvas = document.getElementById("confettiCanvas");
const fireworksCanvas = document.getElementById("fireworksCanvas");
const confettiCtx = confettiCanvas.getContext("2d");
const fireworksCtx = fireworksCanvas.getContext("2d");

let audioContext;
let musicTimer;
let fireworksStarted = false;

window.addEventListener("load", () => {
  setTimeout(() => body.classList.add("loaded"), 450);
  resizeCanvases();
  launchConfetti(160);
});

window.addEventListener("resize", resizeCanvases);

function resizeCanvases() {
  [confettiCanvas, fireworksCanvas].forEach((canvas) => {
    canvas.width = window.innerWidth * window.devicePixelRatio;
    canvas.height = window.innerHeight * window.devicePixelRatio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
  });
  confettiCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
  fireworksCtx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
}

// Missing uploaded photos fall back to a local decorative image.
document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => {
    if (!image.dataset.didFallback) {
      image.dataset.didFallback = "true";
      image.src = image.dataset.fallback || fallbackImage;
    }
  });
});

// Decorative particles are generated in JS so the markup stays readable.
function seedAmbient(containerSelector, count, builder) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const fragment = document.createDocumentFragment();
  for (let index = 0; index < count; index += 1) {
    const node = document.createElement("span");
    builder(node, index);
    fragment.appendChild(node);
  }
  container.appendChild(fragment);
}

seedAmbient(".sparkles", 70, (node) => {
  node.style.left = `${Math.random() * 100}%`;
  node.style.top = `${Math.random() * 100}%`;
  node.style.animationDelay = `${Math.random() * 3}s`;
});

seedAmbient(".fairy-particles", 36, (node) => {
  node.style.left = `${Math.random() * 100}%`;
  node.style.top = `${Math.random() * 100}%`;
  node.style.animationDelay = `${Math.random() * 4}s`;
});

seedAmbient(".hearts", 24, (node) => {
  node.textContent = "♥";
  node.style.left = `${Math.random() * 100}%`;
  node.style.bottom = `${-15 - Math.random() * 70}px`;
  node.style.animationDelay = `${Math.random() * 8}s`;
  node.style.animationDuration = `${7 + Math.random() * 6}s`;
});

seedAmbient(".flowers", 22, (node) => {
  node.textContent = Math.random() > 0.5 ? "✿" : "✽";
  node.style.left = `${Math.random() * 100}%`;
  node.style.bottom = `${-20 - Math.random() * 90}px`;
  node.style.animationDelay = `${Math.random() * 12}s`;
  node.style.animationDuration = `${10 + Math.random() * 7}s`;
});

seedAmbient(".bubbles", 32, (node) => {
  const size = 10 + Math.random() * 24;
  node.style.width = `${size}px`;
  node.style.height = `${size}px`;
  node.style.left = `${Math.random() * 100}%`;
  node.style.bottom = `${-30 - Math.random() * 120}px`;
  node.style.animationDelay = `${Math.random() * 10}s`;
  node.style.animationDuration = `${8 + Math.random() * 7}s`;
});

function updateCountdown() {
  const distance = Math.max(0, birthdayDate - Date.now());
  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((distance / (1000 * 60)) % 60);
  const seconds = Math.floor((distance / 1000) % 60);

  countdownGroups.forEach((group) => {
    group.querySelector("[data-days]").textContent = String(days).padStart(2, "0");
    group.querySelector("[data-hours]").textContent = String(hours).padStart(2, "0");
    group.querySelector("[data-minutes]").textContent = String(minutes).padStart(2, "0");
    group.querySelector("[data-seconds]").textContent = String(seconds).padStart(2, "0");
  });

  if (distance === 0 && !fireworksStarted) {
    fireworksStarted = true;
    launchFireworks();
  }
}

updateCountdown();
setInterval(updateCountdown, 1000);

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.18 }
);

document.querySelectorAll(".section-reveal").forEach((section) => revealObserver.observe(section));

const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox.querySelector("img");
document.querySelectorAll(".photo-card").forEach((card) => {
  card.addEventListener("click", () => {
    const image = card.querySelector("img");
    lightboxImage.src = image.currentSrc || image.src;
    lightbox.classList.add("is-open");
    lightbox.setAttribute("aria-hidden", "false");
  });
});

function closeLightbox() {
  lightbox.classList.remove("is-open");
  lightbox.setAttribute("aria-hidden", "true");
}

document.querySelector(".lightbox-close").addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

document.querySelectorAll(".balloon").forEach((balloon) => {
  const pop = () => {
    balloon.classList.add("popped");
    setTimeout(() => balloon.classList.remove("popped"), 1300);
  };
  balloon.addEventListener("click", pop);
  balloon.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") pop();
  });
});

document.querySelector(".rsvp-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const note = form.querySelector(".form-note");
  const name = new FormData(form).get("name");
  note.textContent = `Thank you, ${name}! Your RSVP is saved on this device.`;
  try {
    localStorage.setItem("pihuBirthdayRsvp", JSON.stringify(Object.fromEntries(new FormData(form))));
  } catch {
    note.textContent = `Thank you, ${name}! Your RSVP is noted.`;
  }
  form.reset();
  launchConfetti(80);
});

const musicButton = document.querySelector(".music-toggle");
musicButton.addEventListener("click", async () => {
  const isPlaying = musicButton.getAttribute("aria-pressed") === "true";
  if (isPlaying) {
    stopMusic();
    musicButton.setAttribute("aria-pressed", "false");
  } else {
    await startMusic();
    musicButton.setAttribute("aria-pressed", "true");
  }
});

async function startMusic() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  audioContext ||= new AudioEngine();
  await audioContext.resume();
  const notes = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46];
  let index = 0;

  const playNote = () => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = "sine";
    oscillator.frequency.value = notes[index % notes.length];
    gain.gain.setValueAtTime(0.0001, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.055, audioContext.currentTime + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.8);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.85);
    index += 1;
  };

  playNote();
  musicTimer = setInterval(playNote, 920);
}

function stopMusic() {
  clearInterval(musicTimer);
  musicTimer = null;
}

const cursor = document.querySelector(".magic-cursor");
document.addEventListener("pointermove", (event) => {
  if (window.matchMedia("(hover: none)").matches) return;
  cursor.style.opacity = "1";
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

function launchConfetti(total) {
  const colors = ["#f06fae", "#c6a7ff", "#8ddcff", "#fff1a8", "#ffffff"];
  const pieces = Array.from({ length: total }, () => ({
    x: Math.random() * window.innerWidth,
    y: -20 - Math.random() * window.innerHeight * 0.6,
    size: 5 + Math.random() * 8,
    color: colors[Math.floor(Math.random() * colors.length)],
    speed: 1.6 + Math.random() * 3.2,
    drift: -1 + Math.random() * 2,
    rotate: Math.random() * 360
  }));

  let frame = 0;
  function draw() {
    confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    pieces.forEach((piece) => {
      piece.y += piece.speed;
      piece.x += piece.drift;
      piece.rotate += 5;
      confettiCtx.save();
      confettiCtx.translate(piece.x, piece.y);
      confettiCtx.rotate((piece.rotate * Math.PI) / 180);
      confettiCtx.fillStyle = piece.color;
      confettiCtx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.62);
      confettiCtx.restore();
    });
    frame += 1;
    if (frame < 190) requestAnimationFrame(draw);
    else confettiCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }
  draw();
}

function launchFireworks() {
  const particles = [];
  const colors = ["#ffffff", "#ffd166", "#f06fae", "#9de5ff", "#c6a7ff"];

  for (let burst = 0; burst < 7; burst += 1) {
    const originX = Math.random() * window.innerWidth;
    const originY = window.innerHeight * (0.22 + Math.random() * 0.32);
    for (let i = 0; i < 55; i += 1) {
      const angle = (Math.PI * 2 * i) / 55;
      const speed = 1.3 + Math.random() * 4;
      particles.push({
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 80 + Math.random() * 30,
        color: colors[Math.floor(Math.random() * colors.length)]
      });
    }
  }

  function draw() {
    fireworksCtx.fillStyle = "rgba(47, 26, 50, 0.13)";
    fireworksCtx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += 0.035;
      particle.life -= 1;
      fireworksCtx.globalAlpha = Math.max(0, particle.life / 100);
      fireworksCtx.fillStyle = particle.color;
      fireworksCtx.beginPath();
      fireworksCtx.arc(particle.x, particle.y, 2.2, 0, Math.PI * 2);
      fireworksCtx.fill();
    });
    fireworksCtx.globalAlpha = 1;

    if (particles.some((particle) => particle.life > 0)) requestAnimationFrame(draw);
    else fireworksCtx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }

  draw();
}
