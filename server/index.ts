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

// Mock GPS data for demonstration purposes
const mockGpsData = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-122.4194, 37.7749], // San Francisco start
          [-122.4180, 37.7750],
          [-122.4170, 37.7755],
          [-122.4160, 37.7760],
          [-122.4150, 37.7765],
          [-122.4140, 37.7770],
          [-122.4130, 37.7775],
          [-122.4120, 37.7780],
          [-122.4110, 37.7785],
          [-122.4100, 37.7790]  // End point
        ]
      },
      properties: {
        device_id: "car01",
        timestamps: [
          "2025-01-13T13:00:00Z",
          "2025-01-13T13:01:00Z",
          "2025-01-13T13:02:00Z",
          "2025-01-13T13:03:00Z",
          "2025-01-13T13:04:00Z",
          "2025-01-13T13:05:00Z",
          "2025-01-13T13:06:00Z",
          "2025-01-13T13:07:00Z",
          "2025-01-13T13:08:00Z",
          "2025-01-13T13:09:00Z"
        ]
      }
    }
  ]
};

// API proxy endpoint with fallback to mock data
app.get('/api/track', async (req: Request, res: Response) => {
  const fastApiBase = req.headers['x-fastapi-base'] as string || process.env.FASTAPI_BASE || 'http://3.7.100.109:55575';
  
  // Check if this is a request for mock data
  if (fastApiBase.includes('mock') || fastApiBase.includes('demo')) {
    log(`Serving mock GPS data`);
    res.set({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json'
    });
    res.json(mockGpsData);
    return;
  }
  
  try {
    const queryParams = new URLSearchParams(req.query as Record<string, string>);
    const url = `${fastApiBase}/gps/track?${queryParams.toString()}`;
    
    log(`Proxying request to: ${url}`);
    
    const response = await fetch(url, { 
      signal: AbortSignal.timeout(5000) // 5 second timeout
    });
    
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
    log(`Proxy error: ${error}. Falling back to mock data.`);
    
    // Fallback to mock data when external API is unavailable
    res.set({
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json',
      'X-Data-Source': 'mock'
    });
    
    res.json(mockGpsData);
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
