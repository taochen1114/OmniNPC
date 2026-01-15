const lipsync = {
  metadata: {
    duration: 6.91,
    soundFile: './audios/tmp_e45c79f7-fce1-4529-ada6-c28d747884dc.wav',
  },
  mouthCues: [
    {
      end: 0.04,
      start: 0,
      value: 'X',
    },
    {
      end: 0.11,
      start: 0.04,
      value: 'F',
    },
    {
      end: 0.38,
      start: 0.11,
      value: 'B',
    },
    {
      end: 0.59,
      start: 0.38,
      value: 'C',
    },
    {
      end: 0.94,
      start: 0.59,
      value: 'B',
    },
    {
      end: 1.22,
      start: 0.94,
      value: 'F',
    },
    {
      end: 1.29,
      start: 1.22,
      value: 'B',
    },
    {
      end: 1.43,
      start: 1.29,
      value: 'E',
    },
    {
      end: 1.57,
      start: 1.43,
      value: 'C',
    },
    {
      end: 1.65,
      start: 1.57,
      value: 'A',
    },
    {
      end: 1.77,
      start: 1.65,
      value: 'D',
    },
    {
      end: 1.84,
      start: 1.77,
      value: 'C',
    },
    {
      end: 2.05,
      start: 1.84,
      value: 'B',
    },
    {
      end: 2.13,
      start: 2.05,
      value: 'A',
    },
    {
      end: 2.22,
      start: 2.13,
      value: 'C',
    },
    {
      end: 2.29,
      start: 2.22,
      value: 'E',
    },
    {
      end: 2.36,
      start: 2.29,
      value: 'F',
    },
    {
      end: 2.78,
      start: 2.36,
      value: 'B',
    },
    {
      end: 2.98,
      start: 2.78,
      value: 'C',
    },
    {
      end: 3.73,
      start: 2.98,
      value: 'B',
    },
    {
      end: 3.94,
      start: 3.73,
      value: 'C',
    },
    {
      end: 4.02,
      start: 3.94,
      value: 'A',
    },
    {
      end: 4.14,
      start: 4.02,
      value: 'C',
    },
    {
      end: 4.35,
      start: 4.14,
      value: 'B',
    },
    {
      end: 4.84,
      start: 4.35,
      value: 'C',
    },
    {
      end: 4.98,
      start: 4.84,
      value: 'E',
    },
    {
      end: 6.91,
      start: 4.98,
      value: 'X',
    },
  ],
};

export const askUserToRetryVoiceInputResponse = {
  animation: 'Idle',
  audioUrl: `/assets/audio/ask_user_to_retry_voice_input_20260115_141037_447255.mp3`,
  facialExpression: 'smile',
  images: null,
  lipsync: lipsync,
  text: '不好意思，請您重新再說一次',
};

export const chatbotSelfIntroductionResponse = {
  animation: 'Idle',
  audioUrl: `/assets/audio/chatbot_self_introduction_20260115_140226_983811.mp3`,
  facialExpression: 'smile',
  images: null,
  lipsync: lipsync,
  // summary: '你好！我是你的櫃台小幫手，以下問題都可以問我喔',
  // text: '會議室指引\n會議室資訊',
  text: '你好，今天有甚麼想詢問的嗎？',
};
