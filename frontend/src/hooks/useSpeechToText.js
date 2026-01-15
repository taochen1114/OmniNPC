import { useEffect, useRef, useState } from 'react';
import RecordRTC from 'recordrtc';
import OpenAI from 'openai';
import {
  isAudioPlaying,
  clearStream,
  filterTranscribedText,
  logError,
} from '../utils';
import { useChat } from '../context/useChat';

const VOICE_MIME_TYPE = 'audio/mp4';
const VOICE_FILE_NAME = 'audio.mp4';

/**
 * @param {Object} params
 * @param {React.MutableRefObject} params.isInConversationRef 用於判斷是否還在對話
 * @param {function(string): void} params.onVoiceToTextComplete 語音轉文字完成時，回傳純文字
 * @param {function(): void | Promise<void>} params.onVoiceInputFail 發生語音輸入失敗時（包含錄音檔為空、語音轉文字失敗等）的 callback，通常會傳入 `askUserToRetryVoiceInput`；記得檢查這個 callback function 是否為 async function
 */
export function useSpeechToText({
  isInConversationRef,
  onVoiceToTextComplete,
  onVoiceInputFail,
}) {
  const [isRecording, setIsRecording] = useState(false);
  const isRecordingRef = useRef(false);

  const [isTranscribing, setIsTranscribing] = useState(false);
  const isTranscribingRef = useRef(false);

  const isPreparingRecorderRef = useRef(false);
  const streamRef = useRef(null);
  const mediaRecorderRef = useRef(null);

  const { audioRef } = useChat();

  const openai = new OpenAI({
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true,
  });

  const syncIsRecordingRefAndState = (val) => {
    isRecordingRef.current = val;
    setIsRecording(val);
  };

  const syncIsTranscribingRefAndState = (val) => {
    isTranscribingRef.current = val;
    setIsTranscribing(val);
  };

  const startRecording = async () => {
    try {
      if (!MediaRecorder.isTypeSupported(VOICE_MIME_TYPE)) {
        alert('MIME type not supported: ' + VOICE_MIME_TYPE);
        resetRecording();
        return;
      }

      isPreparingRecorderRef.current = true;

      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new RecordRTC(streamRef.current, {
        // disableLogs: true,
        type: 'audio',
        mimeType: VOICE_MIME_TYPE,
        timeSlice: 200,
        ondataavailable: async (blob) => {
          console.log('blob.size', blob.size);
          if (blob.size === 0) {
            // 停止錄音並重設
            try {
              mediaRecorderRef.current?.stopRecording(() => {
                mediaRecorderRef.current.destroy();
                mediaRecorderRef.current = null;
              });
            } catch (error) {
              logError('Reset recorder failed', error);
            }
            if (typeof onVoiceInputFail === 'function') {
              await onVoiceInputFail();
            }
            resetRecording();
            return;
          }
        },
      });

      mediaRecorderRef.current = recorder;
      recorder.startRecording();
      console.log('record starting');
    } catch (error) {
      logError('Error accessing microphone', error);
      if (typeof onVoiceInputFail === 'function') {
        await onVoiceInputFail();
      }
      resetRecording();
    } finally {
      isPreparingRecorderRef.current = false;
    }
  };

  const stopRecording = async () => {
    try {
      if (!mediaRecorderRef.current) {
        return;
      }

      mediaRecorderRef.current.stopRecording(async () => {
        const audioBlob = mediaRecorderRef.current.getBlob();
        console.log('audioBlob.size', audioBlob.size);
        await handleRecordingStop(audioBlob);

        // 釋放 RecordRTC 相關資源
        mediaRecorderRef.current.destroy();
        mediaRecorderRef.current = null;
      });
    } catch (error) {
      logError('Error stopRecording()', error);
    }
  };

  const handleRecordingStop = async (audioBlob) => {
    const file = new File([audioBlob], VOICE_FILE_NAME, {
      type: VOICE_MIME_TYPE,
    });

    // 檢查 blob 是否為空檔（有 chunk 但無實際資料）
    if (audioBlob.size === 0) {
      console.warn('⚠️ 音訊為空，請重新錄音');
      if (typeof onVoiceInputFail === 'function') {
        await onVoiceInputFail();
      }
      resetRecording();
      return;
    }

    try {
      syncIsTranscribingRefAndState(true);

      // 語音轉文字
      const payload = {
        file,
        model: 'whisper-1',
        response_format: 'verbose_json',
        language: 'zh',
        prompt: '你必須以繁體中文結果輸出，必須採用台灣地區常用的說法',
      };
      console.log(payload.file);

      const transcription = await openai.audio.transcriptions.create(payload);
      console.log('ok. returned transcription.text:', transcription.text);

      // 避免已經離開對話了，但殘留的語音轉文字的內容卻顯示在畫面上
      if (isInConversationRef.current) {
        const filteredText = filterTranscribedText(transcription.text);
        if (filteredText === '') {
          console.warn('音檔轉換文字成功，但內容為空');
          if (typeof onVoiceInputFail === 'function') {
            await onVoiceInputFail();
          }
          return;
        }
        if (typeof onVoiceToTextComplete === 'function') {
          onVoiceToTextComplete(filteredText);
        }
      }
    } catch (error) {
      logError('Error transcribing audio', error);
      if (typeof onVoiceInputFail === 'function') {
        await onVoiceInputFail();
      }
    } finally {
      resetRecording();
      syncIsTranscribingRefAndState(false);
    }
  };

  const toggleRecording = () => {
    if (!isInConversationRef.current) {
      return;
    }

    if (isAudioPlaying(audioRef)) {
      alert('目前小幫手還沒回覆完畢哦');
      return;
    }

    if (isTranscribingRef.current) {
      alert('語音轉文字中，請於稍後再錄下一段');
      return;
    }

    if (isRecordingRef.current) {
      syncIsRecordingRefAndState(false);
      stopRecording();
    } else {
      if (isPreparingRecorderRef.current) {
        console.warn('準備 recorder 中');
        return;
      }
      syncIsRecordingRefAndState(true);
      startRecording();
    }
  };

  const resetRecording = () => {
    clearStream(streamRef);
    syncIsRecordingRefAndState(false);
  };

  const cleanupRecorder = () => {
    const recorder = mediaRecorderRef.current;
    return new Promise((resolve) => {
      if (!recorder) {
        resolve();
        return;
      }
      recorder.stopRecording(() => {
        recorder.destroy();
        mediaRecorderRef.current = null;
        resolve();
      });
    });
  };

  useEffect(() => {
    return () => {
      (async () => {
        await cleanupRecorder();
        clearStream(streamRef);
      })();
    };
  }, []);

  return {
    isRecording,
    toggleRecording,
    resetRecording,
    isTranscribing,
    syncIsTranscribingRefAndState,
  };
}
