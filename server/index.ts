import express, { type Request, Response, NextFunction } from "express";
import { createServer as createNetServer } from "net";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const checkPort = (port: number): Promise<boolean> => {
    return new Promise(resolve => {
      const tester = createNetServer()
        .once('error', () => resolve(false))
        .once('listening', () => {
          tester.close(() => resolve(true));
        })
        .listen(port);
    });
  };

  const findAvailablePort = async (ports: number[]): Promise<number> => {
    for (const port of ports) {
      if (await checkPort(port)) return port;
      log(`Port ${port} unavailable...`);
    }
    throw new Error('No available ports found');
  };

  (async () => {
    try {
      const port = await findAvailablePort([
        Number(process.env.PORT) || 5000,
        3000, 4000, 8000, 8080
      ]);
      
      server.listen(port, () => {
        log(`Server successfully started on port ${port}`);
        log(`Access the server at http://localhost:${port}`);
      }).on('error', err => {
        log(`Fatal server error: ${err.message}`);
        process.exit(1);
      });
    } catch (err: unknown) {
      log('Could not start server:');
      if (err instanceof Error) {
        log(err.message);
      } else {
        log('Unknown error occurred');
      }
      log('Possible solutions:');
      log('1. Check your network/firewall settings');
      log('2. Try running as administrator');
      log('3. Contact your network administrator');
      process.exit(1);
    }
  })();
})();
