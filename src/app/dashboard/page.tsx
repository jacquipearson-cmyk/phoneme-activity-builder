// src/app/dashboard/page.tsx
// -------------------------------------------------------------
// SERVER COMPONENT — fetches metrics + activities
// -------------------------------------------------------------

import { prisma } from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  // Fetch metrics
  const metrics = await prisma.appMetrics.findUnique({
    where: { id: 1 },
  });

  // Fetch activities + stats
  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    include: { stats: true },
  });

  return (
    <DashboardClient
      metrics={metrics}
      activities={activities}
    />
  );
}
