import { NextResponse } from 'next/server';
import { readConfig, isConfigured, addToHistory, getHistory } from '@/lib/config-store';

interface WordPressPost {
  id?: number;
  title?: string;
  excerpt?: string;
  content?: string;
  link?: string;
  featured_image_url?: string;
  image_url?: string;
  date?: string;
  author?: string;
  categories?: string[];
}

// POST - Recibir post de WordPress y enviar a Telegram
export async function POST(request: Request) {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Bot no configurado' },
        { status: 400 }
      );
    }
    
    const config = readConfig();
    const { botToken, chatId } = config;
    
    // Parsear el post recibido
    const post: WordPressPost = await request.json();
    
    console.log('Received post:', JSON.stringify(post, null, 2));
    
    // Validar que tengamos datos mínimos
    if (!post.title) {
      return NextResponse.json(
        { success: false, error: 'El post no tiene título' },
        { status: 400 }
      );
    }
    
    const title = post.title;
    const excerpt = post.excerpt || post.content?.substring(0, 200) || '';
    const link = post.link || '';
    const imageUrl = post.featured_image_url || post.image_url || '';
    
    // Crear mensaje para Telegram (limitado a 4096 caracteres)
    let message = `<b>${escapeHtml(title)}</b>\n\n`;
    
    if (excerpt) {
      // Limitar extracto para no exceder límites
      const cleanExcerpt = stripHtml(excerpt).substring(0, 300);
      message += `${cleanExcerpt}${cleanExcerpt.length >= 300 ? '...' : ''}\n\n`;
    }
    
    if (link) {
      message += `🔗 <a href="${link}">Leer más...</a>`;
    }
    
    let sendResult;
    
    // Si hay imagen, enviar con foto
    if (imageUrl) {
      sendResult = await sendPhotoToTelegram(botToken, chatId, imageUrl, message);
    } else {
      // Enviar solo texto
      sendResult = await sendMessageToTelegram(botToken, chatId, message);
    }
    
    // Agregar al historial
    addToHistory({
      title,
      excerpt: excerpt.substring(0, 100),
      link,
      imageUrl,
      success: sendResult.success,
    });
    
    if (!sendResult.success) {
      return NextResponse.json(
        { success: false, error: sendResult.error },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Post enviado a Telegram correctamente',
      result: sendResult.data,
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { success: false, error: 'Error al procesar el webhook' },
      { status: 500 }
    );
  }
}

// GET - Obtener historial de posts
export async function GET() {
  try {
    const history = getHistory(10);
    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    console.error('Error getting history:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener historial' },
      { status: 500 }
    );
  }
}

// Función para enviar mensaje de texto a Telegram
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
          text: text.substring(0, 4096), // Límite de Telegram
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
  } catch (error) {
    return { success: false, error: 'Error de conexión' };
  }
}

// Función para enviar foto a Telegram
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
          caption: caption.substring(0, 1024), // Límite para captions
          parse_mode: 'HTML',
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      // Si falla la foto, intentar enviar solo texto
      console.log('Photo failed, sending text only:', data.description);
      return await sendMessageToTelegram(botToken, chatId, caption);
    }
    
    return { success: true, data };
  } catch (error) {
    // Si falla, intentar enviar solo texto
    return await sendMessageToTelegram(botToken, chatId, caption);
  }
}

// Escapar caracteres HTML para Telegram
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Eliminar tags HTML
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
