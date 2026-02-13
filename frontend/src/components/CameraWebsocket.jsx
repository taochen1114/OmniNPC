import { useEffect, useRef, useState } from 'react';

export const CameraWebSocket = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const intervalRef = useRef(null);

  const [prediction, setPrediction] = useState(null);
  const [isReady, setIsReady] = useState(false);

  const CAPTURE_INTERVAL = 150;

  useEffect(() => {
    initCamera();
    initWebSocket();

    return () => {
      cleanup();
    };
  }, []);

  const initCamera = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: false,
    });

    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  };

  const initWebSocket = () => {
    // const ws = new WebSocket('ws://localhost:8000/ws');
    const backendPort = 9527;
    const ws = new WebSocket(`ws://localhost:${backendPort}/ws`);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      setIsReady(true);
      startCapture();
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setPrediction(data);
      isSendingRef.current = false;
    };

    wsRef.current = ws;
  };

  const isSendingRef = { current: false };

  const startCapture = () => {
    intervalRef.current = setInterval(() => {
      captureAndSend();
    }, CAPTURE_INTERVAL);
  };

  const captureAndSend = () => {
    if (!videoRef.current || !canvasRef.current) {
      return;
    }
    if (!wsRef.current || wsRef.current.readyState !== 1) {
      return;
    }
    if (isSendingRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const WIDTH = 640;
    const HEIGHT = 480;

    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    ctx.drawImage(video, 0, 0, WIDTH, HEIGHT);

    canvas.toBlob(
      (blob) => {
        if (!blob) {
          return;
        }

        isSendingRef.current = true;
        wsRef.current.send(blob);
      },
      'image/jpeg',
      0.7
    );
  };

  const cleanup = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
    }

    if (videoRef.current && videoRef.current.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
    }
  };

  return (
    <div>
      <h2>WebSocket Camera AI</h2>

      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        style={{ width: '480px' }}
      />

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div>
        <h3>Prediction</h3>
        <pre>
          {prediction
            ? JSON.stringify(prediction, null, 2)
            : isReady
              ? 'Waiting...'
              : 'Connecting...'}
        </pre>
      </div>
    </div>
  );
};
