export async function POST(req: Request) {
  const { messages, sessionId } = await req.json();

  // 最新のメッセージを取得
  const lastMessage = messages[messages.length - 1];
  
  try {
    const endpointUrl = process.env.GPT_ENDPOINT_URL || 'https://eda9c067bd30.ngrok-free.app/predict';
    console.log('Sending request to:', endpointUrl);
    console.log('Request body:', { message: lastMessage.content, session_id: sessionId });
    
    const response = await fetch(endpointUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: lastMessage.content,
        session_id: sessionId
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || data.message || 'レスポンスを取得できませんでした。'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('API Error:', error);
    return new Response(
      JSON.stringify({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'エラーが発生しました。もう一度お試しください。'
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}