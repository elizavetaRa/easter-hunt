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
  // reset tap-to-hatch if going back to stage 2
  if (fromStage === 3) {
    resetHatchState();
  }
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
    // hide surrounding emojis
    document.querySelectorAll('.egg-decoy, .flower-decor').forEach(el => el.classList.add('hide'));
    egg.classList.add('crack-1');

  } else if (clickCount === 2) {
    egg.classList.remove('crack-1');
    egg.classList.add('crack-2');

  } else if (clickCount === 3) {
    egg.classList.remove('crack-2');
    egg.classList.add('crack-4');

  } else if (clickCount === 4) {
    // just morph emoji → chick, no extra grow
    egg.style.transition = 'opacity 0.4s ease';
    egg.style.opacity = '0';
    setTimeout(() => {
      egg.textContent = '🐣';
      egg.style.opacity = '1';
      egg.style.filter = 'drop-shadow(0 0 80px rgba(240,192,64,1))';
    }, 400);

    // transition to stage 2
    setTimeout(() => {
      document.getElementById('stage1').classList.remove('active');
      const s2 = document.getElementById('stage2');
      s2.classList.add('active', 'stage-enter');
    }, 1800);
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
    setTimeout(() => {
      pwInput.classList.remove('shake');
    }, 500);
    setTimeout(() => {
      errorMsg.classList.remove('show');
    }, 2500);
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
let tapCount = 0;
const tapGoal = 10;
const timeLimit = 3000; // 3 seconds
let hatched = false;
let tapping = false;
let timerInterval = null;
let startTime = 0;

function startCountdown() {
  resetHatchState();
  hatchEgg.style.pointerEvents = 'none';
  tapHint.textContent = 'Get ready\u2026';
  let count = 3;
  countdownOverlay.innerHTML = '';

  function showCount() {
    if (count > 0) {
      countdownOverlay.innerHTML = `<span class="countdown-number">${count}</span>`;
      count--;
      setTimeout(showCount, 800);
    } else {
      countdownOverlay.innerHTML = `<span class="countdown-number" style="color:var(--mint);">GO!</span>`;
      setTimeout(() => {
        countdownOverlay.innerHTML = '';
        hatchEgg.style.pointerEvents = 'auto';
        tapHint.textContent = 'Tap the egg! Fast!';
        tapping = true;
        startTime = Date.now();
        timerInterval = setInterval(updateTimer, 50);
      }, 500);
    }
  }
  showCount();
}

function updateTimer() {
  const elapsed = Date.now() - startTime;
  const remaining = Math.max(0, timeLimit - elapsed);
  const secs = (remaining / 1000).toFixed(1);
  timerDisplay.textContent = `${secs}s`;

  if (remaining <= 1000) {
    timerDisplay.classList.add('urgent');
  }

  if (remaining <= 0 && !hatched) {
    clearInterval(timerInterval);
    tapping = false;
    hatchEgg.style.pointerEvents = 'none';
    tapHint.textContent = 'Time\u2019s up! 😢';
    timerDisplay.textContent = '0.0s';

    // show try again button
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
  tapCounter.textContent = '0 / 10';
  tapCounter.style.color = '';
  tapProgressFill.style.width = '0%';
  timerDisplay.textContent = '3.0s';
  timerDisplay.classList.remove('urgent');
  countdownOverlay.innerHTML = '';
  const tryBtn = document.querySelector('.try-again-btn');
  if (tryBtn) tryBtn.remove();
}

hatchEgg.addEventListener('click', () => {
  if (hatched || !tapping) return;
  tapCount++;

  // pop animation
  hatchEgg.classList.remove('tap-pop');
  void hatchEgg.offsetWidth;
  hatchEgg.classList.add('tap-pop');

  // wobble increases with taps
  const wobble = Math.min(tapCount * 2, 20);
  hatchEgg.style.animation = 'none';
  hatchEgg.style.transform = `rotate(${(tapCount % 2 === 0 ? wobble : -wobble)}deg) scale(${1 + tapCount * 0.03})`;

  // update counter & progress
  tapCounter.textContent = `${tapCount} / ${tapGoal}`;
  tapProgressFill.style.width = `${(tapCount / tapGoal) * 100}%`;

  // encouragement messages
  if (tapCount === 3) tapHint.textContent = 'Keep going! 💪';
  if (tapCount === 6) tapHint.textContent = 'Almost there! 🔥';
  if (tapCount === 9) tapHint.textContent = 'One more! 🎉';

  if (tapCount >= tapGoal) {
    hatched = true;
    tapping = false;
    clearInterval(timerInterval);
    hatchEgg.style.transform = '';
    hatchEgg.style.animation = '';
    hatchEgg.textContent = '🍫';
    hatchEgg.classList.remove('tap-pop');
    hatchEgg.classList.add('hatched');
    tapHint.textContent = 'Chocolate! 🎊';
    tapCounter.style.color = 'var(--mint)';
    timerDisplay.style.color = 'var(--mint)';

    // transition to final stage
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
