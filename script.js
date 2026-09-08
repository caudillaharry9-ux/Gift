const enterBtn = document.getElementById('enterBtn');
const pageWelcome = document.getElementById('page-welcome');
const pagePlant = document.getElementById('page-plant');

const petalHint = document.getElementById('petalHint');
const petalsGroup = document.getElementById('petals');
const flowerCenter = document.getElementById('flowerCenter');
const stamensGroup = document.getElementById('stamens');
const tulipWrap = document.getElementById('tulipWrap');
const daisyWrap = document.getElementById('daisyWrap');
const budWrap = document.getElementById('budWrap');
const redFlowerWrap = document.getElementById('redFlowerWrap');
const blueFlowerWrap = document.getElementById('blueFlowerWrap');
const whiteFlowerWrap = document.getElementById('whiteFlowerWrap');

const confettiCanvas = document.getElementById('confettiCanvas');
const fallingPetalsCanvas = document.getElementById('fallingPetalsCanvas');

const birthdayMsg = document.getElementById('birthdayMsg');

const petalOverlay = document.getElementById('petalOverlay');
const petalImage = document.getElementById('petalImage');
const petalMessage = document.getElementById('petalMessage');
const closePetal = document.getElementById('closePetal');

const heartOverlay = document.getElementById('heartOverlay');
const heartStage = document.getElementById('heartStage');
const bigHeart = document.getElementById('bigHeart');
const loveMessage = document.getElementById('loveMessage');

const proposalOverlay = document.getElementById('proposalOverlay');
const proposalCard = document.getElementById('proposalCard');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
const celebration = document.getElementById('celebration');

// Music now starts as soon as the page opens (see music-sync.js),
// instead of waiting for the Enter button.
const bgMusic = initBgMusic('bgMusic', 'musicToggle');

const birthdayHint = document.getElementById('birthdayHint');

const ALREADY_YES_KEY = 'birthdaySaidYes';

// Safe localStorage helpers - some browsers block storage entirely on
// file:// pages or in private mode, and a thrown error here must never
// stop the rest of the page from working.
function safeGet(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

let grown = false;

const petalData = {
  en: { image: 'images/petal-en.jpg', text: 'I Love You (English)' },
  tl: { image: 'images/petal-tl.png', text: 'Mahal Kita (Tagalog)' },
  es: { image: 'images/petal-es.png', text: 'Te Amo (Spanish)' },
  ja: { image: 'images/petal-ja.jpg', text: 'Aishiteru (Japanese)' },
  fr: { image: 'images/petal-fr.jpg', text: "Je t'aime (French)" },
  ko: { image: 'images/petal-ko.jpg', text: 'Saranghae (Korean)' }
};

enterBtn.addEventListener('click', () => {
  pageWelcome.classList.add('hidden');
  pagePlant.classList.add('active');
  if (!grown) {
    grown = true;
    growPlant();
  }
  startFallingPetals();
});

// Keyboard accessibility: Enter activates the enter button, Escape closes
// whichever overlay is currently open.
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !pageWelcome.classList.contains('hidden')) {
    enterBtn.click();
  }
  if (e.key === 'Escape') {
    petalOverlay.classList.remove('show');
    heartOverlay.classList.remove('show');
    if (proposalOverlay.classList.contains('show') && celebration.classList.contains('show')) {
      proposalOverlay.classList.remove('show');
    }
  }
});

function growPlant() {
  const stem = document.getElementById('stem');
  const leaves = ['leaf1', 'leaf2', 'leaf3', 'leaf4'].map(id => document.getElementById(id));

  const stemStages = [
    'M150,380 C150,380 150,380 150,380',
    'M150,380 C150,360 150,340 150,330',
    'M150,380 C150,340 150,300 150,280',
    'M150,380 C150,330 150,260 150,230',
    'M150,380 C150,320 150,220 150,180',
    'M150,380 C150,310 150,190 150,92'
  ];

  let step = 0;
  const totalSteps = stemStages.length;
  const stepDuration = 850;

  const interval = setInterval(() => {
    step++;
    if (step < totalSteps) {
      stem.setAttribute('d', stemStages[step]);
    }

    if (step === 2) fadeIn(leaves[0]);
    if (step === 3) fadeIn(leaves[1]);
    if (step === 4) fadeIn(leaves[2]);
    if (step === 5) {
      fadeIn(leaves[3]);
      setTimeout(() => {
        fadeIn(flowerCenter);
        setTimeout(() => {
          fadeIn(petalsGroup);
          fadeIn(stamensGroup);
          revealPetalHint();
          revealTulip();
        }, 500);
      }, 500);
      clearInterval(interval);
    }
  }, stepDuration);
}

function fadeIn(el) {
  el.style.transition = 'opacity 1s ease';
  el.setAttribute('opacity', '1');
}

function revealPetalHint() {
  petalHint.classList.add('show');
}

function revealTulip() {
  tulipWrap.classList.add('show');
  daisyWrap.classList.add('show');
  budWrap.classList.add('show');
  setTimeout(() => redFlowerWrap.classList.add('show'), 150);
  setTimeout(() => blueFlowerWrap.classList.add('show'), 300);
  setTimeout(() => whiteFlowerWrap.classList.add('show'), 450);
  revealFlowerField();
  if (birthdayHint) birthdayHint.classList.add('show');
}

/* ===================== SCATTERED FLOWER FIELD ===================== */
const FIELD_FLOWER_COLORS = [
  { petal: '#d9436b', center: '#fbe98f' },
  { petal: '#e2654a', center: '#fdf0e0' },
  { petal: '#5b8ac4', center: '#fdf6e3' },
  { petal: '#9b6bb5', center: '#fbe98f' },
  { petal: '#fffdf6', center: '#e8b93f' },
  { petal: '#f5a06a', center: '#fffdf6' }
];

function generateFlowerField() {
  const stage = document.querySelector('.plant-stage');

  // Back layer: lots of small flowers, evenly spread so there are no big gaps.
  const backBins = 55;
  for (let i = 0; i < backBins; i++) {
    const binWidth = 100 / backBins;
    const leftPercent = i * binWidth + Math.random() * binWidth;
    const bottomPercent = 1 + Math.random() * 8;
    const size = 10 + Math.random() * 8;
    addFieldFlower(stage, leftPercent, bottomPercent, size, Math.random() * 1.6);
  }

  // Front layer: fewer, bigger flowers for depth, also spread evenly.
  const frontBins = 34;
  for (let i = 0; i < frontBins; i++) {
    const binWidth = 100 / frontBins;
    const leftPercent = i * binWidth + Math.random() * binWidth;
    const bottomPercent = 6 + Math.random() * 12;
    const size = 18 + Math.random() * 16;
    addFieldFlower(stage, leftPercent, bottomPercent, size, Math.random() * 1.6);
  }
}

function addFieldFlower(stage, leftPercent, bottomPercent, size, delay) {
  const color = FIELD_FLOWER_COLORS[Math.floor(Math.random() * FIELD_FLOWER_COLORS.length)];
  const flower = document.createElement('div');
  flower.className = 'field-flower';
  flower.style.left = leftPercent + '%';
  flower.style.bottom = bottomPercent + '%';
  flower.style.width = size + 'px';
  flower.style.height = size + 'px';
  flower.style.transitionDelay = delay + 's';
  flower.innerHTML =
    '<svg viewBox="0 0 40 40" width="100%" height="100%">' +
      '<g transform="translate(20,20)">' +
        '<ellipse rx="7" ry="13" fill="' + color.petal + '"/>' +
        '<ellipse rx="7" ry="13" fill="' + color.petal + '" transform="rotate(72)"/>' +
        '<ellipse rx="7" ry="13" fill="' + color.petal + '" transform="rotate(144)"/>' +
        '<ellipse rx="7" ry="13" fill="' + color.petal + '" transform="rotate(216)"/>' +
        '<ellipse rx="7" ry="13" fill="' + color.petal + '" transform="rotate(288)"/>' +
        '<circle r="6" fill="' + color.center + '"/>' +
      '</g>' +
    '</svg>';
  stage.appendChild(flower);
}

function revealFlowerField() {
  document.querySelectorAll('.field-flower').forEach(f => f.classList.add('show'));
}

// Build the flower field right away so it's ready to reveal when the plant grows.
generateFlowerField();

document.querySelectorAll('.petal').forEach(petal => {
  petal.addEventListener('click', () => {
    const lang = petal.getAttribute('data-lang');
    const data = petalData[lang];
    if (!data) return;

    petalImage.src = data.image;
    petalMessage.textContent = data.text;
    petalOverlay.classList.add('show');

    petal.classList.add('done');

    checkAllPetalsDone();
  });
});

function checkAllPetalsDone() {
  const total = document.querySelectorAll('.petal').length;
  const done = document.querySelectorAll('.petal.done').length;
  if (done >= total) {
    petalHint.textContent = '🌸 All petals bloomed with love 🌸';
  }
}

closePetal.addEventListener('click', () => {
  petalOverlay.classList.remove('show');
});

petalOverlay.addEventListener('click', (e) => {
  if (e.target === petalOverlay) {
    petalOverlay.classList.remove('show');
  }
});

birthdayMsg.addEventListener('click', () => {
  if (birthdayHint) birthdayHint.classList.remove('show');
  bigHeart.classList.remove('opened');
  loveMessage.classList.remove('show');
  heartOverlay.classList.add('show');
});

heartStage.addEventListener('click', () => {
  if (!bigHeart.classList.contains('opened')) {
    bigHeart.classList.add('opened');
    setTimeout(() => {
      loveMessage.classList.add('show');
    }, 300);
  } else {
    heartOverlay.classList.remove('show');
  }
});

heartOverlay.addEventListener('click', (e) => {
  if (e.target === heartOverlay) {
    heartOverlay.classList.remove('show');
  }
});

tulipWrap.addEventListener('click', () => {
  if (safeGet(ALREADY_YES_KEY) === '1') {
    // She already said yes on a previous visit - skip the question and
    // go straight back to celebrating.
    proposalCard.classList.add('hide');
    celebration.classList.add('show');
    proposalOverlay.classList.add('show');
    return;
  }
  resetNoButton();
  proposalCard.classList.remove('hide');
  celebration.classList.remove('show');
  proposalOverlay.classList.add('show');
});

proposalOverlay.addEventListener('click', (e) => {
  if (e.target === proposalOverlay && celebration.classList.contains('show')) {
    proposalOverlay.classList.remove('show');
  }
});

function rectsOverlap(a, b, buffer = 12) {
  return !(
    a.right + buffer < b.left ||
    a.left - buffer > b.right ||
    a.bottom + buffer < b.top ||
    a.top - buffer > b.bottom
  );
}

function moveNoButton() {
  const container = document.querySelector('.proposal-buttons');
  const containerRect = container.getBoundingClientRect();
  const btnWidth = noBtn.offsetWidth;
  const btnHeight = noBtn.offsetHeight;

  const yesRectAbs = yesBtn.getBoundingClientRect();
  // Yes button's rect relative to the container, used for collision checks
  const yesRectRel = {
    left: yesRectAbs.left - containerRect.left,
    right: yesRectAbs.right - containerRect.left,
    top: yesRectAbs.top - containerRect.top,
    bottom: yesRectAbs.bottom - containerRect.top
  };

  const maxX = Math.max(containerRect.width - btnWidth, 0);
  const maxY = Math.max(containerRect.height - btnHeight, 0);

  let randX = 0;
  let randY = 0;
  let attempts = 0;
  const maxAttempts = 30;

  do {
    randX = Math.random() * maxX;
    randY = Math.random() * maxY;
    attempts++;
  } while (
    rectsOverlap(
      { left: randX, right: randX + btnWidth, top: randY, bottom: randY + btnHeight },
      yesRectRel
    ) && attempts < maxAttempts
  );

  noBtn.classList.add('roaming');
  noBtn.style.left = randX + 'px';
  noBtn.style.top = randY + 'px';
}

function resetNoButton() {
  noBtn.classList.remove('roaming');
  noBtn.style.left = '';
  noBtn.style.top = '';
}

noBtn.addEventListener('click', (e) => {
  e.preventDefault();
  moveNoButton();
});
noBtn.addEventListener('touchstart', (e) => {
  e.preventDefault();
  moveNoButton();
});

yesBtn.addEventListener('click', () => {
  safeSet(ALREADY_YES_KEY, '1');
  proposalCard.classList.add('hide');
  setTimeout(() => {
    celebration.classList.add('show');
  }, 200);
  launchConfetti();
  if (navigator.vibrate) navigator.vibrate([40, 30, 40]);
});

function launchConfetti() {
  const ctx = confettiCanvas.getContext('2d');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  confettiCanvas.classList.add('show');

  const colors = ['#d4b483', '#2f5c3f', '#e2654a', '#f5a06a', '#fdf6e3', '#d9436b', '#9b6bb5'];
  const pieces = [];
  const pieceCount = 160;

  for (let i = 0; i < pieceCount; i++) {
    pieces.push({
      x: Math.random() * confettiCanvas.width,
      y: -20 - Math.random() * confettiCanvas.height * 0.6,
      w: 6 + Math.random() * 6,
      h: 10 + Math.random() * 6,
      color: colors[Math.floor(Math.random() * colors.length)],
      speedY: 2 + Math.random() * 3,
      speedX: -1.5 + Math.random() * 3,
      rotation: Math.random() * 360,
      rotationSpeed: -6 + Math.random() * 12
    });
  }

  let frame = 0;
  const maxFrames = 260;

  function draw() {
    frame++;
    ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    pieces.forEach(p => {
      p.x += p.speedX;
      p.y += p.speedY;
      p.rotation += p.rotationSpeed;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    });

    if (frame < maxFrames) {
      requestAnimationFrame(draw);
    } else {
      confettiCanvas.classList.remove('show');
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  draw();
}

/* ===================== AMBIENT FALLING PETALS (whole page) ===================== */
let fallingPetalsStarted = false;

function startFallingPetals() {
  if (fallingPetalsStarted) return;
  fallingPetalsStarted = true;

  const ctx = fallingPetalsCanvas.getContext('2d');
  fallingPetalsCanvas.classList.add('show');

  function resizeCanvas() {
    fallingPetalsCanvas.width = window.innerWidth;
    fallingPetalsCanvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  const petalColors = ['#ef7d95', '#f5a06a', '#d9436b', '#e2654a', '#fbe4e6', '#d9578a'];
  const petalCount = 26;
  const petals = [];

  function makePetal(startAbove) {
    return {
      x: Math.random() * fallingPetalsCanvas.width,
      y: startAbove ? -20 - Math.random() * fallingPetalsCanvas.height : Math.random() * fallingPetalsCanvas.height,
      size: 7 + Math.random() * 8,
      speedY: 0.5 + Math.random() * 1,
      swayAngle: Math.random() * Math.PI * 2,
      swaySpeed: 0.4 + Math.random() * 0.6,
      rotation: Math.random() * 360,
      rotationSpeed: -1 + Math.random() * 2,
      color: petalColors[Math.floor(Math.random() * petalColors.length)]
    };
  }

  for (let i = 0; i < petalCount; i++) {
    petals.push(makePetal(true));
  }

  function draw() {
    ctx.clearRect(0, 0, fallingPetalsCanvas.width, fallingPetalsCanvas.height);
    petals.forEach(p => {
      p.y += p.speedY;
      p.swayAngle += 0.02 * p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * 0.6;
      p.rotation += p.rotationSpeed;

      if (p.y > fallingPetalsCanvas.height + 20) {
        p.y = -20;
        p.x = Math.random() * fallingPetalsCanvas.width;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    requestAnimationFrame(draw);
  }

  draw();
}