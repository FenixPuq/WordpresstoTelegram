import { NextResponse } from 'next/server';

interface WordPressPost {
  title?: string;
  excerpt?: string;
  content?: string;
  link?: string;
  image_url?: string;
  featured_image_url?: string;
  // Credenciales dinámicas
  bot_token?: string;
  chat_id?: string;
}

export async function POST(request: Request) {
  try {
    const post: WordPressPost = await request.json();
    
    // Usar credenciales del request o variables de entorno (fallback)
    const botToken = post.bot_token || process.env.BOT_TOKEN || '';
    const chatId = post.chat_id || process.env.CHAT_ID || '';
    
    if (!botToken || !chatId) {
      return NextResponse.json({
        success: false,
        error: 'Faltan credenciales. Envia bot_token y chat_id en el request.'
      }, { status: 400 });
    }
    
    if (!post.title) {
      return NextResponse.json({
        success: false,
        error: 'El post no tiene titulo'
      }, { status: 400 });
    }
    
    const title = post.title;
    const excerpt = post.excerpt || post.content?.substring(0, 200) || '';
    const link = post.link || '';
    const imageUrl = post.featured_image_url || post.image_url || '';
    
    let message = `<b>${escapeHtml(title)}</b>\n\n`;
    
    if (excerpt) {
      const cleanExcerpt = stripHtml(excerpt).substring(0, 300);
      message += `${cleanExcerpt}${cleanExcerpt.length >= 300 ? '...' : ''}\n\n`;
    }
    
    if (link) {
      message += `🔗 <a href="${link}">Leer mas...</a>`;
    }
    
    let sendResult;
    
    if (imageUrl) {
      sendResult = await sendPhotoToTelegram(botToken, chatId, imageUrl, message);
    } else {
      sendResult = await sendMessageToTelegram(botToken, chatId, message);
    }
    
    if (!sendResult.success) {
      return NextResponse.json({
        success: false,
        error: sendResult.error
      }, { status: 400 });
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post enviado a Telegram correctamente',
      result: sendResult.data,
    });
    
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Error al procesar el webhook'
    }, { status: 500 });
  }
}

async function sendMessageToTelegram(
  botToken: string,
  chatId: string,
  text: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text.substring(0, 4096),
          parse_mode: 'HTML',
          disable_web_page_preview: false,
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return { success: false, error: data.description || 'Error de Telegram' };
    }
    
    return { success: true, data };
  } catch {
    return { success: false, error: 'Error de conexion' };
  }
}

async function sendPhotoToTelegram(
  botToken: string,
  chatId: string,
  photoUrl: string,
  caption: string
): Promise<{ success: boolean; data?: unknown; error?: string }> {
  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendPhoto`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          photo: photoUrl,
          caption: caption.substring(0, 1024),
          parse_mode: 'HTML',
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      return await sendMessageToTelegram(botToken, chatId, caption);
    }
    
    return { success: true, data };
  } catch {
    return await sendMessageToTelegram(botToken, chatId, caption);
  }
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();
}
