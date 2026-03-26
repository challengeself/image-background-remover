export async function POST(request: Request, env: Env) {
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

    // 从 Cloudflare 环境变量读取 API Key
    const apiKey = env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      console.error("API Key not found in environment variables. Available env keys:", Object.keys(env || {}));
      return Response.json({ error: "服务器未配置 remove.bg API Key" }, { status: 500 });
    }

    console.log("Using API Key:", apiKey.substring(0, 8) + "...");
    
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
      console.error("remove.bg API error:", errorText);
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
