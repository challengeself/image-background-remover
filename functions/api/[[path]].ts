export async function onRequestPost(context: any): Promise<Response> {
  const request = context.request;
  
  try {
    // 获取上传的图片
    const formData = await request.formData();
    const imageFile = formData.get('image_file') as File | null;

    console.log('收到文件:', {
      name: imageFile?.name,
      type: imageFile?.type,
      size: imageFile?.size,
      exists: !!imageFile,
    });

    if (!imageFile) {
      return new Response(
        JSON.stringify({ error: '请上传图片文件' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证文件类型
    if (!imageFile.type.startsWith('image/')) {
      return new Response(
        JSON.stringify({ error: '只能上传图片文件' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 验证文件大小（最大 10MB）
    if (imageFile.size > 10 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: '图片大小不能超过 10MB' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 检查 API Key
    const apiKey = context.env.REMOVE_BG_API_KEY;
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: '服务器未配置 remove.bg API Key' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // 将 File 转换为 ArrayBuffer
    const arrayBuffer = await imageFile.arrayBuffer();

    // 调用 remove.bg API
    const apiFormData = new FormData();
    apiFormData.append('image_file', new Blob([arrayBuffer]), 'image.png');

    const removeBgResponse = await fetch('https://api.remove.bg/v1.0/removebg', {
      method: 'POST',
      headers: {
        'X-Api-Key': apiKey,
      },
      body: apiFormData,
    });

    if (!removeBgResponse.ok) {
      const errorText = await removeBgResponse.text();
      let errorMessage = '处理失败';

      try {
        const errorJson = JSON.parse(errorText);
        errorMessage = errorJson.errors?.[0]?.title || errorJson.errors?.[0]?.detail || errorMessage;
      } catch {
        errorMessage = errorText || errorMessage;
      }

      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          status: removeBgResponse.status, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }

    // 获取处理后的图片（纯内存处理）
    const processedBuffer = await removeBgResponse.arrayBuffer();

    // 直接返回图片，不保存到磁盘
    return new Response(processedBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': 'attachment; filename="no-bg-image.png"',
      },
    });
  } catch (error) {
    console.error('处理图片失败:', error);
    return new Response(
      JSON.stringify({ error: '服务器内部错误，请稍后重试' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
