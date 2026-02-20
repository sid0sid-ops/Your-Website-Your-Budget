// Define canvas but don't start animation until user triggers it
let canvas, ctx, width, height;
let stars = [];
let scrollVelocity = 0;
let lastScrollY = window.scrollY;
let animationStarted = false;

function initializeApp() {
  // Fade in main content
  document.body.classList.add('content-visible');
  document.getElementById('main-content').classList.add('visible');

  // Start animation only once
  if (animationStarted) return;
  animationStarted = true;

  // Setup canvas
  canvas = document.getElementById("star-canvas");
  ctx = canvas.getContext("2d");

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener("resize", resize);
  resize();

  // Create stars
  const STAR_COUNT = 200;
  stars = Array.from({ length: STAR_COUNT }, () => createStar());

  function createStar() {
    return {
      x: Math.random() * width,
      y: Math.random() * height,
      radius: Math.random() * 1.2 + 0.4,
      speedY: Math.random() * 0.6 + 0.4,
      baseAlpha: Math.random() * 0.7 + 0.3,
      twinkleSpeed: Math.random() * 0.005 + 0.001,
      twinklePhase: Math.random() * Math.PI * 2
    };
  }

  let pendingScroll = false;
  function onScroll() {
    if (pendingScroll) return;
    pendingScroll = true;
    requestAnimationFrame(() => {
      const newY = window.scrollY;
      scrollVelocity += (newY - lastScrollY) * 0.22;
      lastScrollY = newY;
      pendingScroll = false;
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  let lastTouchY = null;
  window.addEventListener("touchmove", (e) => {
    if (e.touches.length) {
      const currentY = e.touches[0].clientY;
      if (lastTouchY !== null) {
        scrollVelocity += (lastTouchY - currentY) * 0.17;
      }
      lastTouchY = currentY;
    }
  });
  window.addEventListener("touchend", () => lastTouchY = null);

  function drawStar(star, alpha) {
    const glow = ctx.createRadialGradient(
      star.x, star.y, 0,
      star.x, star.y, star.radius * 4
    );
    glow.addColorStop(0, `rgba(255,255,255,${alpha})`);
    glow.addColorStop(0.5, `rgba(255,255,255,${alpha * 0.07})`);
    glow.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius * 4, 0, 2 * Math.PI);
    ctx.fillStyle = glow;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  function animate(time) {
    ctx.clearRect(0, 0, width, height);
    scrollVelocity *= 0.94;

    for (let i = 0; i < stars.length; i++) {
      const star = stars[i];
      const twinkle = star.baseAlpha * (0.5 + 0.5 * Math.sin(time * star.twinkleSpeed + star.twinklePhase));
      star.y += star.speedY + scrollVelocity * 0.07;

      if (star.y > height + 5) {
        stars[i] = createStar();
        stars[i].y = -10;
      }

      drawStar(stars[i], twinkle);
    }
    // requestAnimationFrame(animate); // REMOVE this line
    rafId = requestAnimationFrame(animate); // Use control variable for pause/resume
  }

  // --- Animation control state ---
  let rafId = null;
  let isAnimating = false;

  // Call this instead of requestAnimationFrame(animate)
  function startAnimation() {
    if (isAnimating) return;       // prevent double starts
    isAnimating = true;
    rafId = requestAnimationFrame(animate);
  }

  function stopAnimation() {
    if (!isAnimating) return;
    isAnimating = false;
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  // --- Visibility handling (pause when tab hidden) ---
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopAnimation();
    } else {
      startAnimation();
    }
  });

  // --- iOS/Safari lifecycle safety ---
  window.addEventListener('pagehide', stopAnimation);
  window.addEventListener('pageshow', startAnimation);

  // --- Respect reduced motion preference ---
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (prefersReducedMotion.matches) {
    stopAnimation();
  }
  prefersReducedMotion.addEventListener('change', (e) => {
    if (e.matches) stopAnimation(); else startAnimation();
  });

  // Start animation (replace direct requestAnimationFrame call)
  startAnimation();
}

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  document.documentElement.style.setProperty('--scroll-y', `${y}px`);
  
  const contactBox = document.getElementById('contactBox');
  if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 5) {
    contactBox.classList.add('visible');
  } else {
    contactBox.classList.remove('visible');
  }
});
