"use client";

import { useAccessibility } from "@/context/AccessibilityContext";

export default function DashboardClient({
  metrics,
  activities,
}: {
  metrics: any;
  activities: any[];
}) {
  const { font, colourScheme, darkMode } = useAccessibility();

  
  // -------------------------------------------------------------
  // Health check logic
  // -------------------------------------------------------------
  const systemHealthy = metrics !== null;




  // -------------------------------------------------------------
  // Most-used activity type
  // -------------------------------------------------------------
  let mostUsedType = "N/A";
  if (activities.length > 0) {
    const usage = activities.reduce((acc: any, a: any) => {
      const views = a.stats?.totalViews ?? 0;
      acc[a.type] = (acc[a.type] ?? 0) + views;
      return acc;
    }, {});
    mostUsedType = Object.entries(usage).sort((a: any, b: any) => b[1] - a[1])[0][0];
  }



  // -------------------------------------------------------------
  // Global average time on page
  // -------------------------------------------------------------
  const totalViews = activities.reduce(
    (sum: number, a: any) => sum + (a.stats?.totalViews ?? 0),
    0
  );

  const totalTime = activities.reduce(
    (sum: number, a: any) => sum + (a.stats?.totalTimeOnPageMs ?? 0),
    0
  );

  const globalAvgTime = totalViews > 0 ? Math.round(totalTime / totalViews) : 0;

  // -------------------------------------------------------------
  // Global success / fail totals
  // -------------------------------------------------------------
  const globalSuccess = activities.reduce(
    (sum: number, a: any) => sum + (a.stats?.successfulGenerations ?? 0),
    0
  );

  const globalFail = activities.reduce(
    (sum: number, a: any) => sum + (a.stats?.failedGenerations ?? 0),
    0
  );



  // -------------------------------------------------------------
  // Darkmode stuff
  // -------------------------------------------------------------
  const cardStyle = `
    p-4 rounded-md shadow transition-colors
    ${darkMode ? "bg-gray-800 text-gray-100" : "bg-gray-100 text-gray-900"}
  `;

  const tableBorder = darkMode ? "border-gray-700" : "border-gray-300";

  return (
    <main
      className={`
        min-h-screen p-6 space-y-8 transition-colors
        ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}
        ${font === "Arial" ? "font-sans" : ""}
        ${font === "Comic Sans MS" ? "font-comic" : ""}
      `}
    >
      <h1 className="text-4xl font-bold">Dashboard</h1>

      {/* Health Status */}
      <div
        className={`
          p-4 rounded-md text-white transition-colors
          ${
            systemHealthy
              ? darkMode ? "bg-green-500" : "bg-green-500"
              : darkMode ? "bg-red-700" : "bg-red-600"
          }
        `}
      >
        <h2 className="text-xl font-semibold">System Health</h2>
        <p>{systemHealthy ? "Healthy" : "Unhealthy"}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className={cardStyle}>
          <h3 className="font-semibold">Total Activities</h3>
          <p className="text-2xl">{metrics?.totalActivities ?? 0}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Wordle Activities</h3>
          <p className="text-2xl">{metrics?.totalWordleActivities ?? 0}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Word Search Activities</h3>
          <p className="text-2xl">{metrics?.totalWordSearchActivities ?? 0}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Total Generated Outputs</h3>
          <p className="text-2xl">{metrics?.totalGeneratedOutputs ?? 0}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Most Used Activity Type</h3>
          <p className="text-2xl">{mostUsedType}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Global Avg Time on Page (ms)</h3>
          <p className="text-2xl">{globalAvgTime}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Total Successful Generations</h3>
          <p className="text-2xl">{globalSuccess}</p>
        </div>

        <div className={cardStyle}>
          <h3 className="font-semibold">Total Failed Generations</h3>
          <p className="text-2xl">{globalFail}</p>
        </div>
      </div>

      {/* Activity Table */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Activity Details</h2>

        <div className="overflow-x-auto">
          <table
            className={`min-w-full border ${tableBorder} transition-colors ${
              darkMode ? "bg-gray-900 text-gray-100" : "bg-white text-gray-900"
            }`}
          >
            <thead className={`${darkMode ? "bg-gray-700" : "bg-gray-200"}`}>
              <tr>
                <th className={`p-2 border ${tableBorder}`}>Title</th>
                <th className={`p-2 border ${tableBorder}`}>Type</th>
                <th className={`p-2 border ${tableBorder}`}>Difficulty</th>
                <th className={`p-2 border ${tableBorder}`}>Views</th>
                <th className={`p-2 border ${tableBorder}`}>Success</th>
                <th className={`p-2 border ${tableBorder}`}>Failed</th>
                <th className={`p-2 border ${tableBorder}`}>Avg Time (ms)</th>
                <th className={`p-2 border ${tableBorder}`}>Status</th>
              </tr>
            </thead>

            <tbody>
              {activities.map((a: any) => {
                const s = a.stats;

                const avgTime =
                  s && s.totalViews > 0
                    ? Math.round(s.totalTimeOnPageMs / s.totalViews)
                    : 0;

                const hasErrors = s && s.failedGenerations > 0;

                return (
                  <tr key={a.id} className={`border-t ${tableBorder}`}>
                    <td className={`p-2 border ${tableBorder}`}>{a.title}</td>
                    <td className={`p-2 border ${tableBorder}`}>{a.type}</td>
                    <td className={`p-2 border ${tableBorder}`}>{a.difficulty}</td>
                    <td className={`p-2 border ${tableBorder}`}>{s?.totalViews ?? 0}</td>
                    <td className={`p-2 border ${tableBorder}`}>{s?.successfulGenerations ?? 0}</td>
                    <td className={`p-2 border ${tableBorder}`}>{s?.failedGenerations ?? 0}</td>
                    <td className={`p-2 border ${tableBorder}`}>{avgTime}</td>

                    <td className={`p-2 border ${tableBorder}`}>
                      {hasErrors ? (
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            darkMode ? "bg-red-600" : "bg-red-500"
                          }`}
                        >
                          Warning
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-1 rounded text-white ${
                            darkMode ? "bg-green-600" : "bg-green-500"
                          }`}
                        >
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
    </main>
  );
}
