import foldSound from "../assets/sounds/disconnect.mp3";
import callSound from "../assets/sounds/chip.mp3";
import raiseSound from "../assets/sounds/chip1.mp3";
import allInSound from "../assets/sounds/all-in.mp3";
import checkSound from "../assets/sounds/check.mp3";

const audioMap = {
  fold: new Audio(foldSound),
  call: new Audio(callSound),
  raise: new Audio(raiseSound),
  allin: new Audio(allInSound),
  check: new Audio(checkSound),
};

let unlocked = false;
let muted = false;

export function setMuted(value: boolean) {
  muted = value;
}

export function toggleMute() {
  muted = !muted;
  return muted;
}

export function isMuted() {
  return muted;
}

export function unlockAudio() {
  if (unlocked) return;

  Object.values(audioMap).forEach((audio) => {
    audio.volume = 0;
    audio.play().catch(() => {});
    audio.pause();
    audio.currentTime = 0;
    audio.volume = 1;
  });

  unlocked = true;
}

export function playActionSound(action?: string) {
  if (!action || muted) return;

  let sound: keyof typeof audioMap | null = null;

  if (action.includes("Fold")) sound = "fold";
  else if (action.includes("Raise")) sound = "raise";
  else if (action.includes("Call")) sound = "call";
  else if (action.includes("Check")) sound = "check";
  else if (action.includes("All-in")) sound = "allin";

  if (!sound) return;

  const audio = audioMap[sound];
  audio.pause();
  audio.currentTime = 0;
  audio.play().catch(() => {});
}
