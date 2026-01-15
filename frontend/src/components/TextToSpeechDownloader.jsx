import { useState } from 'react';

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export const TextToSpeechDownloader = () => {
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    const downloadFileName = 'chatbot_self_introduction';

    if (!text.trim()) {
      alert('請輸入要轉換的文字');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${backendUrl}/generate_speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
        }),
      });

      if (!response.ok) {
        throw new Error('API 請求失敗');
      }

      const data = await response.json();
      if (!data.audio || !data.format) {
        throw new Error('API 回傳格式錯誤');
      }

      // 建立 blob 供下載
      const audioBase64 = data.audio;
      const audioFormat = data.format;
      const byteCharacters = atob(audioBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: `audio/${audioFormat}` });

      // 下載
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${downloadFileName}.${audioFormat}`;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
    } catch (error) {
      alert('產生語音檔案失敗：' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[50dvh] w-dvw bg-slate-200 p-10">
      <h2 className="text-center text-5xl">文字轉語音下載</h2>
      <textarea
        rows={4}
        className="mt-6 w-full text-3xl"
        placeholder="請輸入要轉換的文字"
        value={text}
        onChange={(e) => {
          setText(e.target.value);
        }}
        disabled={loading}
      />
      <button
        className="rounded border-none bg-[#1890ff] p-6 text-3xl text-white"
        onClick={handleGenerate}
        disabled={loading}
      >
        {loading ? '生成中...' : '生成並下載語音檔'}
      </button>
    </div>
  );
};
