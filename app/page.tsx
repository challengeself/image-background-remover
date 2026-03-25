"use client";

import { useState, useRef, useEffect } from "react";

export default function Home() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 组件卸载时清理内存
  useEffect(() => {
    return () => {
      if (processedImage) {
        URL.revokeObjectURL(processedImage);
      }
    };
  }, [processedImage]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    // 验证文件类型
    if (!file.type.startsWith("image/")) {
      setError("请选择图片文件");
      return;
    }

    // 验证文件大小（最大 10MB）
    if (file.size > 10 * 1024 * 1024) {
      setError("图片大小不能超过 10MB");
      return;
    }

    setError(null);
    setProcessedImage(null);

    // 读取文件并显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.onerror = () => {
      setError("图片读取失败，请重试");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleRemoveBackground = async () => {
    if (!selectedImage) return;

    setLoading(true);
    setError(null);

    try {
      // 将 base64 转换为 Blob
      const response = await fetch(selectedImage);
      const blob = await response.blob();

      // 创建 FormData 发送到 API
      const formData = new FormData();
      formData.append("image_file", blob, "image.png");

      // 调用后端 API
      const apiResponse = await fetch("/api/remove-bg", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json();
        throw new Error(errorData.error || "处理失败");
      }

      // 获取处理后的图片
      const processedBlob = await apiResponse.blob();
      const processedUrl = URL.createObjectURL(processedBlob);
      setProcessedImage(processedUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "处理失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;

    const link = document.createElement("a");
    link.href = processedImage;
    link.download = "no-bg-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleReset = () => {
    // 释放内存
    if (processedImage) {
      URL.revokeObjectURL(processedImage);
    }
    setSelectedImage(null);
    setProcessedImage(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          🖼️ 去背景工具
        </h1>
        <p className="text-center text-gray-600 mb-8">
          上传图片，一键去除背景，纯内存处理安全快速
        </p>

        {/* 上传区域 */}
        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer bg-white"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <div className="text-gray-500">
            <svg
              className="mx-auto h-12 w-12 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mb-2">点击或拖拽上传图片</p>
            <p className="text-sm text-gray-400">支持 PNG, JPG, WEBP (最大 10MB)</p>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
            ❌ {error}
          </div>
        )}

        {/* 图片预览和处理 */}
        {selectedImage && (
          <div className="mt-8">
            <div className="grid md:grid-cols-2 gap-4">
              {/* 原图 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">原图</h3>
                <img
                  src={selectedImage}
                  alt="原图"
                  className="w-full h-64 object-contain rounded bg-gray-100"
                />
              </div>

              {/* 处理后 */}
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-2 text-gray-700">
                  去背后
                </h3>
                {processedImage ? (
                  <img
                    src={processedImage}
                    alt="去背后"
                    className="w-full h-64 object-contain rounded bg-gray-100"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23e5e5e5' fill-rule='evenodd'%3E%3Cpath d='M1 1h2v2H1V1zm18 0h2v2h-2V1zM1 18h2v2H1v-2zm18 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
                    }}
                  />
                ) : (
                  <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded">
                    {loading ? (
                      <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
                        <p className="text-gray-500">正在处理...</p>
                      </div>
                    ) : (
                      <p className="text-gray-400">点击处理按钮开始</p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="mt-6 flex gap-4 justify-center">
              {!processedImage ? (
                <button
                  onClick={handleRemoveBackground}
                  disabled={loading}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
                >
                  {loading ? "处理中..." : "✨ 去除背景"}
                </button>
              ) : (
                <>
                  <button
                    onClick={handleDownload}
                    className="px-6 py-3 bg-green-500 text-white rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  >
                    📥 下载图片
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 bg-gray-500 text-white rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                  >
                    🔄 重新上传
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* 说明 */}
        <div className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h2 className="font-semibold text-blue-800 mb-2">💡 使用说明</h2>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• 图片在内存中处理，不会保存到服务器</li>
            <li>• 使用 remove.bg API 进行背景去除</li>
            <li>• 支持 PNG, JPG, WEBP 格式</li>
            <li>• 单张图片最大 10MB</li>
          </ul>
        </div>
      </div>
    </main>
  );
}
