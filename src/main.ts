import './style.scss';

document.addEventListener('DOMContentLoaded', () => {
  // Interactive gradient mouse movement
  const interBubble = document.querySelector<HTMLDivElement>('.interactive')!;
  let curX = 0, curY = 0, tgX = 0, tgY = 0;

  function move() {
    curX += (tgX - curX) / 20;
    curY += (tgY - curY) / 20;
    interBubble.style.transform = `translate(${Math.round(curX)}px, ${Math.round(curY)}px)`;
    requestAnimationFrame(move);
  }

  window.addEventListener('mousemove', (event) => {
    tgX = event.clientX;
    tgY = event.clientY;
  });

  move();

  // One-scene-per-scroll logic
  const scenes = document.querySelectorAll<HTMLElement>('.scene');
  let isScrolling = false;
  let currentScene = 0;

  window.addEventListener('wheel', (e) => {
    if (isScrolling) return;
    isScrolling = true;

    if (e.deltaY > 0 && currentScene < scenes.length - 1) {
      currentScene++;
    } else if (e.deltaY < 0 && currentScene > 0) {
      currentScene--;
    }

    scenes[currentScene].scrollIntoView({ behavior: 'smooth' });

    setTimeout(() => { isScrolling = false; }, 800);
  });
});