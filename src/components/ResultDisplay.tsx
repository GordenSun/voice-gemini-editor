import React from 'react';

interface ResultDisplayProps {
  originalImage: string | null;
  editedImage: string | null;
  description: string;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  originalImage, 
  editedImage, 
  description 
}) => {
  if (!editedImage) return null;

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">编辑结果</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {originalImage && (
          <div>
            <h3 className="text-lg font-medium mb-2">原始图片</h3>
            <img 
              src={originalImage} 
              alt="Original" 
              className="max-w-full h-auto rounded-lg shadow-md" 
            />
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-medium mb-2">编辑后图片</h3>
          <img 
            src={editedImage} 
            alt="Edited" 
            className="max-w-full h-auto rounded-lg shadow-md" 
          />
        </div>
      </div>
      
      {description && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-medium mb-2">Gemini 描述</h3>
          <p className="text-gray-700">{description}</p>
        </div>
      )}
    </div>
  );
};

export default ResultDisplay;
