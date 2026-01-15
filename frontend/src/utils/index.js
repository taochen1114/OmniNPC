const backendUrl = import.meta.env.VITE_BACKEND_URL;

export function logError(prefix, error) {
  console.error(`${prefix}: ${error?.message || JSON.stringify(error)}`);
}

function uuidv4Fallback() {
  // 生成 UUIDv4（需要 crypto.getRandomValues）
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);

  // UUIDv4: version = 4, variant = 10xx
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join(
    ''
  );
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

/** 前端用的簡易 ID：優先 UUID，fallback 為時間戳 + 計數器 */
export const genMsgId = (() => {
  let seq = 0;

  function makeFallbackId() {
    seq = (seq + 1) % 1000000;
    const t = Date.now().toString(36);
    const p =
      globalThis.performance && performance.now
        ? performance.now().toString(36).replace('.', '')
        : '0';
    const r = Math.random().toString(36).slice(2, 8);
    return t + '_' + p + '_' + seq.toString(36) + '_' + r;
  }

  return function (prefix = '') {
    const c = globalThis.crypto;
    let coreId;

    if (c && typeof c.randomUUID === 'function') {
      coreId = c.randomUUID();
    } else if (c && typeof c.getRandomValues === 'function') {
      coreId = uuidv4Fallback();
    } else {
      coreId = makeFallbackId();
    }

    return prefix ? prefix + '_' + coreId : coreId;
  };
})();

export function generatePageId() {
  return Date.now().toString() + Math.random().toString(36).substring(2);
}

export function notifyPageCreated(pageId) {
  fetch(`${backendUrl}/on_page_create`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId: pageId,
    }),
  });
}

export function notifyPageRemoved(pageId) {
  fetch(`${backendUrl}/on_page_remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      pageId: pageId,
    }),
    keepalive: true, // 確保瀏覽器允許在 unload 時執行請求
  });
}

export const clearStream = (streamRef) => {
  if (!streamRef) {
    throw new Error('請傳入 streamRef');
  }
  if (streamRef.current && typeof streamRef.current.getTracks === 'function') {
    streamRef.current.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
  }
};

export const isAudioPlaying = (audioRef) => {
  const audio = audioRef?.current;
  if (!(audio instanceof HTMLAudioElement)) {
    if (import.meta.env.MODE !== 'production') {
      console.error(
        'isAudioPlaying: 沒有傳入 audioRef，或傳入的 audioRef 不正確'
      );
    }
    return false;
  }
  return !audio.paused && !audio.ended;
};

/** 過濾語音轉文字 api 回傳的文字 */
export const filterTranscribedText = (text) => {
  const filteredTextArray = [
    '請不吝點贊訂閱轉發打賞支持明鏡與點點欄目',
    '多謝您收睇時局新聞,再會!',
    '感謝您收睇時局新聞,再會!',
    '﹝笑聲﹞',
    '﹝輕快的音樂結束﹞',
    '﹝輕快音樂停止﹞',
    '以上言論不代表本台立場',
    '也必須用普通話來表達',
  ];

  const keywords = ['Amara.org', 'MING PAO CANADA', '本期視頻'];

  // 如果有包含任一個關鍵字，則回傳空字串
  if (keywords.some((keyword) => text.includes(keyword))) {
    return '';
  }

  // 若 text 完全等於陣列中任一字串，則回傳空字串
  if (filteredTextArray.includes(text)) {
    return '';
  }

  return text;
};
