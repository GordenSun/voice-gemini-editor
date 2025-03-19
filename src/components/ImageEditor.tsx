import React, { useState } from 'react';
import ImageUpload from './ImageUpload';
import VoiceInput from './VoiceInput';
import ResultDisplay from './ResultDisplay';
import { editImage, imageToBase64, getMimeType } from '../lib/gemini';

const ImageEditor: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [description, setDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    
    // 创建预览 URL
    const reader = new FileReader();
    reader.onload = () => {
      setOriginalImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    
    // 重置编辑结果
    setEditedImage(null);
    setDescription('');
  };

  const handleVoiceCommand = async (transcript: string) => {
    if (!transcript || !selectedFile) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      // 将图片转换为 Base64
      const base64 = await imageToBase64(selectedFile);
      const mimeType = getMimeType(selectedFile);
      
      // 使用当前编辑过的图片或原始图片
      const imageToEdit = editedImage ? editedImage.split(',')[1] : base64;
      const imageType = mimeType;
      
      // 调用 Gemini API 编辑图片
      const result = await editImage(imageToEdit, imageType, transcript);
      
      if (result.image) {
        setEditedImage(result.image);
        setDescription(result.text);
      } else {
        setError('未能生成编辑后的图片');
      }
    } catch (err) {
      console.error('编辑图片时出错:', err);
      setError('处理图片时出错，请重试');
    } finally {
      setIsProcessing(false);
      setIsListening(false); // 停止录音
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gemini 图片编辑器</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <ImageUpload onImageSelect={handleImageSelect} />
      
      {selectedFile && (
        <>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">语音指令</h2>
            <p className="text-sm text-gray-600 mb-2">
              点击开始录音按钮，然后说出你想要对图片进行的编辑操作。
            </p>
            <VoiceInput 
              onTranscript={handleVoiceCommand}
              isListening={isListening}
              setIsListening={setIsListening}
            />
          </div>
          
          {isProcessing && (
            <div className="flex items-center justify-center p-6">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-700">处理中...</span>
            </div>
          )}
          
          <ResultDisplay 
            originalImage={originalImage}
            editedImage={editedImage}
            description={description}
          />
        </>
      )}
    </div>
  );
};

export default ImageEditor;
