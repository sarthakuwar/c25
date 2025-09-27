// app/workers/page.tsx
"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"

// Local JSON (one shop object). Ensure tsconfig has: "resolveJsonModule": true
import shopJson from "../../../data.json"

// ---------- Types aligned with your data.json ----------
type Task = {
  id: string
  startTime: string
  endTime: string
  task: string
  status: "completed" | "not_completed"
  priority: "high" | "low"
}
type Day = { id: string; tasks: Task[] }
type Staff = {
  id: string
  phoneNumber: string
  role: string
  status: "active" | "inactive" | "on_leave"
  startTime: string
  endTime: string
  employmentType?: "fulltime" | "parttime"
  skillset: string[]
  salary: number
  tasksCompleted: number
  noOfLeaves?: number
  noOfHrsWorked?: number
  name?: string
  day: Day[]
}
type Shop = {
  id: string
  shopName: string
  startTime: string
  endTime: string
  staffs: Staff[]
}

// ---------- Frosted card utilities (dark tint + readable text) ----------
const FROSTED_CARD =
  "bg-black/30 border border-white/10 shadow-xl backdrop-blur-md supports-[backdrop-filter]:backdrop-blur-md"
const CARD_TEXT = "text-white"
const MUTED = "text-white/75"

// Inputs/selects on dark cards
const INPUT_ON_DARK =
  "bg-white/5 text-white placeholder:text-white/60 border-white/20 focus-visible:ring-white/30"

// ---------- Time helpers ----------
const IST_TZ = "Asia/Kolkata"
const todayISOInIST = () => {
  const dt = new Date()
  const y = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, year: "numeric" }).format(dt)
  const m = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, month: "2-digit" }).format(dt)
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, day: "2-digit" }).format(dt)
  return `${y}-${m}-${d}`
}
const addDaysISOInIST = (days: number) => {
  const dt = new Date()
  dt.setUTCDate(dt.getUTCDate() + days)
  const y = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, year: "numeric" }).format(dt)
  const m = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, month: "2-digit" }).format(dt)
  const d = new Intl.DateTimeFormat("en-CA", { timeZone: IST_TZ, day: "2-digit" }).format(dt)
  return `${y}-${m}-${d}`
}
const weekdayLabel = (isoDate: string) =>
  new Intl.DateTimeFormat("en-IN", { weekday: "long", timeZone: IST_TZ }).format(new Date(isoDate + "T00:00:00"))

// ---------- Availability types ----------
type DaySlot = { start: string; end: string }
type DayPlan = { available: boolean; slots: DaySlot[] }
type AvailabilityMap = Record<string, DayPlan> // date ISO -> plan

export default function WorkersPage() {
  // ---------- Gate form (localStorage) ----------
  const [checkingLS, setCheckingLS] = useState(true)
  const [pid, setPid] = useState("")
  const [org, setOrg] = useState("")
  const [hasIdentity, setHasIdentity] = useState(false)

  useEffect(() => {
    const _pid = localStorage.getItem("workers_pid") || ""
    const _org = localStorage.getItem("workers_org") || ""
    setPid(_pid)
    setOrg(_org)
    setHasIdentity(Boolean(_pid && _org))
    setCheckingLS(false)
  }, [])

  const handleIdentitySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!pid || !org) return
    localStorage.setItem("workers_pid", pid)
    localStorage.setItem("workers_org", org)
    setHasIdentity(true)
  }

  // ---------- Load shop from local JSON ----------
  const shop: Shop = shopJson as Shop

  // ---------- Resolve staff by PID ----------
  const staff: Staff | undefined = useMemo(() => {
    if (!pid) return undefined
    if (!Array.isArray(shop?.staffs)) return undefined
    const byId = shop.staffs.find(s => s.id === pid)
    if (byId) return byId
    const byPhone = shop.staffs.find(s => s.phoneNumber === pid)
    if (byPhone) return byPhone
    const byName = shop.staffs.find(s => s.name?.toLowerCase() === pid.toLowerCase())
    return byName
  }, [pid, shop])

  // ---------- Today’s tasks ----------
  const today = todayISOInIST()
  const todaysTasks: Task[] = useMemo(() => {
    if (!staff || !Array.isArray(staff.day)) return []
    const day = staff.day.find(d => d.id === today)
    return Array.isArray(day?.tasks)
      ? [...day!.tasks].sort((a, b) => a.startTime.localeCompare(b.startTime))
      : []
  }, [staff, today])

  // ---------- Overall task summary ----------
  const allTasks = useMemo(() => {
    if (!staff?.day) return [] as (Task & { date: string })[]
    const out: (Task & { date: string })[] = []
    for (const d of staff.day) {
      if (!Array.isArray(d.tasks)) continue
      for (const t of d.tasks) out.push({ ...t, date: d.id })
    }
    return out
  }, [staff])

  const assignedCount = allTasks.length
  const completedCount = allTasks.filter(t => t.status === "completed").length
  const pendingCount = allTasks.filter(t => t.status === "not_completed").length

  // ---------- Plan a schedule (next 3 days), saved to localStorage ----------
  const next3 = [1, 2, 3].map(addDaysISOInIST)
  const defaultStart = staff?.startTime || "09:00"
  const defaultEnd = staff?.endTime || "18:00"

  const ensureDefaults = (existing?: AvailabilityMap | null): AvailabilityMap => {
    const base: AvailabilityMap = {}
    next3.forEach(date => {
      const prior = existing?.[date]
      base[date] = prior ?? { available: true, slots: [{ start: defaultStart, end: defaultEnd }] }
    })
    return base
  }

  const [availability, setAvailability] = useState<AvailabilityMap | null>(null)
  const [loadingAvail, setLoadingAvail] = useState(true)

  useEffect(() => {
    if (!hasIdentity) return
    const key = `availability:${org}:${pid}`
    try {
      const raw = localStorage.getItem(key)
      const saved = raw ? (JSON.parse(raw) as AvailabilityMap) : null
      setAvailability(ensureDefaults(saved))
    } catch {
      setAvailability(ensureDefaults(null))
    } finally {
      setLoadingAvail(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasIdentity, org, pid])

  const updateDay = (date: string, updater: (prev: DayPlan) => DayPlan) => {
    setAvailability(prev => {
      if (!prev) return prev
      return { ...prev, [date]: updater(prev[date]) }
    })
  }
  const addSlot = (date: string) => {
    updateDay(date, prev => {
      const slots = prev.slots.length >= 3 ? prev.slots : [...prev.slots, { start: defaultStart, end: defaultEnd }]
      return { ...prev, slots }
    })
  }
  const removeSlot = (date: string, idx: number) => {
    updateDay(date, prev => {
      const slots = prev.slots.filter((_, i) => i !== idx)
      return { ...prev, slots: slots.length ? slots : [{ start: defaultStart, end: defaultEnd }] }
    })
  }
  const setSlotField = (date: string, idx: number, field: "start" | "end", value: string) => {
    updateDay(date, prev => {
      const slots = prev.slots.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
      return { ...prev, slots }
    })
  }
  const saveAvailability = () => {
    if (!availability) return
    // basic validation
    for (const d of next3) {
      const plan = availability[d]
      if (!plan) continue
      if (plan.available) {
        for (const s of plan.slots) {
          if (!s.start || !s.end || s.end <= s.start) {
            alert(`Fix invalid time range on ${d} (${s.start} – ${s.end})`)
            return
          }
        }
      }
    }
    const key = `availability:${org}:${pid}`
    localStorage.setItem(key, JSON.stringify(availability))
    alert("Schedule saved for the next 3 days!")
  }

  // ---------- Leave (demo) ----------
  const [leaveType, setLeaveType] = useState<"planned" | "emergency">("planned")
  const [leaveDate, setLeaveDate] = useState(addDaysISOInIST(1))
  const [leaveReason, setLeaveReason] = useState("")
  const submitLeave = () => {
    alert(
      `Leave submitted:\nType: ${leaveType}\nDate: ${leaveType === "emergency" ? today : leaveDate}\nReason: ${
        leaveReason || "—"
      }\nFor: ${org} • PID ${pid}`
    )
    setLeaveReason("")
  }

  // ---------- Render ----------
  if (checkingLS) return <main className="p-6">Loading…</main>

  // Gate form
  if (!hasIdentity) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Worker sign-in</h1>
        <p className="text-sm text-muted-foreground">Enter your PID and organisation name to continue.</p>

        <Card className={`mt-6 p-5 space-y-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
          <form className="space-y-4" onSubmit={handleIdentitySubmit}>
            <div className="space-y-2">
              <Label htmlFor="pid" className={CARD_TEXT}>PID</Label>
              <Input
                id="pid"
                placeholder="e.g., shop-001-staff-001"
                value={pid}
                onChange={e => setPid(e.target.value)}
                className={INPUT_ON_DARK}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="org" className={CARD_TEXT}>Organisation name</Label>
              <Input
                id="org"
                placeholder="e.g., Narcode Retail"
                value={org}
                onChange={e => setOrg(e.target.value)}
                className={INPUT_ON_DARK}
              />
            </div>
            <Button type="submit" className="w-full">Continue</Button>
          </form>
        </Card>
      </main>
    )
  }

  // Main page
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-10">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">Workers</h1>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-white">{org}</span> <span className="font-mono text-white">{pid}</span>
        </div>
      </div>

      {/* Summary */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Your task summary</h2>
        <div className="grid grid-cols-3 gap-3">
          <Card className={`p-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
            <div className={`${MUTED}`}>Assigned</div>
            <div className="text-2xl font-semibold">{assignedCount}</div>
          </Card>
          <Card className={`p-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
            <div className={`${MUTED}`}>Completed</div>
            <div className="text-2xl font-semibold">{completedCount}</div>
          </Card>
          <Card className={`p-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
            <div className={`${MUTED}`}>Pending</div>
            <div className="text-2xl font-semibold">{pendingCount}</div>
          </Card>
        </div>
      </section>

      {/* Today’s Tasks */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Today’s Tasks <span className="text-muted-foreground">({today})</span></h2>
        <Card className={`p-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
          {!staff ? (
            <p className={`${MUTED}`}>No worker found for this PID.</p>
          ) : todaysTasks.length === 0 ? (
            <p className={`${MUTED}`}>No tasks assigned for today.</p>
          ) : (
            <ul className="space-y-3">
              {todaysTasks.map(t => (
                <li
                  key={t.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/5 p-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant={t.priority === "high" ? "destructive" : "secondary"}>
                        {t.priority === "high" ? "High" : "Low"}
                      </Badge>
                      <span className="font-medium truncate text-white">{t.task}</span>
                    </div>
                    <p className={`text-sm ${MUTED}`}>{t.startTime} – {t.endTime}</p>
                  </div>
                  <Badge variant={t.status === "completed" ? "default" : "outline"}>
                    {t.status === "completed" ? "Completed" : "Pending"}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </section>

      {/* Plan a schedule — Next 3 days (localStorage) */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Plan a schedule (next 3 days)</h2>
        <Card className={`p-4 space-y-4 ${FROSTED_CARD} ${CARD_TEXT}`}>
          {loadingAvail || !availability ? (
            <p className={`${MUTED}`}>Loading availability…</p>
          ) : (
            <>
              {([1,2,3].map(addDaysISOInIST)).map(date => {
                const plan = availability[date]
                return (
                  <div key={date} className="rounded-lg border border-white/10 bg-white/5 p-3 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium text-white">{weekdayLabel(date)}, {date}</div>
                        <div className={`text-xs ${MUTED}`}>
                          Default hours: {(staff?.startTime || "09:00")}–{(staff?.endTime || "18:00")}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant={plan.available ? "default" : "outline"}
                          className={!plan.available ? "border-white/40 text-black hover:bg-white/10" : ""}
                          onClick={() => updateDay(date, p => ({ ...p, available: true }))}
                        >
                          Available
                        </Button>
                        <Button
                          variant={!plan.available ? "destructive" : "outline"}
                          className={plan.available ? "border-white/40 text-black hover:bg-white/10" : ""}
                          onClick={() => updateDay(date, p => ({ ...p, available: false }))}
                        >
                          Unavailable
                        </Button>
                      </div>
                    </div>

                    {/* Time slots */}
                    <div className={`grid gap-2 ${plan.available ? "" : "opacity-60"}`}>
                      {plan.slots.map((slot, idx) => (
                        <div key={idx} className="grid grid-cols-[1fr_1fr_auto] items-end gap-2">
                          <div className="space-y-1">
                            <Label className={CARD_TEXT}>Start time</Label>
                            <Input
                              type="time"
                              value={slot.start}
                              onChange={e => setSlotField(date, idx, "start", e.target.value)}
                              className={INPUT_ON_DARK}
                              disabled={!plan.available}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label className={CARD_TEXT}>End time</Label>
                            <Input
                              type="time"
                              value={slot.end}
                              min={slot.start}
                              onChange={e => setSlotField(date, idx, "end", e.target.value)}
                              className={INPUT_ON_DARK}
                              disabled={!plan.available}
                            />
                          </div>
                          <Button
                            variant="outline"
                            className="border-white/40 text-black hover:bg-white/10"
                            onClick={() => removeSlot(date, idx)}
                            disabled={!plan.available}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <div>
                        <Button
                          variant="secondary"
                          onClick={() => addSlot(date)}
                          disabled={!plan.available || availability[date].slots.length >= 3}
                        >
                          Add another slot
                        </Button>
                        <span className={`ml-2 text-xs ${MUTED}`}>Up to 3 slots/day</span>
                      </div>
                    </div>
                  </div>
                )
              })}

              <div className="pt-1">
                <Button onClick={saveAvailability}>Save schedule</Button>
              </div>
            </>
          )}
        </Card>
      </section>

      {/* Apply for Leave */}
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Apply for Leave</h2>
        <Card className={`p-4 grid gap-4 md:grid-cols-3 ${FROSTED_CARD} ${CARD_TEXT}`}>
          <div className="space-y-2">
            <Label className={CARD_TEXT}>Type</Label>
            <Select value={leaveType} onValueChange={(v: "planned" | "emergency") => setLeaveType(v)}>
              <SelectTrigger className={INPUT_ON_DARK}><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="planned">Planned</SelectItem>
                <SelectItem value="emergency">Emergency (today)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className={CARD_TEXT}>Date</Label>
            <Input
              type="date"
              value={leaveType === "emergency" ? today : leaveDate}
              onChange={e => setLeaveDate(e.target.value)}
              disabled={leaveType === "emergency"}
              min={today}
              className={INPUT_ON_DARK}
            />
          </div>
          <div className="space-y-2 md:col-span-1">
            <Label className={CARD_TEXT}>Reason (optional)</Label>
            <Input
              placeholder="Family emergency, appointment, etc."
              value={leaveReason}
              onChange={e => setLeaveReason(e.target.value)}
              className={INPUT_ON_DARK}
            />
          </div>
          <div className="md:col-span-3">
            <Button onClick={submitLeave}>Submit leave request</Button>
          </div>
        </Card>
      </section>
    </main>
  )
}
