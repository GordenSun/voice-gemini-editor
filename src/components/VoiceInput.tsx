import React, { useState, useEffect } from 'react';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
  isListening: boolean;
  setIsListening: (isListening: boolean) => void;
}

const VoiceInput: React.FC<VoiceInputProps> = ({ 
  onTranscript, 
  isListening, 
  setIsListening 
}) => {
  const [transcript, setTranscript] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // 检查浏览器是否支持语音识别
    if (typeof window !== 'undefined' && 
        ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'zh-CN';
      
      recognitionInstance.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            currentTranscript += event.results[i][0].transcript;
          }
        }
        
        if (currentTranscript) {
          setTranscript(currentTranscript);
          onTranscript(currentTranscript);
        }
      };
      
      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };
      
      recognitionInstance.onend = () => {
        if (isListening) {
          recognitionInstance.start();
        }
      };
      
      setRecognition(recognitionInstance);
    } else {
      console.warn('您的浏览器不支持语音识别功能');
    }
    
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, []);

  useEffect(() => {
    if (recognition) {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.error('Error starting recognition:', e);
        }
      } else {
        try {
          recognition.stop();
        } catch (e) {
          console.error('Error stopping recognition:', e);
        }
      }
    }
  }, [isListening, recognition]);

  const toggleListening = () => {
    setIsListening(!isListening);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center mb-2">
        <button
          onClick={toggleListening}
          className={`px-4 py-2 rounded-full ${
            isListening 
              ? 'bg-red-500 text-white' 
              : 'bg-blue-500 text-white'
          }`}
        >
          {isListening ? '停止录音' : '开始录音'}
        </button>
        <span className="ml-2 text-sm text-gray-500">
          {isListening ? '正在录音...' : '点击开始录音'}
        </span>
      </div>
      {transcript && (
        <div className="p-3 bg-gray-100 rounded-lg">
          <p className="text-gray-700">{transcript}</p>
        </div>
      )}
    </div>
  );
};

export default VoiceInput;
