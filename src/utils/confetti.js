export function triggerConfetti() {
  const colors = ["#fbbf24", "#f59e0b", "#6366f1", "#8b5cf6", "#10b981"];
  const confettiCount = 40;
  
  for (let i = 0; i < confettiCount; i++) {
    setTimeout(() => {
      createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }, i * 25);
  }
}

function createConfetti(color) {
  const confetti = document.createElement("div");
  const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
  
  confetti.style.position = "fixed";
  confetti.style.width = Math.random() * 10 + 5 + "px";
  confetti.style.height = Math.random() * 10 + 5 + "px";
  confetti.style.backgroundColor = color;
  confetti.style.left = startX + "px";
  confetti.style.top = "50%";
  confetti.style.opacity = "1";
  confetti.style.borderRadius = Math.random() > 0.5 ? "50%" : "2px";
  confetti.style.pointerEvents = "none";
  confetti.style.zIndex = "9999";
  
  document.body.appendChild(confetti);
  
  const angle = Math.random() * Math.PI * 2;
  const velocity = Math.random() * 500 + 300;
  const endX = startX + Math.cos(angle) * velocity;
  const endY = window.innerHeight + 100;
  
  const fall = confetti.animate([
    { 
      transform: "translateY(0) rotate(0deg) scale(1)", 
      opacity: 1 
    },
    { 
      transform: `translate(${endX - startX}px, ${endY}px) rotate(${Math.random() * 720}deg) scale(0.5)`, 
      opacity: 0 
    }
  ], {
    duration: 2000 + Math.random() * 1000,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)"
  });
  
  fall.onfinish = () => confetti.remove();
}

export function triggerLevelUp() {
  const colors = ["#fbbf24", "#f59e0b"];
  
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      createConfetti(colors[Math.floor(Math.random() * colors.length)]);
    }, i * 20);
  }
}