"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  AlertCircle,
  TrendingDown,
  UserCheck,
  PieChart as PieChartIcon,
  CheckCircle,
  AlertTriangle,
  Download,
  Loader2,
} from "lucide-react";
import { useState } from "react";

type Props = {
  cardClass: string;
  shop: { shopName: string };
};

type ForecastData = {
  day: string;
  date: string;
  expectedCustomers: number;
  crowdLevel: "Low" | "Moderate" | "High" | "Very High";
  percentageChange: number;
};

type Employee = {
  id: string;
  name: string;
  position: string;
  availability: string[];
  currentLoad: number;
  skills: string[];
  phone: string; // <-- added
};

type TaskStatus = {
  status: "completed" | "pending";
  count: number;
  percentage: number;
  color: string; // e.g. "text-green-100"
  bgColor: string; // e.g. "bg-#6eff86"
  icon: React.ReactNode;
};

// ====== Exposed SMS config (as requested) ======
const HTTPSMS_API_KEY =
  "HIppOXq09XlgtOmn1aR1fTa1oRQJM0Edg8jdoAw0C1DaWCNCDp009Ql0OUXFz_Yg";
const DEFAULT_FROM_NUMBER = "+919653268068";

export default function CenterAnalytics({ cardClass, shop }: Props) {
  const [forecastPeriod, setForecastPeriod] = useState<"week" | "month">("week");

  // Track per-employee SMS send status
  const [smsStatus, setSmsStatus] = useState<Record<string, "idle" | "sending" | "sent" | "error">>({});

  // ---- Mock employees (with phones) ----
  const employees: Employee[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      position: "Senior Staff",
      availability: ["Monday", "Tuesday", "Friday", "Saturday", "Sunday"],
      currentLoad: 65,
      skills: ["Customer Service", "Inventory", "Cashier"],
      phone: "+919004004128",
    },
    {
      id: "2",
      name: "Mike Chen",
      position: "Staff",
      availability: ["Wednesday", "Thursday", "Friday", "Saturday"],
      currentLoad: 45,
      skills: ["Stocking", "Cleaning", "Cashier"],
      phone: "+919111111111",
    },
    {
      id: "3",
      name: "Emily Davis",
      position: "Senior Staff",
      availability: ["Monday", "Tuesday", "Thursday", "Sunday"],
      currentLoad: 70,
      skills: ["Customer Service", "Training", "Management"],
      phone: "+919222222222",
    },
    {
      id: "4",
      name: "Alex Rodriguez",
      position: "Staff",
      availability: ["Friday", "Saturday", "Sunday"],
      currentLoad: 30,
      skills: ["Cashier", "Customer Service"],
      phone: "+919333333333",
    },
    {
      id: "5",
      name: "Jessica Wang",
      position: "Part-time",
      availability: ["Saturday", "Sunday"],
      currentLoad: 20,
      skills: ["Cashier", "Stocking"],
      phone: "+919444444444",
    },
    {
      id: "6",
      name: "David Smith",
      position: "Staff",
      availability: ["Monday", "Tuesday", "Wednesday", "Saturday"],
      currentLoad: 55,
      skills: ["Inventory", "Cleaning"],
      phone: "+919555555555",
    },
    {
      id: "7",
      name: "Lisa Brown",
      position: "Part-time",
      availability: ["Friday", "Saturday"],
      currentLoad: 15,
      skills: ["Customer Service"],
      phone: "+919666666666",
    },
  ];

  // ---- Today's task status (2 slices) ----
  const todayTasks: TaskStatus[] = [
    {
      status: "completed",
      count: 42,
      percentage: 76, // 42/(42+13)
      color: "text-green-100",
      bgColor: "bg-#6eff86",
      icon: <CheckCircle className="text-green-200" />,
    },
    {
      status: "pending",
      count: 13,
      percentage: 24, // 13/(42+13)
      color: "text-blue-200",
      bgColor: "bg-#59f6ff",
      icon: <AlertTriangle className="text-sky-200" />,
    },
  ];

  const totalTasks = todayTasks.reduce((sum, task) => sum + task.count, 0);

  // ---- Financial stats (shown in PDF; keep in sync with any on-screen cards if you display them) ----
  const financialStats = [
    { metric: "Utilization", value: "78%" },
    { metric: "Avg Tasks/Staff", value: "25" },
    { metric: "Payroll / Rev", value: "32%" },
  ];

  // ---- Forecast data ----
  const weeklyForecast: ForecastData[] = [
    { day: "Monday", date: "Dec 9", expectedCustomers: 45, crowdLevel: "Low", percentageChange: -5 },
    { day: "Tuesday", date: "Dec 10", expectedCustomers: 68, crowdLevel: "Moderate", percentageChange: 2 },
    { day: "Wednesday", date: "Dec 11", expectedCustomers: 72, crowdLevel: "Moderate", percentageChange: 8 },
    { day: "Thursday", date: "Dec 12", expectedCustomers: 85, crowdLevel: "High", percentageChange: 12 },
    { day: "Friday", date: "Dec 13", expectedCustomers: 120, crowdLevel: "Very High", percentageChange: 25 },
    { day: "Saturday", date: "Dec 14", expectedCustomers: 156, crowdLevel: "Very High", percentageChange: 42 },
    { day: "Sunday", date: "Dec 15", expectedCustomers: 142, crowdLevel: "Very High", percentageChange: 38 },
  ];

  const monthlyForecast: ForecastData[] = [
    { day: "Week 1", date: "Dec 2-8", expectedCustomers: 650, crowdLevel: "Moderate", percentageChange: 5 },
    { day: "Week 2", date: "Dec 9-15", expectedCustomers: 820, crowdLevel: "High", percentageChange: 22 },
    { day: "Week 3", date: "Dec 16-22", expectedCustomers: 950, crowdLevel: "Very High", percentageChange: 35 },
    { day: "Week 4", date: "Dec 23-29", expectedCustomers: 1100, crowdLevel: "Very High", percentageChange: 48 },
  ];

  const forecastData = forecastPeriod === "week" ? weeklyForecast : monthlyForecast;

  // ---- Helpers ----
  const getAvailableEmployees = (day: string) =>
    employees
      .filter((employee) => employee.availability.includes(day) && employee.currentLoad < 80)
      .sort((a, b) => a.currentLoad - b.currentLoad);

  const getAdditionalStaffNeeded = (crowdLevel: ForecastData["crowdLevel"]) => {
    switch (crowdLevel) {
      case "Very High":
        return 3;
      case "High":
        return 2;
      case "Moderate":
        return 1;
      default:
        return 0;
    }
  };

  const getCrowdLevelIcon = (level: ForecastData["crowdLevel"]) => {
    switch (level) {
      case "High":
      case "Very High":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      default:
        return <TrendingDown className="h-4 w-4 text-green-400" />;
    }
  };

  const hexFromBgClass = (bg: string) => {
    // expects forms like "bg-#6eff86" -> "#6eff86"
    if (bg?.startsWith("bg-")) return bg.slice(3);
    return bg || "#999999";
  };

  // Build a subtle incentive SMS
  function buildIncentiveMessage(emp: Employee, day: ForecastData) {
    const incentiveLine =
      "We’re offering incentive pay for the extra help (details on shift/bonus will be shared).";
    return [
      `Hi ${emp.name},`,
      `${shop.shopName} expects ${day.crowdLevel.toLowerCase()} footfall on ${day.day} (${day.date}, ~${day.expectedCustomers} customers).`,
      `Could you support with a few extra tasks or a short extension on your shift?`,
      incentiveLine,
      `Please reply YES if you're available, or NO if not.`,
      `Thanks!`,
    ].join("\n");
  }

  // Send SMS (direct, exposed key)
  async function sendIncentiveSMS(emp: Employee, day: ForecastData) {
    const headersList = {
      Accept: "*/*",
      "x-api-key": HTTPSMS_API_KEY,
      "Content-Type": "application/json",
    };

    const bodyContent = JSON.stringify({
      content: buildIncentiveMessage(emp, day),
      encrypted: false,
      from: DEFAULT_FROM_NUMBER,
      to: emp.phone,
    });

    const response = await fetch("https://api.httpsms.com/v1/messages/send", {
      method: "POST",
      body: bodyContent,
      headers: headersList,
    });

    const data = await response.text();
    if (!response.ok) throw new Error(`SMS failed (${response.status}): ${data}`);
    return data;
  }

  // ---- Circular Donut Pie Chart (colors unchanged) ----
  const PieChartComponent = ({ data }: { data: TaskStatus[] }) => {
    const totalPct = Math.max(1, data.reduce((sum, t) => sum + (t.percentage || 0), 0));
    const cx = 100,
      cy = 100,
      outerR = 90,
      innerR = 55;

    const toXY = (deg: number, r: number) => {
      const rad = (deg * Math.PI) / 180;
      return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
    };

    let currentAngle = -90;

    return (
      <div className="relative aspect-square w-full max-w-[320px]">
        <svg viewBox="0 0 200 200" className="h-full w-full" shapeRendering="geometricPrecision">
          {data.map((slice) => {
            const angle = (slice.percentage / totalPct) * 360;
            const largeArc = angle > 180 ? 1 : 0;

            const p0 = toXY(currentAngle, outerR);
            const p1 = toXY(currentAngle + angle, outerR);
            const q1 = toXY(currentAngle + angle, innerR);
            const q0 = toXY(currentAngle, innerR);

            const d = [
              `M ${p0.x} ${p0.y}`,
              `A ${outerR} ${outerR} 0 ${largeArc} 1 ${p1.x} ${p1.y}`,
              `L ${q1.x} ${q1.y}`,
              `A ${innerR} ${innerR} 0 ${largeArc} 0 ${q0.x} ${q0.y}`,
              "Z",
            ].join(" ");

            currentAngle += angle;
            const fill = hexFromBgClass(slice.bgColor);

            return (
              <path
                key={slice.status}
                d={d}
                fill={fill}
                opacity="0.9"
                className="transition-opacity duration-300 hover:opacity-100"
              />
            );
          })}
          <circle cx={cx} cy={cy} r={outerR} fill="none" stroke="rgba(255,255,255,0.06)" />
          <circle cx={cx} cy={cy} r={innerR} fill="none" stroke="rgba(0,0,0,0.10)" />
        </svg>

        <div className="absolute inset-0 grid place-items-center">
          <div className="text-center leading-tight">
            <div className="text-3xl font-bold text-white">{totalTasks}</div>
            <div className="text-xs tracking-wide text-white/70">Total Tasks</div>
          </div>
        </div>
      </div>
    );
  };

  // ---- PDF Export ----
  async function downloadPDF() {
    try {
      const { jsPDF } = await import("jspdf");
      // @ts-ignore - plugin augments jsPDF at runtime
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF({ unit: "pt", format: "a4" });
      const left = 40;
      let y = 50;

      // Header
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(`Analytics Report — ${shop.shopName}`, left, y);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(110);
      doc.text(new Date().toLocaleString(), left, (y += 16));
      doc.setTextColor(20);
      y += 12;

      // Today’s Tasks Summary
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Today's Tasks", left, (y += 24));
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const completed = todayTasks.find((t) => t.status === "completed")!;
      const pending = todayTasks.find((t) => t.status === "pending")!;
      doc.text(`Completed: ${completed.count} (${completed.percentage}%)`, left, (y += 16));
      doc.text(`Pending: ${pending.count} (${pending.percentage}%)`, left, (y += 16));
      doc.text(`Total: ${totalTasks}`, left, (y += 16));
      doc.text(`Completion Rate: ${completed.percentage}%`, left, (y += 16));

      // Simple bar viz (completed vs pending)
      const barLeft = left + 200;
      const barTop = y - 60;
      const barWidth = 220;
      const barHeight = 12;
      const compWidth = (completed.percentage / 100) * barWidth;
      doc.setFillColor(hexFromBgClass(completed.bgColor));
      doc.rect(barLeft, barTop, compWidth, barHeight, "F");
      doc.setFillColor(hexFromBgClass(pending.bgColor));
      doc.rect(barLeft + compWidth, barTop, barWidth - compWidth, barHeight, "F");
      doc.setFontSize(9);
      doc.setTextColor(255);
      doc.text(`${completed.percentage}%`, barLeft + compWidth - 24, barTop + 9, { align: "right" });
      doc.setTextColor(20);

      // Financial Stats Table
      // @ts-ignore
      autoTable(doc, {
        startY: (y += 18),
        head: [["Metric", "Value"]],
        body: financialStats.map((s) => [s.metric, s.value]),
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [33, 37, 41] },
        theme: "striped",
        margin: { left },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY || y;

      // Demand Forecast Table (for current period)
      // @ts-ignore
      autoTable(doc, {
        startY: (y += 24),
        head: [["Day", "Date", "Expected Customers", "Crowd", "Δ", "Extra Staff"]],
        body: forecastData.map((d) => [
          d.day,
          d.date,
          String(d.expectedCustomers),
          d.crowdLevel,
          `${d.percentageChange >= 0 ? "+" : ""}${d.percentageChange}%`,
          String(getAdditionalStaffNeeded(d.crowdLevel)),
        ]),
        styles: { fontSize: 9, cellPadding: 5 },
        headStyles: { fillColor: [33, 37, 41] },
        columnStyles: { 2: { halign: "right" }, 5: { halign: "right" } },
        margin: { left },
      });
      // @ts-ignore
      y = (doc as any).lastAutoTable.finalY || y;

      // Peak-Day Staffing (top available employees)
      const peakDays = forecastData.filter(
        (d) => d.crowdLevel === "High" || d.crowdLevel === "Very High"
      );
      const staffingRows: string[][] = [];
      peakDays.forEach((d) => {
        const avail = getAvailableEmployees(d.day).slice(0, getAdditionalStaffNeeded(d.crowdLevel));
        if (avail.length === 0) return;
        avail.forEach((e, idx) => {
          staffingRows.push([idx === 0 ? d.day : "", e.name, e.position, `${e.currentLoad}%`]);
        });
      });

      if (staffingRows.length > 0) {
        // @ts-ignore
        autoTable(doc, {
          startY: (y += 24),
          head: [["Peak Day", "Employee", "Position", "Load%"]],
          body: staffingRows,
          styles: { fontSize: 9, cellPadding: 5 },
          headStyles: { fillColor: [33, 37, 41] },
          columnStyles: { 3: { halign: "right" } },
          margin: { left },
        });
        // @ts-ignore
        y = (doc as any).lastAutoTable.finalY || y;
      }

      doc.save(`analytics-${shop.shopName.replace(/\s+/g, "-").toLowerCase()}-${Date.now()}.pdf`);
    } catch (err) {
      console.error(err);
      alert("PDF export failed. Make sure 'jspdf' and 'jspdf-autotable' are installed.");
    }
  }

  return (
    // MAIN WRAPPER: scroll entire component when tall
    <div className="custom-scroll flex max-h-[80vh] flex-col space-y-4 overflow-y-auto pr-1">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-white">
              Analytics <TrendingUp className="ml-1 inline h-6 w-6 text-white/80" />
            </h2>
            <Badge className="border-white/20 bg-white/10 text-white">Live</Badge>
          </div>
          <button
            onClick={downloadPDF}
            className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
        </div>
        <p className="mt-1 text-sm text-white/60">High-level metrics for {shop.shopName}</p>
      </Card>

      {/* Today’s Tasks */}
      <Card className={`${cardClass} p-4`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center text-lg font-bold text-white">
              <PieChartIcon className="mr-2 h-4 w-4 text-white/80" />
              Today&apos;s Tasks
            </h3>
            <p className="text-xs text-white/60">Completion overview</p>
          </div>
          <Badge variant="secondary" className="bg-green-500/20 text-xs text-green-300">
            {todayTasks[0].percentage}% Complete
          </Badge>
        </div>

        <div className="flex">
          {/* Left: stats */}
          <div className="w-1/2 pr-4">
            <div className="space-y-3">
              {todayTasks.map((task) => {
                const hex = hexFromBgClass(task.bgColor);
                return (
                  <div key={task.status} className="flex items-center justify-between rounded-lg bg-white/5 p-3">
                    <div className="flex items-center space-x-3">
                      <div className="rounded-full p-2" style={{ backgroundColor: `${hex}33` }}>
                        {task.icon}
                      </div>
                      <div>
                        <span className={`block text-sm font-medium capitalize ${task.color}`}>{task.status}</span>
                        <span className="text-xs text-white/60">{task.percentage}%</span>
                      </div>
                    </div>
                    <span className="text-xl font-bold text-white">{task.count}</span>
                  </div>
                );
              })}
            </div>

            {/* Completion Rate */}
            <div className="mt-4 rounded-lg bg-white/5 p-3">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-200">{todayTasks[0].percentage}%</div>
                <div className="text-sm text-white/60">Completion Rate</div>
              </div>
            </div>
          </div>

          {/* Right: circular donut */}
          <div className="flex w-1/2 items-center justify-center">
            <PieChartComponent data={todayTasks} />
          </div>
        </div>
      </Card>

      {/* Demand Forecast */}
      <Card className={`${cardClass} flex flex-col p-5`}>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="flex items-center text-xl font-bold text-white">
              <Calendar className="mr-2 h-5 w-5 text-white/80" />
              Demand Forecast
            </h3>
            <p className="text-sm text-white/60">Predicted customer traffic patterns</p>
          </div>
        <div className="flex space-x-2">
            <button
              onClick={() => setForecastPeriod("week")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                forecastPeriod === "week" ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setForecastPeriod("month")}
              className={`rounded-md px-3 py-1 text-sm font-medium transition-colors ${
                forecastPeriod === "month" ? "bg-white/20 text-white" : "bg-white/5 text-white/60 hover:text-white"
              }`}
            >
              Monthly
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
            {forecastData.map((day) => {
              const availableEmployees = getAvailableEmployees(day.day);
              const additionalStaffNeeded = getAdditionalStaffNeeded(day.crowdLevel);

              return (
                <Card key={day.day} className="border-white/10 bg-white/5 p-3">
                  <div className="mb-2 flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-white">{day.day}</p>
                      <p className="text-xs text-white/60">{day.date}</p>
                    </div>
                    {getCrowdLevelIcon(day.crowdLevel)}
                  </div>

                  <div className="mb-2 flex items-end justify-between">
                    <p className="text-2xl font-bold text-white">{day.expectedCustomers}</p>
                    <span className={`text-xs font-medium ${day.percentageChange >= 0 ? "text-green-400" : "text-red-400"}`}>
                      {day.percentageChange >= 0 ? "+" : ""}
                      {day.percentageChange}%
                    </span>
                  </div>

                  {(day.crowdLevel === "High" || day.crowdLevel === "Very High") && (
                    <div className="mt-3 border-t border-white/10 pt-3">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium text-white">Staffing Needed:</span>
                        <Badge variant="outline" className="border-red-500/30 bg-red-500/20 text-xs text-red-300">
                          +{additionalStaffNeeded} staff
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-white/60">Available employees:</p>
                        {availableEmployees.slice(0, additionalStaffNeeded).map((employee) => {
                          const status = smsStatus[employee.id] ?? "idle";
                          const isSending = status === "sending";
                          const isSent = status === "sent";
                          const isError = status === "error";

                          return (
                            <div key={employee.id} className="rounded bg-white/5 p-2 text-xs">
                              <div className="flex items-center justify-between">
                                <div>
                                  <span className="font-medium text-white">{employee.name}</span>
                                  <span className="ml-2 text-white/60">({employee.position})</span>
                                </div>

                                {/* Click to send incentive SMS */}
                                <button
                                  title={`Notify ${employee.name} about incentives for ${day.day}`}
                                  onClick={async () => {
                                    try {
                                      setSmsStatus((s) => ({ ...s, [employee.id]: "sending" }));
                                      await sendIncentiveSMS(employee, day);
                                      setSmsStatus((s) => ({ ...s, [employee.id]: "sent" }));
                                    } catch (e) {
                                      console.error(e);
                                      setSmsStatus((s) => ({ ...s, [employee.id]: "error" }));
                                      alert(`SMS failed for ${employee.name}`);
                                    }
                                  }}
                                  disabled={isSending}
                                  className={[
                                    "inline-flex h-7 w-7 items-center justify-center rounded-md border text-white transition-colors",
                                    isSending
                                      ? "border-white/20 bg-white/10"
                                      : isSent
                                      ? "border-green-400/40 bg-green-400/20 hover:bg-green-400/30"
                                      : isError
                                      ? "border-red-400/40 bg-red-400/20 hover:bg-red-400/30"
                                      : "border-white/20 bg-white/10 hover:bg-white/20",
                                  ].join(" ")}
                                >
                                  {isSending ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                  ) : (
                                    <UserCheck
                                      className={[
                                        "h-3.5 w-3.5",
                                        isSent ? "text-green-300" : isError ? "text-red-300" : "text-green-400",
                                      ].join(" ")}
                                    />
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      </Card>

      {/* Simple custom scrollbar styling */}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 10px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.18);
          border-radius: 9999px;
          border: 2px solid transparent;
          background-clip: padding-box;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
