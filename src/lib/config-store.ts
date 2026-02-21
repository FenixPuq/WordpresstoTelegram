import { NextResponse } from 'next/server';
import { readConfig, maskToken, getHistory, isConfigured } from '@/lib/config-store';

// Detectar si estamos en producción
function isProduction(): boolean {
  return process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
}

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
      isProduction: isProduction(),
      isConfigured: isConfigured(),
    });
  } catch (error) {
    console.error('Error getting config:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuración' },
      { status: 500 }
    );
  }
}

// POST - Guardar configuración (solo en desarrollo)
export async function POST(request: Request) {
  try {
    // En producción, no se puede guardar
    if (isProduction()) {
      return NextResponse.json({
        success: false,
        error: 'En producción, debes configurar las variables de entorno BOT_TOKEN y CHAT_ID en Vercel',
        isProduction: true,
      }, { status: 400 });
    }

    const body = await request.json();
    const { botToken, chatId } = body;

    // Validar datos
    if (!botToken || !chatId) {
      return NextResponse.json(
        { success: false, error: 'Token y Chat ID son requeridos' },
        { status: 400 }
      );
    }

    // Validar formato del token
    const tokenRegex = /^\d+:[A-Za-z0-9_-]+$/;
    if (!tokenRegex.test(botToken)) {
      return NextResponse.json(
        { success: false, error: 'Formato de token inválido. Debe ser como: 123456789:ABCdef...' },
        { status: 400 }
      );
    }

    const { writeConfig } = await import('@/lib/config-store');
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
