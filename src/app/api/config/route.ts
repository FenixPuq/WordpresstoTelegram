import { NextResponse } from 'next/server';
import { readConfig, writeConfig, maskToken, getHistory } from '@/lib/config-store';

// GET - Obtener configuración (sin mostrar token completo)
export async function GET() {
  try {
    const config = readConfig();
    const history = getHistory(5);
    
    return NextResponse.json({
      success: true,
      config: {
        botToken: maskToken(config.botToken),
        chatId: config.chatId,
        hasToken: !!config.botToken,
      },
      history,
    });
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

// POST - Guardar configuración
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { botToken, chatId } = body;
    
    // Validar datos
    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Token y Chat ID son requeridos' },
        { status: 400 }
      );
    }
    
    // Validar formato del token (formato típico: 123456789:ABCdefGHIjklMNOpqrSTUvwxYZ)
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(botToken)) {
      return NextResponse.json(
        { success: false, error: 'Formato de token inválido' },
        { status: 400 }
      );
    }
    
    // Guardar configuración
    const config = writeConfig({ botToken, chatId });
    
    return NextResponse.json({
      success: true,
      message: 'Configuración guardada correctamente',
      config: {
        botToken: maskToken(config.botToken),
        chatId: config.chatId,
      },
    });
  } catch (error) {
    console.error('Error saving config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al guardar configuración' },
      { status: 500 }
    );
  }
}
