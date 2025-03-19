import React from 'react';
import Head from 'next/head';
import ImageEditor from '../components/ImageEditor';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Voice Gemini Editor</title>
        <meta name="description" content="使用语音和 Gemini API 编辑图片" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="min-h-screen bg-gray-50">
        <div className="container mx-auto py-8">
          <ImageEditor />
        </div>
      </main>

      <footer className="bg-white border-t py-4">
        <div className="container mx-auto text-center text-gray-500 text-sm">
          Powered by Gemini API
        </div>
      </footer>
    </div>
  );
}
