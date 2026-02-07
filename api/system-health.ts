import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isLocal = process.env.VERCEL_ENV !== "production";

  const services = [
    {
      name: "Auth Service",
      url: isLocal
        ? "http://localhost:3001/health"
        : "https://uniz-auth.vercel.app/health",
    },
    {
      name: "User Service",
      url: isLocal
        ? "http://localhost:3002/health"
        : "https://uniz-user-service-five.vercel.app/health",
    },
    {
      name: "Academics Service",
      url: isLocal
        ? "http://localhost:3004/health"
        : "https://uniz-academics-service-beryl.vercel.app/health",
    },
    {
      name: "Outpass Service",
      url: isLocal
        ? "http://localhost:3003/health"
        : "https://uniz-outpass-service-snowy.vercel.app/health",
    },
    {
      name: "Files Service",
      url: isLocal
        ? "http://localhost:3005/health"
        : "https://uniz-files-service-blush.vercel.app/health",
    },
    {
      name: "Mail Service",
      url: isLocal
        ? "http://localhost:3006/health"
        : "https://uniz-mail-service-phi.vercel.app/health",
    },
    {
      name: "Notification Service",
      url: isLocal
        ? "http://localhost:3007/health"
        : "https://uniz-notification-service-sandy.vercel.app/health",
    },
    {
      name: "Cron Service",
      url: isLocal
        ? "http://localhost:3008/health"
        : "https://uniz-cron-service-theta.vercel.app/health",
    },
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url, { method: "GET" });
        return {
          name: service.name,
          status: response.ok ? "healthy" : "unhealthy",
          statusCode: response.status,
        };
      } catch (error) {
        return {
          name: service.name,
          status: "unreachable",
          error: (error as Error).message,
        };
      }
    }),
  );

  const allHealthy = results.every((r) => r.status === "healthy");

  res.status(allHealthy ? 200 : 503).json({
    status: allHealthy ? "ok" : "degraded",
    timestamp: new Date().toISOString(),
    services: results,
    attribution: "SreeCharan",
  });
}
