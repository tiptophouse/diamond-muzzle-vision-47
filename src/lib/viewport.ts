
// iOS viewport height fixes
export function initViewport() {
  setVH();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setVH);
  window.addEventListener('orientationchange', () => {
    // Delay to ensure orientation change is complete
    setTimeout(setVH, 100);
  });
}

export function setVH() {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

// Clean up listeners
export function cleanupViewport() {
  window.removeEventListener('resize', setVH);
  window.removeEventListener('orientationchange', setVH);
}
