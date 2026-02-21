'use client';

import { useState, useEffect } from 'react';
import { 
  Send, 
  CheckCircle2, 
  XCircle, 
  Copy, 
  ExternalLink, 
  Bot, 
  MessageSquare, 
  Settings, 
  BookOpen,
  Clock,
  Link2,
  RefreshCw,
  Eye,
  EyeOff,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface Config {
  botToken: string;
  chatId: string;
  hasToken: boolean;
}

interface PostHistory {
  id: string;
  title: string;
  excerpt: string;
  link: string;
  imageUrl?: string;
  sentAt: string;
  success: boolean;
}

export default function Home() {
  const { toast } = useToast();
  const [botToken, setBotToken] = useState('');
  const [chatId, setChatId] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [history, setHistory] = useState<PostHistory[]>([]);
  const [webhookUrl, setWebhookUrl] = useState('');

  // Cargar configuración al iniciar
  useEffect(() => {
    loadConfig();
    // Generar URL del webhook
    if (typeof window !== 'undefined') {
      setWebhookUrl(`${window.location.origin}/api/webhook`);
    }
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/config');
      const data = await response.json();
      
      if (data.success) {
        setChatId(data.config.chatId || '');
        setIsConfigured(data.config.hasToken);
        if (data.history) {
          setHistory(data.history);
        }
      }
    } catch {
      toast({
        title: 'Error',
        description: 'No se pudo cargar la configuración',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async () => {
    if (!botToken || !chatId) {
      toast({
        title: 'Error',
        description: 'Por favor complete todos los campos',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsSaving(true);
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ botToken, chatId }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Guardado',
          description: 'Configuración guardada correctamente',
        });
        setIsConfigured(true);
        setBotToken(''); // Limpiar el token por seguridad
        loadConfig();
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al guardar',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      const response = await fetch('/api/test', {
        method: 'POST',
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Éxito',
          description: 'Mensaje de prueba enviado a Telegram',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Error al enviar mensaje',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Error',
        description: 'Error de conexión',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copiado',
      description: 'URL copiada al portapapeles',
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Send className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">WordPress to Telegram</h1>
              <p className="text-xs text-slate-400">Automatiza tus publicaciones</p>
            </div>
          </div>
          {isConfigured && (
            <Badge variant="default" className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
              <CheckCircle2 className="w-3 h-3 mr-1" />
              Conectado
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Grid principal */}
        <div className="grid lg:grid-cols-2 gap-6">
          
          {/* Sección de Configuración */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-400" />
                <CardTitle className="text-white">Configuración del Bot</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Ingresa las credenciales de tu bot de Telegram
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="botToken" className="text-slate-300 flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  Token del Bot
                </Label>
                <div className="relative">
                  <Input
                    id="botToken"
                    type={showToken ? 'text' : 'password'}
                    placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                    className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500 pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-9 w-9 text-slate-400 hover:text-white"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  Obtén tu token desde @BotFather en Telegram
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="chatId" className="text-slate-300 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4" />
                  Chat ID
                </Label>
                <Input
                  id="chatId"
                  type="text"
                  placeholder="-1001234567890 o @channelname"
                  value={chatId}
                  onChange={(e) => setChatId(e.target.value)}
                  className="bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                />
                <p className="text-xs text-slate-500">
                  ID del canal o grupo donde se publicarán los posts
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button 
                  onClick={handleSaveConfig}
                  disabled={isSaving}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white"
                >
                  {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Guardar Configuración
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={!isConfigured || isTesting}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  {isTesting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Sección de Webhook */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Link2 className="w-5 h-5 text-cyan-400" />
                <CardTitle className="text-white">URL del Webhook</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Configura esta URL en tu WordPress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700">
                <div className="flex items-center justify-between gap-2">
                  <code className="text-sm text-cyan-400 break-all">
                    {webhookUrl || 'https://tu-dominio.com/api/webhook'}
                  </code>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(webhookUrl)}
                    className="text-slate-400 hover:text-white shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <Alert className="bg-blue-500/10 border-blue-500/30">
                <AlertTitle className="text-blue-400 text-sm">Importante</AlertTitle>
                <AlertDescription className="text-slate-400 text-xs">
                  Esta URL recibirá los datos de cada nuevo post de WordPress.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>

        {/* Sección de Instrucciones */}
        <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-purple-400" />
              <CardTitle className="text-white">Guía de Configuración</CardTitle>
            </div>
            <CardDescription className="text-slate-400">
              Sigue estos pasos para configurar tu integración
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Paso 1 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                    <span className="text-blue-400 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Crear un Bot</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Abre Telegram y busca <span className="text-cyan-400">@BotFather</span>. 
                      Envía <code className="bg-slate-700 px-1 rounded">/newbot</code> y sigue las instrucciones.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 2 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                    <span className="text-cyan-400 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Obtener Chat ID</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Para grupos: añade a <span className="text-cyan-400">@userinfobot</span> y reenvía un mensaje.
                      Para canales: usa <code className="bg-slate-700 px-1 rounded">@channelname</code> o el ID numérico.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 3 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
                    <span className="text-purple-400 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Añadir Bot al Canal</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Ve a tu canal → Administradores → Añadir administrador. 
                      Busca tu bot y agrégalo como administrador.
                    </p>
                  </div>
                </div>
              </div>

              {/* Paso 4 */}
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-emerald-400 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="text-white font-medium">Configurar WordPress</h4>
                    <p className="text-slate-400 text-sm mt-1">
                      Usa un plugin como <span className="text-cyan-400">WP Webhooks</span> o añade el código PHP 
                      en tu tema para enviar posts a la URL del webhook.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-6 bg-slate-700" />

            {/* Código PHP de ejemplo */}
            <div className="space-y-3">
              <h4 className="text-white font-medium flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Código PHP para WordPress
              </h4>
              <div className="bg-slate-900/70 rounded-lg p-4 border border-slate-700 overflow-x-auto">
                <pre className="text-xs text-slate-300 whitespace-pre-wrap">
{`// Añadir en functions.php de tu tema
add_action('publish_post', function($post_id) {
    $post = get_post($post_id);
    
    $data = array(
        'title' => $post->post_title,
        'excerpt' => wp_trim_words($post->post_content, 30),
        'link' => get_permalink($post_id),
        'image_url' => get_the_post_thumbnail_url($post_id, 'large')
    );
    
    wp_remote_post('TU_WEBHOOK_URL/api/webhook', array(
        'body' => json_encode($data),
        'headers' => array('Content-Type' => 'application/json')
    ));
});`}
                </pre>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sección de Estado e Historial */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Estado de conexión */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white text-lg">Estado</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                <span className="text-slate-300">
                  {isConfigured ? 'Bot configurado' : 'Sin configurar'}
                </span>
              </div>
              {isConfigured && chatId && (
                <div className="mt-4 text-sm text-slate-400">
                  <p>Chat ID: <span className="text-slate-300">{chatId}</span></p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimos posts */}
          <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white text-lg flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Historial de Posts
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={loadConfig}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-white"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500">
                  <Send className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No hay posts enviados aún</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                  {history.map((post) => (
                    <div
                      key={post.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-slate-900/50 border border-slate-700"
                    >
                      <div className={`mt-1 ${post.success ? 'text-emerald-400' : 'text-red-400'}`}>
                        {post.success ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{post.title}</p>
                        <p className="text-slate-500 text-xs mt-1">
                          {formatDate(post.sentAt)}
                        </p>
                      </div>
                      {post.link && (
                        <a
                          href={post.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-400 hover:text-cyan-400 shrink-0"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 mt-12">
        <div className="max-w-6xl mx-auto px-4 py-6 text-center text-slate-500 text-sm">
          WordPress to Telegram Integration • Powered by Next.js
        </div>
      </footer>
    </div>
  );
}
