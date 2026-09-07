import confetti from 'canvas-confetti';

export function triggerPatientRegistrationConfetti() {
  if (typeof window === 'undefined') return;

  confetti({
    particleCount: 120,
    spread: 80,
    origin: { y: 0.6 },
    colors: ['#13195C', '#10B981', '#F59E0B', '#6366F1', '#EC4899']
  });

  setTimeout(() => {
    confetti({
      particleCount: 60,
      angle: 60,
      spread: 55,
      origin: { x: 0 }
    });
    confetti({
      particleCount: 60,
      angle: 120,
      spread: 55,
      origin: { x: 1 }
    });
  }, 250);
}
