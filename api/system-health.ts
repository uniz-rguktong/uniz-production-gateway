import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isLocal = process.env.VERCEL_ENV !== "production";

  const services = [
    {
      name: "Auth Service",
      url: process.env.AUTH_SERVICE_URL || "http://localhost:3001/health",
    },
    {
      name: "User Service",
      url: process.env.USER_SERVICE_URL || "http://localhost:3002/health",
    },
    {
      name: "Academics Service",
      url: process.env.ACADEMICS_SERVICE_URL || "http://localhost:3004/health",
    },
    {
      name: "Outpass Service",
      url: process.env.OUTPASS_SERVICE_URL || "http://localhost:3003/health",
    },
    {
      name: "Files Service",
      url: process.env.FILES_SERVICE_URL || "http://localhost:3005/health",
    },
    {
      name: "Mail Service",
      url: process.env.MAIL_SERVICE_URL || "http://localhost:3006/health",
    },
    {
      name: "Notification Service",
      url:
        process.env.NOTIFICATION_SERVICE_URL || "http://localhost:3007/health",
    },
    {
      name: "Cron Service",
      url: process.env.CRON_SERVICE_URL || "http://localhost:3008/health",
    },
  ];

  const results = await Promise.all(
    services.map(async (service) => {
      try {
        const response = await fetch(service.url, { method: "GET" });
        if (!response.ok) {
          console.warn(
            `Health check failed for ${service.name} at ${service.url}: ${response.status}`,
          );
        }
        return {
          name: service.name,
          status: response.ok ? "healthy" : "unhealthy",
          statusCode: response.status,
          url: service.url, // Temporary debug: include URL in response
        };
      } catch (error) {
        return {
          name: service.name,
          status: "unreachable",
          error: (error as Error).message,
          url: service.url,
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
