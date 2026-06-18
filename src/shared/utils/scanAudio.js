const soundPaths = {
  success: "/sounds/beep_success.mp3",
  error: "/sounds/beep_error.mp3",
};

const players = new Map();

const getPlayer = (type) => {
  if (!players.has(type)) {
    const audio = new Audio(soundPaths[type]);
    audio.preload = "auto";
    audio.volume = type === "error" ? 0.65 : 0.5;
    players.set(type, audio);
  }
  return players.get(type);
};

export const playScanSound = (type) => {
  try {
    const audio = getPlayer(type);
    audio.currentTime = 0;
    void audio.play().catch(() => {});
  } catch {
    // Audio feedback is optional when the browser blocks playback.
  }
};

export const playScanSuccess = () => playScanSound("success");
export const playScanError = () => playScanSound("error");
