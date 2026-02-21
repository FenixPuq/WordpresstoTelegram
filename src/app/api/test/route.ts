import { NextResponse } from 'next/server';
import { readConfig, isConfigured } from '@/lib/config-store';

// POST - Enviar mensaje de prueba a Telegram
export async function POST() {
  try {
    if (!isConfigured()) {
      return NextResponse.json(
        { success: false, error: 'Primero debe configurar el bot' },
        { status: 400 }
      );
    }
    
    const config = readConfig();
    const { botToken, chatId } = config;
    
    // Mensaje de prueba
    const testMessage = `
🤖 <b>Conexión Exitosa</b>

✅ Tu bot de Telegram está configurado correctamente.

📱 Este es un mensaje de prueba desde WordPress to Telegram.

⏰ Enviado: ${new Date().toLocaleString('es-ES', { 
      timeZone: 'America/Mexico_City',
      dateStyle: 'full',
      timeStyle: 'short'
    })}
    `.trim();
    
    // Enviar mensaje a Telegram
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: testMessage,
          parse_mode: 'HTML',
        }),
      }
    );
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Telegram API error:', data);
      return NextResponse.json(
        { 
          success: false, 
          error: data.description || 'Error al enviar mensaje a Telegram' 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: 'Mensaje de prueba enviado correctamente',
      result: data,
    });
  } catch (error) {
    console.error('Error testing connection:', error);
    return NextResponse.json(
      { success: false, error: 'Error de conexión con Telegram' },
      { status: 500 }
    );
  }
}
