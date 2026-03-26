import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get("image_file") as File | null;

    if (!imageFile) {
      return Response.json({ error: "请上传图片文件" }, { status: 400 });
    }

    if (!imageFile.type.startsWith("image/")) {
      return Response.json({ error: "只能上传图片文件" }, { status: 400 });
    }

    if (imageFile.size > 10 * 1024 * 1024) {
      return Response.json({ error: "图片大小不能超过 10MB" }, { status: 400 });
    }

    const apiKey = "c9XDtC2guWHRyYgUioseUqPk"; // 硬编码 API key，避免环境变量问题
    
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = arrayBuffer;

    const apiFormData = new FormData();
    apiFormData.append("image_file", new Blob([buffer]), "image.png");
    
    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: apiFormData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      return Response.json({ error: errorText }, { status: removeBgResponse.status });
    }

    const processedBuffer = await removeBgResponse.arrayBuffer();
    
    return new Response(processedBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-bg-image.png"',
      },
    });
  } catch (error) {
    console.error("处理图片失败:", error);
    return Response.json({ error: "服务器内部错误，请稍后重试" }, { status: 500 });
  }
}
