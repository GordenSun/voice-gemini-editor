import React, { useState, useRef, useEffect } from 'react';
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
  
  // 添加一个引用，用于跟踪当前正在编辑的图片内容
  const currentImageRef = useRef<{
    dataUrl: string | null,
    base64: string | null,
    mimeType: string | null
  }>({
    dataUrl: null,
    base64: null,
    mimeType: null
  });

  // 当原始图片或编辑后的图片改变时，更新当前图片引用
  useEffect(() => {
    if (editedImage) {
      // 如果有编辑后的图片，使用它
      const [dataUrlHeader, base64Data] = editedImage.split(',');
      const mimeType = dataUrlHeader.match(/data:(.*);base64/)?.[1] || '';
      
      currentImageRef.current = {
        dataUrl: editedImage,
        base64: base64Data,
        mimeType: mimeType
      };
      
      console.log("更新当前图片引用为编辑后的图片", mimeType);
    } else if (originalImage) {
      // 如果只有原始图片，使用它
      currentImageRef.current = {
        dataUrl: originalImage,
        base64: originalImage.split(',')[1],
        mimeType: selectedFile ? getMimeType(selectedFile) : ''
      };
      
      console.log("更新当前图片引用为原始图片");
    }
  }, [editedImage, originalImage, selectedFile]);

  const handleImageSelect = (file: File) => {
    setSelectedFile(file);
    
    // 创建预览 URL
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setOriginalImage(result);
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
      
      // 使用当前图片引用中的数据
      const current = currentImageRef.current;
      let imageToEditBase64 = '';
      let imageType = '';
      
      if (current.base64 && current.mimeType) {
        imageToEditBase64 = current.base64;
        imageType = current.mimeType;
        console.log("使用当前引用的图片进行编辑:", {
          usingEditedImage: !!editedImage,
          mimeType: imageType
        });
      } else {
        // 如果引用中没有数据，回退到原始方法
        imageToEditBase64 = await imageToBase64(selectedFile);
        imageType = getMimeType(selectedFile);
        console.log("回退：使用原始图片:", imageType);
      }
      
      // 调用 Gemini API 编辑图片
      const result = await editImage(imageToEditBase64, imageType, transcript);
      
      if (result.image) {
        console.log("图片编辑成功，更新状态");
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