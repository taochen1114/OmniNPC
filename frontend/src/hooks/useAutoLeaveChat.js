import { useCallback, useEffect, useRef } from 'react';

export function useAutoLeaveChat({
  enabled,
  timeoutMs = 3 * 60 * 1000,
  busyRecheckMs = 10 * 1000,
  onTimeout,
  isBusy,
}) {
  const timerRef = useRef(null);
  const tokenRef = useRef(0);

  const onTimeoutRef = useRef(onTimeout);
  const isBusyRef = useRef(isBusy);

  useEffect(() => {
    onTimeoutRef.current = onTimeout;
  }, [onTimeout]);

  useEffect(() => {
    isBusyRef.current = isBusy;
  }, [isBusy]);

  const clear = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const attempt = useCallback(
    (token) => {
      if (!enabled) {
        return;
      }
      if (tokenRef.current !== token) {
        return;
      }

      if (isBusyRef.current?.()) {
        clear();
        timerRef.current = setTimeout(() => attempt(token), busyRecheckMs);
        return;
      }

      onTimeoutRef.current?.();
    },
    [enabled, busyRecheckMs, clear]
  );

  const reset = useCallback(() => {
    if (!enabled) {
      return;
    }

    clear();
    const token = Date.now();
    tokenRef.current = token;

    timerRef.current = setTimeout(() => attempt(token), timeoutMs);
  }, [enabled, timeoutMs, clear, attempt]);

  useEffect(() => {
    if (!enabled) {
      clear();
      return;
    }

    reset();

    const handler = () => reset();

    const windowEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'];

    windowEvents.forEach((evt) => {
      window.addEventListener(evt, handler, {
        passive: true,
        capture: true,
      });
    });

    document.addEventListener('scroll', handler, {
      passive: true,
      capture: true,
    });

    document.addEventListener('focusin', handler, {
      passive: true,
      capture: true,
    });

    return () => {
      windowEvents.forEach((evt) => {
        window.removeEventListener(evt, handler, { capture: true });
      });
      document.removeEventListener('scroll', handler, { capture: true });
      document.removeEventListener('focusin', handler, { capture: true });
      clear();
    };
  }, [enabled, reset, clear]);

  return { reset, clear };
}
