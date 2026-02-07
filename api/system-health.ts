import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const isLocal = process.env.VERCEL_ENV !== "production";

  const getHealthUrl = (baseUrl: string, fallback: string) => {
    const url = (baseUrl || fallback).replace(/\/$/, "");
    return url.endsWith("/health") ? url : `${url}/health`;
  };

  const services = [
    {
      name: "Auth Service",
      url: getHealthUrl(process.env.AUTH_SERVICE_URL!, "http://localhost:3001"),
    },
    {
      name: "User Service",
      url: getHealthUrl(process.env.USER_SERVICE_URL!, "http://localhost:3002"),
    },
    {
      name: "Academics Service",
      url: getHealthUrl(
        process.env.ACADEMICS_SERVICE_URL!,
        "http://localhost:3004",
      ),
    },
    {
      name: "Outpass Service",
      url: getHealthUrl(
        process.env.OUTPASS_SERVICE_URL!,
        "http://localhost:3003",
      ),
    },
    {
      name: "Files Service",
      url: getHealthUrl(
        process.env.FILES_SERVICE_URL!,
        "http://localhost:3005",
      ),
    },
    {
      name: "Mail Service",
      url: getHealthUrl(process.env.MAIL_SERVICE_URL!, "http://localhost:3006"),
    },
    {
      name: "Notification Service",
      url: getHealthUrl(
        process.env.NOTIFICATION_SERVICE_URL!,
        "http://localhost:3007",
      ),
    },
    {
      name: "Cron Service",
      url: getHealthUrl(process.env.CRON_SERVICE_URL!, "http://localhost:3008"),
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
