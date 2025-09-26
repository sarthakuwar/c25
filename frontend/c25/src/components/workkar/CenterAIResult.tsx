"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ChevronLeft, ChevronDown, PencilLine, Check, X, Save } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import type { Staff, DayTask } from "@/app/dashboard/page"

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
  // NEW: parent handler to accept a schedule
  onAcceptSchedule?: (tasks: DayTask[]) => void
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

export default function CenterAIResult({ cardClass, ai, shop, onBack, onCollapse, onAcceptSchedule }: Props) {
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
        ) : ai?.kind === "optimal_staff" ? (
          <OptimalStaff data={ai.data} />
        ) : ai?.kind === "schedule" ? (
          <SchedulePane
            aiData={ai.data}
            shop={shop}
            onAcceptSchedule={onAcceptSchedule}
          />
        ) : (
          <SummaryPane data={ai?.data} />
        )}
      </Card>
    </div>
  )
}

/* ==================== SCHEDULE PANE (with Edit + Accept) ==================== */

type Row = { staffId: string; tasks: any[] }

function normalizeScheduleData(data: any): Row[] {
  if (!Array.isArray(data)) return []
  return data.map((r) => ({
    staffId: r.staff ?? r.staffId ?? "",
    tasks: Array.isArray(r.task) ? r.task : Array.isArray(r.tasks) ? r.tasks : [],
  }))
}

function toDayTasks(rows: Row[], shop: Props["shop"]): DayTask[] {
  const staffMap = new Map(shop.staffs.map((s) => [s.id, s]))
  const out: DayTask[] = []
  rows.forEach((row, ri) => {
    const st = staffMap.get(row.staffId)
    const assignee = st?.name || st?.role || row.staffId || "Unknown"
    row.tasks.forEach((t, ti) => {
      const title = t.task || t.title || "Task"
      const start = t.startTime || t.start || "--:--"
      const end = t.endTime || t.end || "--:--"
      const p = (t.priority ?? "Medium").toString().toLowerCase()
      const priority: DayTask["priority"] = p === "high" ? "High" : p === "low" ? "Low" : "Medium"
      const statusRaw = (t.status ?? "scheduled").toString().toLowerCase()
      const status: DayTask["status"] = statusRaw.includes("complete") ? "done" : statusRaw.includes("progress") ? "in_progress" : "upcoming"
      const progress = status === "done" ? 100 : status === "in_progress" ? 50 : 0

      out.push({
        id: t.id ?? `ai-${row.staffId}-${ri}-${ti}-${Date.now()}`,
        title,
        start,
        end,
        assignee,
        priority,
        status,
        progress,
      })
    })
  })
  return out
}

function SchedulePane({
  aiData,
  shop,
  onAcceptSchedule,
}: {
  aiData: any
  shop: Props["shop"]
  onAcceptSchedule?: (tasks: DayTask[]) => void
}) {
  const initialRows = useMemo(() => normalizeScheduleData(aiData), [aiData])
  const [editMode, setEditMode] = useState(false)
  const [rows, setRows] = useState<Row[]>(initialRows)

  useEffect(() => {
    setRows(initialRows)
    setEditMode(false)
  }, [initialRows])

  const staffMap = useMemo(() => new Map(shop.staffs.map((s) => [s.id, s])), [shop.staffs])

  const onChangeTask = (ri: number, ti: number, field: "task" | "startTime" | "endTime" | "status" | "priority", value: string) => {
    setRows((prev) => {
      const copy = prev.map((r) => ({ staffId: r.staffId, tasks: r.tasks.map((t: any) => ({ ...t })) }))
      copy[ri].tasks[ti] = { ...copy[ri].tasks[ti], [field]: value }
      return copy
    })
  }

  const onCancelEdit = () => {
    setRows(initialRows)
    setEditMode(false)
  }

  const onSaveEdits = () => {
    setEditMode(false) // rows already updated
  }

  const onAccept = () => {
    if (!onAcceptSchedule) return
    const dayTasks = toDayTasks(rows, shop)
    onAcceptSchedule(dayTasks)
  }

  return (
    <div className="space-y-4">
      {/* Action bar */}
      <div className="flex items-center justify-between">
        <div className="text-white/80 text-sm">AI proposed schedule</div>
        <div className="flex items-center gap-2">
          {!editMode ? (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-white/90 hover:bg-white/10"
                onClick={() => setEditMode(true)}
                title="Edit tasks"
              >
                <PencilLine className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                onClick={onAccept}
                title="Replace current schedule"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept & Assign
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 text-white/90 hover:bg-white/10"
                onClick={onCancelEdit}
                title="Discard edits"
              >
                <X className="h-4 w-4 mr-1" />
                Cancel
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                onClick={onSaveEdits}
                title="Save edits locally"
              >
                <Save className="h-4 w-4 mr-1" />
                Save edits
              </Button>
              <Button
                size="sm"
                className="h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                onClick={onAccept}
                title="Apply edited schedule"
              >
                <Check className="h-4 w-4 mr-1" />
                Accept & Assign
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div
        id="aiScheduleScroll"
        className="space-y-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
        style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}
      >
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
                {row.tasks.map((t: any, ti: number) => (
                  <div key={t.id ?? ti} className="p-3 rounded-lg border border-white/10 bg-black/30">
                    {!editMode ? (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-white text-sm font-medium truncate" title={t.task || t.title}>{t.task || t.title}</p>
                          <Badge className="text-[10px] bg-white/10 text-white border-white/20">
                            {(t.status ?? "scheduled").toString().replace("_", " ")}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-white/60 mt-1">
                          {(t.startTime ?? t.start) || "--"} – {(t.endTime ?? t.end) || "--"}
                          {t.priority ? <> • Priority: {t.priority}</> : null}
                        </p>
                      </>
                    ) : (
                      <div className="grid grid-cols-6 gap-2">
                        <div className="col-span-3">
                          <Input
                            value={t.task ?? t.title ?? ""}
                            onChange={(e) => onChangeTask(idx, ti, "task", e.target.value)}
                            className="h-8 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                            placeholder="Task title"
                          />
                        </div>
                        <Input
                          value={t.startTime ?? t.start ?? ""}
                          onChange={(e) => onChangeTask(idx, ti, "startTime", e.target.value)}
                          className="h-8 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                          placeholder="Start (HH:MM)"
                        />
                        <Input
                          value={t.endTime ?? t.end ?? ""}
                          onChange={(e) => onChangeTask(idx, ti, "endTime", e.target.value)}
                          className="h-8 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                          placeholder="End (HH:MM)"
                        />
                        <select
                          value={(t.status ?? "scheduled").toString()}
                          onChange={(e) => onChangeTask(idx, ti, "status", e.target.value)}
                          className="h-8 rounded-md bg-black/40 border border-white/20 text-white px-2 text-sm"
                        >
                          {["completed", "not_completed", "scheduled", "in_progress"].map((s) => (
                            <option key={s} value={s}>{s.replace("_", " ")}</option>
                          ))}
                        </select>
                        <select
                          value={(t.priority ?? "medium").toString().toLowerCase()}
                          onChange={(e) => onChangeTask(idx, ti, "priority", e.target.value)}
                          className="h-8 rounded-md bg-black/40 border border-white/20 text-white px-2 text-sm"
                        >
                          {["high", "medium", "low"].map((p) => (
                            <option key={p} value={p}>{p}</option>
                          ))}
                        </select>
                      </div>
                    )}
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
    </div>
  )
}

/* ==================== OPTIMAL STAFF (unchanged) ==================== */

function OptimalStaff({ data }: { data: any }) {
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

/* ==================== SUMMARY (unchanged) ==================== */

function SummaryPane({ data }: { data: any }) {
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

      <div className="p-4 rounded-xl border border-white/10 bg-black/40">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeOpacity={0.15} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }} axisLine={{ stroke: "rgba(255,255,255,0.25)" }} tickLine={false} />
              <Tooltip contentStyle={{ background: "rgba(0,0,0,0.6)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12, color: "#fff" }} />
              <Bar dataKey="value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

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

      <style jsx>{`
        #aiSummaryScroll::-webkit-scrollbar { width: 8px; }
        #aiSummaryScroll::-webkit-scrollbar-track { background: transparent; }
        #aiSummaryScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
        #aiSummaryScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
