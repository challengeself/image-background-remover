import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // 获取上传的图片
    const formData = await request.formData();
    const imageFile = formData.get("image") as File | null;

    if (!imageFile) {
      return NextResponse.json(
        { error: "请上传图片文件" },
        { status: 400 }
      );
    }

    // 验证文件类型
    if (!imageFile.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "只能上传图片文件" },
        { status: 400 }
      );
    }

    // 验证文件大小（最大 10MB）
    if (imageFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "图片大小不能超过 10MB" },
        { status: 400 }
      );
    }

    // 检查 API Key
    const apiKey = process.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "服务器未配置 remove.bg API Key" },
        { status: 500 }
      );
    }

    // 将 File 转换为 ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 调用 remove.bg API
    const removeBgResponse = await fetch("https://api.remove.bg/v1.0/removebg", {
      method: "POST",
      headers: {
        "X-Api-Key": apiKey,
      },
      body: buffer,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      let errorMessage = "处理失败";

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.errors?.[0]?.title || errorJson.errors?.[0]?.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return NextResponse.json(
        { error: errorMessage },
        { status: removeBgResponse.status }
      );
    }

    // 获取处理后的图片（纯内存处理）
    const processedBuffer = await removeBgResponse.arrayBuffer();
    const processedImage = Buffer.from(processedBuffer);

    // 直接返回图片，不保存到磁盘
    return new NextResponse(processedImage, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": 'attachment; filename="no-bg-image.png"',
      },
    });
  } catch (error) {
    console.error("处理图片失败:", error);
    return NextResponse.json(
      { error: "服务器内部错误，请稍后重试" },
      { status: 500 }
    );
  }
}
