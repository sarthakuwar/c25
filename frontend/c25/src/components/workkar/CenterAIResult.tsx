"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ChevronLeft, ChevronDown } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { Staff } from "@/app/dashboard/page"

export type AIKind = "optimal_staff" | "schedule" | "summary"

type Props = {
  cardClass: string
  ai: {
    raw: string
    data: any
    kind: AIKind
    prompt: string
    parseError?: string
  } | null
  shop: { id: string; shopName: string; startTime: string; endTime: string; staffs: Staff[] }
  onBack: () => void
  onCollapse: () => void
}

function initials(s?: string) {
  if (!s) return "?"
  return s
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()
}

export default function CenterAIResult({ cardClass, ai, shop, onBack, onCollapse }: Props) {
  const content = renderContent(ai, shop)

  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-9 px-3 text-white/80 hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">AI Result</h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-white/60 text-sm">{ai?.kind ? ai.kind.replace("_", " ") : ""}</span>
            <Button variant="ghost" className="h-9 px-3 text-white/80 hover:bg-white/10" onClick={onCollapse} title="Hide">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      <Card className={`${cardClass} p-5`}>
        {ai?.parseError ? (
          <div className="text-sm text-white/80">
            <p className="mb-2">Could not parse model output as JSON:</p>
            <pre className="whitespace-pre-wrap text-white/70 bg-black/40 border border-white/10 rounded-lg p-3">{ai.parseError}</pre>
            <p className="mt-4 mb-1 text-white/80">Raw response:</p>
            <pre className="whitespace-pre-wrap text-white/70 bg-black/40 border border-white/10 rounded-lg p-3">{ai.raw}</pre>
          </div>
        ) : (
          content
        )}
      </Card>
    </div>
  )
}

/* ---------- Rendering helpers ---------- */

function renderContent(ai: Props["ai"], shop: Props["shop"]) {
  if (!ai || !ai.data) {
    return <p className="text-white/70">No data.</p>
  }

  switch (ai.kind) {
    case "optimal_staff":
      return renderOptimalStaff(ai.data)
    case "schedule":
      return renderSchedule(ai.data, shop)
    case "summary":
    default:
      return renderSummary(ai.data)
  }
}

function renderOptimalStaff(data: any) {
  const staffList: Staff[] = Array.isArray(data) ? data : [data]
  return (
    <div className="grid grid-cols-2 gap-4">
      {staffList.map((s) => (
        <div key={s.id ?? s.phoneNumber ?? s.role} className="p-4 rounded-xl border border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-white/10 text-white text-xs">{initials(s.name || s.role)}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-white font-medium text-sm truncate" title={s.name || s.role}>{s.name || s.role}</p>
              <p className="text-[11px] text-white/60 truncate">{s.phoneNumber}</p>
            </div>
            <div className="ml-auto">
              <Badge className="bg-white/10 text-white border-white/20">{(s.status || "").toString().replace("_", " ")}</Badge>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-1">
            {(s.skillset ?? []).map((k: string, idx: number) => (
              <span key={idx} className="text-[11px] bg-white/10 text-white/80 px-2 py-0.5 rounded">{k}</span>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function renderSchedule(data: any, shop: Props["shop"]) {
  // Expect: [{ task: Task[], staff: "<id>" }]
  const rows: Array<{ staffId: string; tasks: any[] }> = Array.isArray(data)
    ? data.map((r) => ({ staffId: r.staff ?? r.staffId ?? "", tasks: r.task ?? r.tasks ?? [] }))
    : []

  const staffMap = new Map(shop.staffs.map((s) => [s.id, s]))

  return (
    <div id="aiScheduleScroll" className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
      style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}>
      {rows.map((row, idx) => {
        const st = staffMap.get(row.staffId)
        const title = st ? (st.name || st.role) : row.staffId || `Staff ${idx + 1}`
        return (
          <div key={row.staffId || idx} className="p-4 rounded-xl border border-white/10 bg-black/40">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-white/10 text-white text-xs">{initials(title)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-white font-medium text-sm truncate" title={title}>{title}</p>
                {st && <p className="text-[11px] text-white/60 truncate">{st.phoneNumber}</p>}
              </div>
              {st && <Badge className="ml-auto bg-white/10 text-white border-white/20">{st.status.replace("_", " ")}</Badge>}
            </div>

            <div className="space-y-2">
              {row.tasks.map((t: any) => (
                <div key={t.id ?? t.task} className="p-3 rounded-lg border border-white/10 bg-black/30">
                  <div className="flex items-center justify-between">
                    <p className="text-white text-sm font-medium truncate" title={t.task || t.title}>{t.task || t.title}</p>
                    <Badge className="text-[10px] bg-white/10 text-white border-white/20">{(t.status ?? "scheduled").toString().replace("_", " ")}</Badge>
                  </div>
                  <p className="text-[11px] text-white/60 mt-1">
                    {(t.startTime ?? t.start) || "--"} – {(t.endTime ?? t.end) || "--"}
                    {t.priority ? <> • Priority: {t.priority}</> : null}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      <style jsx>{`
        #aiScheduleScroll::-webkit-scrollbar { width: 8px; }
        #aiScheduleScroll::-webkit-scrollbar-track { background: transparent; }
        #aiScheduleScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
        #aiScheduleScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}

function renderSummary(data: any) {
  // Expect either: Task[] with status + optional summary; or { tasks: Task[], summary: string }
  const items: any[] = Array.isArray(data)
    ? data
    : (Array.isArray(data?.tasks) ? data.tasks : [])

  const completed = items.filter((t) => (t.status ?? "").toString().toLowerCase().includes("complete")).length
  const pending = items.length - completed
  const chartData = [
    { name: "Completed", value: completed },
    { name: "Pending", value: pending },
  ]

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4">
        {/* Small stats */}
        <div className="p-4 rounded-xl border border-white/10 bg-black/40">
          <p className="text-white/60 text-xs">Total tasks</p>
          <p className="text-xl font-bold text-white">{items.length}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-black/40">
          <p className="text-white/60 text-xs">Completed</p>
          <p className="text-xl font-bold text-white">{completed}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-black/40">
          <p className="text-white/60 text-xs">Pending</p>
          <p className="text-xl font-bold text-white">{pending}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="p-4 rounded-xl border border-white/10 bg-black/40">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff" }}
              />
              <Bar dataKey="value" color="red" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed list */}
      <div id="aiSummaryScroll" className="space-y-2 max-h-[calc(100vh-22rem)] overflow-y-auto pr-1"
        style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}>
        {items.map((t, idx) => (
          <div key={t.id ?? idx} className="p-3 rounded-lg border border-white/10 bg-black/40">
            <div className="flex items-center justify-between">
              <p className="text-white text-sm font-medium truncate" title={t.task || t.title}>{t.task || t.title}</p>
              <Badge className="text-[10px] bg-white/10 text-white border-white/20">{(t.status ?? "scheduled").toString().replace("_", " ")}</Badge>
            </div>
            <p className="text-[11px] text-white/60 mt-1">
              {(t.startTime ?? t.start) || "--"} – {(t.endTime ?? t.end) || "--"}
              {t.priority ? <> • Priority: {t.priority}</> : null}
            </p>
          </div>
        ))}
      </div>

      {Array.isArray(data) ? null : data?.summary ? (
        <div className="p-4 rounded-xl border border-white/10 bg-black/40">
          <p className="text-white/80 text-sm whitespace-pre-wrap">{data.summary}</p>
        </div>
      ) : null}

      <style jsx>{`
        #aiSummaryScroll::-webkit-scrollbar { width: 8px; }
        #aiSummaryScroll::-webkit-scrollbar-track { background: transparent; }
        #aiSummaryScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
        #aiSummaryScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
