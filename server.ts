import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { INITIAL_STREAMS } from './src/data/initialStreams.ts';
import { Stream, ChatMessage, SituationType, FeaturedHeroConfig } from './src/types.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// In-memory persistent state (starts completely empty per user request)
let streams: Stream[] = [...INITIAL_STREAMS];
let chatMessages: Record<string, ChatMessage[]> = {};
let featuredHeroConfig: FeaturedHeroConfig | null = null;

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Routes
  app.get('/api/streams', (_req, res) => {
    res.json(streams);
  });

  app.get('/api/streams/:id', (req, res) => {
    const stream = streams.find((s) => s.id === req.params.id);
    if (!stream) {
      return res.status(404).json({ error: 'Diffusion non trouvée' });
    }
    res.json(stream);
  });

  app.post('/api/streams', (req, res) => {
    const newStream: Stream = {
      ...req.body,
      id: `stream-${Date.now()}`,
      viewers: Math.floor(Math.random() * 40) + 480, // ~500 visitors
      currentSituation: req.body.currentSituation || 'live',
      score: req.body.score || '0 - 0',
      minute: req.body.minute || "1'",
    };

    if (newStream.isFeatured) {
      streams.forEach((s) => (s.isFeatured = false));
    }

    streams.unshift(newStream);
    res.status(201).json(newStream);
  });

  app.put('/api/streams/:id', (req, res) => {
    const index = streams.findIndex((s) => s.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Diffusion non trouvée' });
    }

    if (req.body.isFeatured) {
      streams.forEach((s) => (s.isFeatured = false));
    }

    streams[index] = { ...streams[index], ...req.body };
    res.json(streams[index]);
  });

  app.delete('/api/streams/:id', (req, res) => {
    const initialLen = streams.length;
    streams = streams.filter((s) => s.id !== req.params.id);
    if (streams.length === initialLen) {
      return res.status(404).json({ error: 'Diffusion non trouvée' });
    }
    res.json({ success: true, id: req.params.id });
  });

  app.post('/api/streams/:id/situation', (req, res) => {
    const stream = streams.find((s) => s.id === req.params.id);
    if (!stream) {
      return res.status(404).json({ error: 'Diffusion non trouvée' });
    }
    const { situation, customOverlay } = req.body;
    stream.currentSituation = situation as SituationType;
    if (customOverlay) {
      stream.customOverlay = customOverlay;
    }
    res.json(stream);
  });

  // Featured Hero Config API
  app.get('/api/featured', (_req, res) => {
    res.json(featuredHeroConfig || {});
  });

  app.post('/api/featured', (req, res) => {
    featuredHeroConfig = req.body;
    res.json(featuredHeroConfig);
  });

  // Chat API
  app.get('/api/chat/:streamId', (req, res) => {
    const list = chatMessages[req.params.streamId] || [];
    res.json(list);
  });

  app.post('/api/chat/:streamId', (req, res) => {
    const { streamId } = req.params;
    const { sender, text, isAdmin, avatarColor } = req.body;
    if (!text || !sender) {
      return res.status(400).json({ error: 'Pseudo et message requis' });
    }

    const newMessage: ChatMessage = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      streamId,
      sender: sender.trim().substring(0, 24),
      text: text.trim().substring(0, 300),
      timestamp: 'À l\'instant',
      isAdmin: Boolean(isAdmin),
      avatarColor: avatarColor || (isAdmin ? '#00FF87' : '#3B82F6'),
    };

    if (!chatMessages[streamId]) {
      chatMessages[streamId] = [];
    }

    chatMessages[streamId].push(newMessage);
    if (chatMessages[streamId].length > 100) {
      chatMessages[streamId].shift();
    }

    res.status(201).json(newMessage);
  });

  app.delete('/api/chat/:streamId/:messageId', (req, res) => {
    const { streamId, messageId } = req.params;
    if (chatMessages[streamId]) {
      chatMessages[streamId] = chatMessages[streamId].filter((m) => m.id !== messageId);
    }
    res.json({ success: true });
  });

  // Proxy endpoint to load external web stream pages inside iframe safely
  app.get('/api/proxy', async (req, res) => {
    const targetUrl = req.query.url as string;
    if (!targetUrl) {
      return res.status(400).send('Paramètre url requis');
    }

    try {
      const parsed = new URL(targetUrl);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(parsed.toString(), {
        signal: controller.signal,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7',
        },
      });

      clearTimeout(timeout);
      let html = await response.text();

      // Resolve final URL if redirected
      const finalUrl = new URL(response.url || targetUrl);

      // Base tag so static images, css, and scripts resolve to the origin domain
      const baseTag = `<base href="${finalUrl.origin}${finalUrl.pathname}">`;

      // Clean guardian script: suppresses popup loops and keeps targets inside iframe
      const guardianScript = `
        <script>
          (function() {
            try {
              window.open = function() { return null; };
              window.alert = function() { return null; };
              window.confirm = function() { return true; };
            } catch(e) {}

            document.addEventListener('click', function(e) {
              try {
                var a = e.target.closest('a');
                if (a && a.getAttribute('target') === '_blank') {
                  a.setAttribute('target', '_self');
                }
              } catch(err) {}
            }, false);

            try {
              var oldPushState = history.pushState;
              if (oldPushState) {
                history.pushState = function() {
                  oldPushState.apply(this, arguments);
                  try {
                    window.parent.postMessage({ type: 'NOVAFOOT_NAVIGATED', url: window.location.href }, '*');
                  } catch(e) {}
                };
              }
            } catch(e) {}
          })();
        </script>
      `;

      // Inject base tag and guardian script
      if (html.includes('<head>')) {
        html = html.replace('<head>', `<head>${baseTag}${guardianScript}`);
      } else if (html.includes('<head ')) {
        html = html.replace(/<head[^>]*>/, `$&${baseTag}${guardianScript}`);
      } else {
        html = `${baseTag}${guardianScript}${html}`;
      }

      // Strip headers that block framing or trigger CORS crashes
      res.removeHeader('X-Frame-Options');
      res.removeHeader('Content-Security-Policy');
      res.removeHeader('Cross-Origin-Embedder-Policy');
      res.removeHeader('Cross-Origin-Opener-Policy');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(html);
    } catch (err: any) {
      res.status(502).send(
        `<html><body style="background:#0a0f0d;color:#e6ece8;font-family:sans-serif;padding:24px;text-align:center;">
          <h2 style="color:#00ff87;">Navigation sécurisée NovaFoot</h2>
          <p>Le site distant (${targetUrl}) a mis trop de temps à répondre ou requiert une vérification Cloudflare directe.</p>
          <p style="opacity:0.8;font-size:14px;">Vous pouvez ouvrir le site dans votre navigateur pour récupérer le lien direct du lecteur, ou utiliser le partage d'écran staff.</p>
        </body></html>`
      );
    }
  });

  // Mount Vite or static dist
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NovaFoot server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start NovaFoot server:', err);
});
