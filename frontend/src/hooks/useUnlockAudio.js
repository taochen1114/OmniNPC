import { useEffect, useRef } from 'react';

export function useUnlockAudio() {
  const silentAudioUrl = '/assets/audio/silent.mp3';
  const audioRef = useRef(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }

    const UNLOCK_EVENTS = [
      'click',
      'touchstart',
      'touchend',
      'mousedown',
      'keydown',
    ];

    const removeUnlockEventListener = () => {
      UNLOCK_EVENTS.forEach((ue) =>
        document.removeEventListener(ue, unlockAudio)
      );
    };

    const unlockAudio = (event) => {
      if (audioRef.current.src) {
        return;
      }
      audioRef.current.src = silentAudioUrl;
      audioRef.current
        .play()
        .then(() => {
          console.log(`✅ 已透過 ${event.type} 解鎖音訊播放`);
          removeUnlockEventListener();
        })
        .catch((err) => {
          console.warn(`❌ ${event.type} 解鎖失敗`, err);
          audioRef.current.src = '';
        });
    };

    UNLOCK_EVENTS.forEach((ue) => {
      document.addEventListener(ue, unlockAudio);
    });

    return () => {
      removeUnlockEventListener();
    };
  }, []);

  return audioRef;
}
