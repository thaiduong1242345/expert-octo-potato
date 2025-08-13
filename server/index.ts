import express, { type Request, Response, NextFunction } from "express";
import { setupVite, serveStatic, log } from "./vite";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// API proxy endpoint
app.get('/api/track', async (req: Request, res: Response) => {
  try {
    const fastApiBase = process.env.FASTAPI_BASE || 'http://3.7.100.109:55575';
    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const url = `${fastApiBase}/gps/track?${queryParams.toString()}`;
    
    log(`Proxying request to: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`FastAPI responded with ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Set cache control headers
    res.set({
      'Cache-Control': 'no-store',
      'Content-Type': response.headers.get('Content-Type') || 'application/json'
    });
    
    res.json(data);
  } catch (error) {
    log(`Proxy error: ${error}`);
    res.status(500).json({ 
      error: 'Failed to fetch tracking data',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(status).json({ message });
  throw err;
});

(async () => {
  // Setup Vite in development, serve static files in production
  if (app.get("env") === "development") {
    const { createServer } = await import("http");
    const server = createServer(app);
    await setupVite(app, server);
    
    // Use the requested port (3000) but fall back to 5000 for compatibility
    const port = parseInt(process.env.PORT || '3000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      log(`GPS Tracker server running on port ${port}`);
    });
  } else {
    serveStatic(app);
    const port = parseInt(process.env.PORT || '3000', 10);
    app.listen(port, "0.0.0.0", () => {
      log(`GPS Tracker server running on port ${port}`);
    });
  }
})();
