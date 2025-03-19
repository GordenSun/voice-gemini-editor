import type { NextApiRequest, NextApiResponse } from 'next';
import { GoogleGenerativeAI } from '@google/generative-ai';

type ResponseData = {
  text?: string;
  image?: string;
  error?: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { prompt, image, mimeType } = req.body;

    if (!prompt || !image || !mimeType) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash-exp-image-generation",
      generationConfig: {
        responseModalities: ['Text', 'Image']
      }
    });

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: mimeType,
          data: image
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

    return res.status(200).json({
      text: resultText,
      image: resultImage
    });
  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
