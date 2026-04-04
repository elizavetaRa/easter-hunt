function goBack(fromStage) {
  const current = document.getElementById('stage' + fromStage);
  const prev = document.getElementById('stage' + (fromStage - 1));
  current.classList.remove('active', 'stage-enter');
  prev.classList.add('active', 'stage-enter');
  // reset egg if going back to stage 1
  if (fromStage === 2) {
    clickCount = 0;
    egg.textContent = '🥚';
    egg.classList.remove('crack-1', 'crack-2', 'crack-3', 'crack-4');
    egg.style.cssText = '';
    document.querySelectorAll('.egg-decoy, .flower-decor').forEach(el => el.classList.remove('hide'));
  }
  // reset tap-to-hatch and restart countdown when landing back on stage 3
  if (fromStage === 3) {
    resetHatchState();
  }
  if (fromStage === 4) {
    resetHatchState();
    startCountdown();
  }
}
// ── Read name from URL ──
const urlParams = new URLSearchParams(window.location.search);
const nameParam = urlParams.get('name');
if (nameParam && /^[A-Za-zÀ-ÿ]+$/.test(nameParam)) {
  const name = nameParam.charAt(0).toUpperCase() + nameParam.slice(1).toLowerCase();
  const titleText = document.querySelector('.title-text');
  if (titleText) {
    titleText.innerHTML = `${name}'s Easter<br>Egg Hunt`;
  }
  document.title = `${name}'s Easter Egg Hunt`;
}
// ── Stage 1: Egg click (4 clicks to hatch) ──
const egg = document.getElementById('eggBtn');
let clickCount = 0;
egg.addEventListener('click', () => {
  clickCount++;
  // sparkle on every click
  const ring = document.createElement('span');
  ring.className = 'sparkle-ring';
  egg.style.position = 'relative';
  egg.appendChild(ring);
  setTimeout(() => ring.remove(), 900);
  if (clickCount === 1) {
    document.querySelectorAll('.egg-decoy, .flower-decor').forEach(el => el.classList.add('hide'));
    egg.classList.add('crack-1');
  } else if (clickCount === 2) {
    egg.classList.remove('crack-1');
    egg.classList.add('crack-2');
  } else if (clickCount === 3) {
    egg.classList.remove('crack-2');
    egg.classList.add('crack-4');
  } else if (clickCount === 4) {
    // crack open fast — sharp swap to chick
    egg.style.transition = 'opacity 0.15s ease';
    egg.style.opacity = '0';
    setTimeout(() => {
      egg.textContent = '🐣';
      egg.style.opacity = '1';
      egg.style.filter = 'drop-shadow(0 0 80px rgba(240,192,64,1))';
    }, 150);
    // transition to stage 2
    setTimeout(() => {
      document.getElementById('stage1').classList.remove('active');
      const s2 = document.getElementById('stage2');
      s2.classList.add('active', 'stage-enter');
    }, 1400);
  }
});
// ── Stage 2: Password ──
const pwInput = document.getElementById('passwordInput');
const submitBtn = document.getElementById('submitBtn');
const errorMsg = document.getElementById('errorMsg');
function checkPassword() {
  const val = pwInput.value.trim().toUpperCase();
  if (val === 'OSTERN') {
    document.getElementById('stage2').classList.remove('active');
    const s3 = document.getElementById('stage3');
    s3.classList.add('active', 'stage-enter');
    startCountdown();
  } else {
    pwInput.classList.add('shake');
    errorMsg.classList.add('show');
    setTimeout(() => pwInput.classList.remove('shake'), 500);
    setTimeout(() => errorMsg.classList.remove('show'), 2500);
  }
}
submitBtn.addEventListener('click', checkPassword);
pwInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') checkPassword();
});
// ── Stage 3: Tap to hatch with countdown + timer ──
const hatchEgg = document.getElementById('hatchEgg');
const tapCounter = document.getElementById('tapCounter');
const tapProgressFill = document.getElementById('tapProgressFill');
const tapHint = document.getElementById('tapHint');
const countdownOverlay = document.getElementById('countdownOverlay');
const timerDisplay = document.getElementById('timerDisplay');
const tapGoal = 12;
const timeLimit = 3000;
let tapCount = 0;
let hatched = false;
let tapping = false;
let timerInterval = null;
let startTime = 0;
function startCountdown() {
  resetHatchState();
  hatchEgg.style.pointerEvents = 'none';
  tapHint.textContent = 'Read the rules, then start!';
  countdownOverlay.innerHTML = '';
  // show Start button first
  const existing = document.querySelector('.start-btn');
  if (existing) existing.remove();
  const startBtn = document.createElement('button');
  startBtn.className = 'start-btn try-again-btn';
  startBtn.textContent = 'Start ✦';
  startBtn.addEventListener('click', () => {
    startBtn.remove();
    runCountdown();
  });
  hatchEgg.parentElement.appendChild(startBtn);
}
function runCountdown() {
  let count = 3;
  function showCount() {
    if (count > 0) {
      countdownOverlay.innerHTML = `<span class="countdown-number">${count}</span>`;
      count--;
      setTimeout(showCount, 1000);
    } else {
      countdownOverlay.innerHTML = `<span class="countdown-number" style="color:var(--mint);">GO!</span>`;
      setTimeout(() => {
        countdownOverlay.innerHTML = '';
        hatchEgg.style.pointerEvents = 'auto';
        tapHint.textContent = 'Tap the egg!';
        tapping = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 50);
      }, 600);
    }
  }
  showCount();
}
function updateTimer() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, timeLimit - elapsed);
  timerDisplay.textContent = `${(remaining / 1000).toFixed(1)}s`;
  if (remaining <= 1000) timerDisplay.classList.add('urgent');
  if (remaining <= 0 && !hatched) {
    clearInterval(timerInterval);
    tapping = false;
    hatchEgg.style.pointerEvents = 'none';
    tapHint.textContent = 'Time\u2019s up! 😢';
    timerDisplay.textContent = '0.0s';
    const existing = document.querySelector('.try-again-btn');
    if (!existing) {
      const btn = document.createElement('button');
      btn.className = 'try-again-btn';
      btn.textContent = 'Try Again ✦';
      btn.addEventListener('click', () => {
        btn.remove();
        startCountdown();
      });
      hatchEgg.parentElement.appendChild(btn);
    }
  }
}
function resetHatchState() {
  tapCount = 0;
  hatched = false;
  tapping = false;
  clearInterval(timerInterval);
  hatchEgg.textContent = '🥚';
  hatchEgg.classList.remove('hatched', 'tap-pop');
  hatchEgg.style.transform = '';
  hatchEgg.style.animation = '';
  hatchEgg.style.pointerEvents = 'none';
  tapCounter.textContent = `0 / ${tapGoal}`;
  tapCounter.style.color = '';
  tapProgressFill.style.width = '0%';
  timerDisplay.textContent = '3.0s';
  timerDisplay.classList.remove('urgent');
  timerDisplay.style.color = '';
  countdownOverlay.innerHTML = '';
  const tryBtn = document.querySelector('.try-again-btn');
  if (tryBtn) tryBtn.remove();
  const sBtn = document.querySelector('.start-btn');
  if (sBtn) sBtn.remove();
}
hatchEgg.addEventListener('click', () => {
  if (hatched || !tapping) return;
  tapCount++;
  hatchEgg.classList.remove('tap-pop');
  void hatchEgg.offsetWidth;
  hatchEgg.classList.add('tap-pop');
  const wobble = Math.min(tapCount * 2, 20);
  hatchEgg.style.animation = 'none';
  hatchEgg.style.transform = `rotate(${(tapCount % 2 === 0 ? wobble : -wobble)}deg) scale(${1 + tapCount * 0.03})`;
  tapCounter.textContent = `${tapCount} / ${tapGoal}`;
  tapProgressFill.style.width = `${(tapCount / tapGoal) * 100}%`;
  if (tapCount === 4) tapHint.textContent = 'Keep going! 💪';
  if (tapCount === 8) tapHint.textContent = 'Almost there! 🔥';
  if (tapCount === 11) tapHint.textContent = 'One more! 🎉';
  if (tapCount >= tapGoal) {
    hatched = true;
    tapping = false;
    clearInterval(timerInterval);
    hatchEgg.style.transform = '';
    hatchEgg.style.animation = '';
    hatchEgg.textContent = '🐣';
    hatchEgg.classList.remove('tap-pop');
    hatchEgg.classList.add('hatched');
    tapHint.textContent = '';
    tapCounter.style.color = 'var(--mint)';
    timerDisplay.style.color = 'var(--mint)';
    setTimeout(() => {
      document.getElementById('stage3').classList.remove('active');
      const s4 = document.getElementById('stage4');
      s4.classList.add('active', 'stage-enter');
      launchConfetti();
    }, 1500);
  }
});
// ── Confetti ──
function launchConfetti() {
  const container = document.createElement('div');
  container.className = 'confetti-burst';
  document.body.appendChild(container);
  const colors = ['#f0c040','#ffe066','#a8204a','#e8578a','#5ab860','#56c8e8','#b07aeb','#ff9a6c','#6ee7b7','#fef9ec'];
  for (let i = 0; i < 120; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = (2 + Math.random() * 3) + 's';
    piece.style.animationDelay = (Math.random() * 1.5) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
  setTimeout(() => container.remove(), 6000);
}
