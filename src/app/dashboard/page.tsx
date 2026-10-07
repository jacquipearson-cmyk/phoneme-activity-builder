// src/app/dashboard/page.tsx
// -------------------------------------------------------------
// Dashboard — data-driven observability + reporting
// -------------------------------------------------------------

import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  // -------------------------------------------------------------
  // Fetch global metrics + per-activity stats
  // -------------------------------------------------------------
  const metrics = await prisma.appMetrics.findUnique({
    where: { id: 1 },
  });

  const activities = await prisma.activity.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      stats: true,
    },
  });

  // -------------------------------------------------------------
  // Health check logic
  // -------------------------------------------------------------
  const systemHealthy = metrics !== null;

  // -------------------------------------------------------------
  // NEW METRIC: Most-used activity type
  // -------------------------------------------------------------
  let mostUsedType = "N/A";
  if (activities.length > 0) {
    const usage = activities.reduce((acc, a) => {
      const views = a.stats?.totalViews ?? 0;
      acc[a.type] = (acc[a.type] ?? 0) + views;
      return acc;
    }, {} as Record<string, number>);

    mostUsedType = Object.entries(usage).sort((a, b) => b[1] - a[1])[0][0];
  }

  // -------------------------------------------------------------
  // Global average time on page
  // -------------------------------------------------------------
  const totalViews = activities.reduce(
    (sum, a) => sum + (a.stats?.totalViews ?? 0),
    0
  );

  const totalTime = activities.reduce(
    (sum, a) => sum + (a.stats?.totalTimeOnPageMs ?? 0),
    0
  );

  const globalAvgTime =
    totalViews > 0 ? Math.round(totalTime / totalViews) : 0;

  // -------------------------------------------------------------
  // Global success / fail totals
  // -------------------------------------------------------------
  const globalSuccess = activities.reduce(
    (sum, a) => sum + (a.stats?.successfulGenerations ?? 0),
    0
  );

  const globalFail = activities.reduce(
    (sum, a) => sum + (a.stats?.failedGenerations ?? 0),
    0
  );

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      {/* ---------------------------------------------------------
         Health Status
      --------------------------------------------------------- */}
      <div
        className={`p-4 rounded-md text-white ${
          systemHealthy ? "bg-green-600" : "bg-red-600"
        }`}
      >
        <h2 className="text-xl font-semibold">System Health</h2>
        <p>{systemHealthy ? "Healthy" : "Unhealthy"}</p>
      </div>

      {/* ---------------------------------------------------------
         Summary Cards
      --------------------------------------------------------- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

        {/* Existing cards */}
        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Total Activities</h3>
          <p className="text-2xl">{metrics?.totalActivities ?? 0}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Wordle Activities</h3>
          <p className="text-2xl">{metrics?.totalWordleActivities ?? 0}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Word Search Activities</h3>
          <p className="text-2xl">{metrics?.totalWordSearchActivities ?? 0}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Total Generated Outputs</h3>
          <p className="text-2xl">{metrics?.totalGeneratedOutputs ?? 0}</p>
        </div>

        {/* ---------------------------------------------------------
           NEW CARDS
        --------------------------------------------------------- */}

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Most Used Activity Type</h3>
          <p className="text-2xl">{mostUsedType}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Global Avg Time on Page (ms)</h3>
          <p className="text-2xl">{globalAvgTime}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Total Successful Generations</h3>
          <p className="text-2xl">{globalSuccess}</p>
        </div>

        <div className="p-4 bg-gray-100 rounded-md shadow">
          <h3 className="font-semibold">Total Failed Generations</h3>
          <p className="text-2xl">{globalFail}</p>
        </div>
      </div>

      {/* ---------------------------------------------------------
         Activity Table
      --------------------------------------------------------- */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Activity Details</h2>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 bg-white">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">Title</th>
                <th className="p-2 border">Type</th>
                <th className="p-2 border">Difficulty</th>
                <th className="p-2 border">Views</th>
                <th className="p-2 border">Success</th>
                <th className="p-2 border">Failed</th>
                <th className="p-2 border">Avg Time (ms)</th>
                <th className="p-2 border">Status</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((a) => {
                const s = a.stats;

                const avgTime =
                  s && s.totalViews > 0
                    ? Math.round(s.totalTimeOnPageMs / s.totalViews)
                    : 0;

                const hasErrors = s && s.failedGenerations > 0;

                return (
                  <tr key={a.id} className="border-t">
                    <td className="p-2 border">{a.title}</td>
                    <td className="p-2 border">{a.type}</td>
                    <td className="p-2 border">{a.difficulty}</td>
                    <td className="p-2 border">{s?.totalViews ?? 0}</td>
                    <td className="p-2 border">{s?.successfulGenerations ?? 0}</td>
                    <td className="p-2 border">{s?.failedGenerations ?? 0}</td>
                    <td className="p-2 border">{avgTime}</td>

                    <td className="p-2 border">
                      {hasErrors ? (
                        <span className="px-2 py-1 bg-red-500 text-white rounded">
                          Warning
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-green-500 text-white rounded">
                          OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
