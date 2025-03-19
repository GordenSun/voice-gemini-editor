import { GoogleGenerativeAI } from "@google/generative-ai";

// 初始化 Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

// 获取 Gemini 模型
export const getGeminiModel = () => {
  return genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp-image-generation",
    generationConfig: {
      responseModalities: ['Text', 'Image']
    }
  });
};

// 将图片转换为 Base64
export const imageToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const base64String = reader.result as string;
      // 移除 data:image/jpeg;base64, 前缀
      const base64 = base64String.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
};

// 获取图片的 MIME 类型
export const getMimeType = (file: File): string => {
  return file.type;
};

// 编辑图片
export const editImage = async (
  imageBase64: string, 
  mimeType: string, 
  prompt: string
) => {
  const model = getGeminiModel();
  
  try {
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: imageBase64
        }
      }
    ]);
    
    // 处理响应
    const response = result.response;
    let resultText = "";
    let resultImage = "";
    
    // 遍历响应中的部分，提取文本和图片
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.text) {
          resultText += part.text;
        } else if (part.inlineData) {
          resultImage = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    
    return { text: resultText, image: resultImage };
  } catch (error) {
    console.error("Error editing image:", error);
    throw error;
  }
};
