"use client"

import { useCallback, useMemo, useState, FormEvent, startTransition } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Store,
  TrendingUp,
  FileText,
  MessageSquare,
  Database,
  Plus,
  HelpCircle,
  LogOut,
  Crown,
  ChevronRight,
  Send,
  Sparkles,
  ChevronDown,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Center panes
import CenterShops from "@/components/workkar/CenterShops"
import CenterAnalytics from "@/components/workkar/CenterAnalytics"
import CenterReports from "@/components/workkar/CenterReports"
import CenterMessages from "@/components/workkar/CenterMessages"
import CenterDataImport from "@/components/workkar/CenterDataImport"
import CenterTasksDetail from "@/components/workkar/CenterTasksDetail"
import CenterStaffDetail from "@/components/workkar/CenterStaffDetail"
import CenterActivityDetail from "@/components/workkar/CenterActivityDetail"
import CenterAIResult, { AIKind } from "@/components/workkar/CenterAIResult"

const CARD = "backdrop-blur-xl bg-black/50 border border-white/10 rounded-3xl"

// ---- Types & seed
export type Staff = {
  id: string
  phoneNumber: string
  role: string
  status: "active" | "inactive" | "on_leave"
  startTime: string
  endTime: string
  skillset: string[]
  tasksCompleted: number
  salary: number
  day: any[]
  // Optional display name support if your JSON has it
  name?: string
}

type Shop = {
  id: string
  shopName: string
  startTime: string
  endTime: string
  staffs: Staff[]
}

export type DayTask = {
  id: string
  title: string
  start: string
  end: string
  assignee: string
  priority: "High" | "Medium" | "Low"
  status?: "upcoming" | "in_progress" | "done"
  progress?: number
}

export type Activity = {
  id: string
  title: string
  time: string
  type: "success" | "info" | "default"
}

const seedShop: Shop = {
  id: "shop-001",
  shopName: "Work-kar Demo - Koramangala",
  startTime: "09:00",
  endTime: "21:00",
  staffs: [
    { id: "shop-001-staff-001", phoneNumber: "+91 97468 782554", role: "Cashier", status: "active", startTime: "09:00", endTime: "17:00", skillset: ["Merchandising", "Baking", "Inventory"], tasksCompleted: 27, salary: 32000, day: [], name: "Cashier" },
    { id: "shop-001-staff-002", phoneNumber: "+91 97101 202163", role: "Supervisor", status: "inactive", startTime: "12:00", endTime: "20:00", skillset: ["Inventory", "Electronics", "POS", "Merchandising"], tasksCompleted: 25, salary: 22000, day: [], name: "Supervisor" },
    { id: "shop-001-staff-003", phoneNumber: "+91 99137 708064", role: "Stock Associate", status: "on_leave", startTime: "13:00", endTime: "22:00", skillset: ["Merchandising", "Inventory", "Cooking"], tasksCompleted: 23, salary: 27500, day: [], name: "Stock Associate" },
    { id: "shop-001-staff-004", phoneNumber: "+91 96878 815887", role: "Security", status: "on_leave", startTime: "09:00", endTime: "18:00", skillset: ["Customer Service", "Inventory", "Returns Handling"], tasksCompleted: 28, salary: 34000, day: [], name: "Security" },
    { id: "shop-001-staff-005", phoneNumber: "+91 93659 215268", role: "Sales Associate", status: "on_leave", startTime: "08:00", endTime: "17:00", skillset: ["POS", "Inventory", "Returns Handling", "Electronics"], tasksCompleted: 22, salary: 22000, day: [], name: "Sales Associate" },
  ],
}

const seedTasks: DayTask[] = [
  { id: "t1", title: "Open store & safety check", start: "08:45", end: "09:15", assignee: "Supervisor", priority: "High" },
  { id: "t2", title: "POS setup & cash float", start: "08:50", end: "09:10", assignee: "Cashier", priority: "Medium" },
  { id: "t3", title: "Shelf refill — bakery", start: "09:30", end: "10:30", assignee: "Stock Associate", priority: "Medium" },
  { id: "t4", title: "Inventory cycle count", start: "11:00", end: "12:00", assignee: "Supervisor", priority: "High" },
  { id: "t6", title: "Receive shipment", start: "15:00", end: "16:30", assignee: "Stock Associate", priority: "High" },
  { id: "t7", title: "Evening rush staffing", start: "18:00", end: "20:00", assignee: "All", priority: "High" },
  { id: "t8", title: "Closing checklist", start: "20:30", end: "21:00", assignee: "Security", priority: "Medium" },
]

const seedActivities: Activity[] = [
  { id: "a1", title: "Shift schedule updated", time: "2 min ago", type: "success" },
  { id: "a2", title: "New staff added", time: "1 hour ago", type: "success" },
  { id: "a3", title: "Payroll processed", time: "3 hours ago", type: "info" },
  { id: "a4", title: "Task assigned", time: "5 hours ago", type: "default" },
]

type CenterKey =
  | "shops"
  | "analytics"
  | "reports"
  | "messages"
  | "data"
  | "tasks"      // tasks-only detail
  | "staff"      // staff-only detail
  | "activity"   // activity detail
  | "ai"         // AI result in center

export default function DashboardPage() {
  // Global state
  const [shop, setShop] = useState<Shop>(seedShop)
  const [dailyTasks, setDailyTasks] = useState<DayTask[]>(seedTasks)
  const [activityFeed] = useState<Activity[]>(seedActivities)

  const [center, setCenter] = useState<CenterKey>("shops")
  const [prevCenter, setPrevCenter] = useState<CenterKey>("shops")

  // Add Staff dialog state
  const [addOpen, setAddOpen] = useState(false)
  const [newStaff, setNewStaff] = useState<Partial<Staff>>({
    role: "Cashier",
    phoneNumber: "",
    status: "active",
    startTime: "09:00",
    endTime: "17:00",
    salary: 20000,
    skillset: [],
  })

  // === Handlers (memoized) ===
  const handleAddStaff = useCallback((e?: FormEvent) => {
    e?.preventDefault()
    if (!newStaff.role || !newStaff.phoneNumber) return
    const staff: Staff = {
      id: `staff-${Date.now()}`,
      role: newStaff.role!,
      phoneNumber: newStaff.phoneNumber!,
      status: (newStaff.status as Staff["status"]) || "active",
      startTime: newStaff.startTime || "09:00",
      endTime: newStaff.endTime || "17:00",
      salary: Number(newStaff.salary) || 0,
      skillset: (newStaff.skillset as string[]) || [],
      tasksCompleted: 0,
      day: [],
      name: newStaff.role,
    }
    setShop((prev) => ({ ...prev, staffs: [...prev.staffs, staff] }))
    setAddOpen(false)
    setNewStaff({ role: "Cashier", phoneNumber: "", status: "active", startTime: "09:00", endTime: "17:00", salary: 20000, skillset: [] })
  }, [newStaff])

  const handleAddDayTask = useCallback((task: DayTask) => {
    setDailyTasks((prev) => [...prev, task])
  }, [])

  const goCenter = useCallback((k: CenterKey) => startTransition(() => setCenter(k)), [])
  const goShops = useCallback(() => goCenter("shops"), [goCenter])
  const goTasks = useCallback(() => goCenter("tasks"), [goCenter])
  const goStaff = useCallback(() => goCenter("staff"), [goCenter])
  const goActivity = useCallback(() => goCenter("activity"), [goCenter])
  const goAnalytics = useCallback(() => goCenter("analytics"), [goCenter])
  const goReports = useCallback(() => goCenter("reports"), [goCenter])
  const goMessages = useCallback(() => goCenter("messages"), [goCenter])
  const goData = useCallback(() => goCenter("data"), [goCenter])

  // Menu (memoized)
  const menu = useMemo(() => ([
    { key: "shops" as const, icon: Store, label: "Shops", onClick: goShops },
    { key: "analytics" as const, icon: TrendingUp, label: "Analytics", onClick: goAnalytics },
    { key: "reports" as const, icon: FileText, label: "Reports", onClick: goReports },
    { key: "messages" as const, icon: MessageSquare, label: "Messages", onClick: goMessages },
    { key: "data" as const, icon: Database, label: "Data Import", onClick: goData },
  ]), [goShops, goAnalytics, goReports, goMessages, goData])

  // ===== AI dock state & helpers =====
  type AIState = {
    raw: string
    data: any
    kind: AIKind
    prompt: string
    parseError?: string
  } | null

  const [aiState, setAiState] = useState<AIState>(null)

  // guess kind from prompt
  const guessKindFromPrompt = (p: string): AIKind | "auto" => {
    const s = p.toLowerCase()
    if (s.includes("optimal employee") || s.includes("optimal employees")) return "optimal_staff"
    if (s.includes("create a schedule")) return "schedule"
    if (s.includes("summary")) return "summary"
    return "auto"
  }

  // try to infer kind from data shape
  const inferKindFromData = (data: any): AIKind => {
    if (Array.isArray(data)) {
      // Schedule format: [{ task: Task[], staff: "<id>" }, ...]
      if (data.length && typeof data[0] === "object" && ("task" in data[0] || "tasks" in data[0]) && ("staff" in data[0] || "staffId" in data[0])) {
        return "schedule"
      }
      // Staff[] (optimal employees)
      if (data.length && typeof data[0] === "object" && ("role" in data[0]) && ("status" in data[0]) && ("phoneNumber" in data[0])) {
        return "optimal_staff"
      }
      // Summary often returns Task[] or array with "summary"
      if (data.length && (("summary" in data[0]) || ("status" in data[0] && ("task" in data[0] || "title" in data[0])))) {
        return "summary"
      }
    } else if (data && typeof data === "object") {
      if ("summary" in data) return "summary"
    }
    return "summary"
  }

  const extractJson = (text: string) => {
    // Strip ```json ... ``` or ``` ... ```
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    return codeBlock ? codeBlock[1].trim() : text.trim()
  }

  // Ask AI & show center result
  const [prompt, setPrompt] = useState("")
  const [isThinking, setIsThinking] = useState(false)

  const askAI = useCallback(async (e?: FormEvent) => {
    e?.preventDefault()
    const q = prompt.trim()
    if (!q) return
    setIsThinking(true)
    try {
      const res = await fetch("http://localhost:3000/ai", {
        method: "POST",
        headers: { Accept: "*/*", "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: q }),
      })
      const text = await res.text()

      let parsed: any = null
      let parseError: string | undefined
      try {
        const cleaned = extractJson(text)
        parsed = JSON.parse(cleaned)
      } catch (err: any) {
        parseError = `Could not parse JSON: ${err?.message ?? "unknown error"}`
      }

      const guessed = guessKindFromPrompt(q)
      const kind: AIKind = parsed && guessed === "auto" ? inferKindFromData(parsed) : (guessed === "auto" ? "summary" : guessed)

      setAiState({ raw: text, data: parsed, kind, prompt: q, ...(parseError ? { parseError } : {}) })
      setPrevCenter((c) => (c === "ai" ? "shops" : c))
      setCenter("ai")
    } catch (err) {
      setAiState({ raw: "Request failed", data: null, kind: "summary", prompt: q, parseError: (err as any)?.message ?? "unknown error" })
      setPrevCenter((c) => (c === "ai" ? "shops" : c))
      setCenter("ai")
    } finally {
      setIsThinking(false)
      setPrompt("")
    }
  }, [prompt])

  const collapseAI = useCallback(() => {
    // Hide AI result and restore previous center pane
    setCenter(prevCenter)
  }, [prevCenter])

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Main grid */}
      <div className="relative z-10 p-5 grid grid-cols-12 gap-5 h-screen pb-20">
        {/* LEFT SIDEBAR */}
        <Card className={`col-span-2 ${CARD} p-5 h-fit flex flex-col`}>
          <div className="space-y-5">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white">Work-kar</h1>
              <p className="text-white/60 text-sm">Staff Management</p>
            </div>

            <div>
              <h4 className="text-white/80 text-xs font-semibold uppercase tracking-wider mb-2.5">Workspace</h4>
              <nav className="space-y-2">
                {menu.map((item) => {
                  const Icon = item.icon
                  const isActive = center === item.key
                  return (
                    <Button
                      key={item.key}
                      variant="ghost"
                      onClick={() => setCenter(item.key)}
                      className={`w-full justify-start text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all h-10 ${
                        isActive ? "bg-white/10 text-white border border-white/20" : ""
                      }`}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.label}
                    </Button>
                  )
                })}
              </nav>
            </div>

            {/* Premium (only here) */}
            <Card className="bg-black/60 border border-white/20 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 grid place-items-center border border-white/10">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">Go Premium</h4>
                  <p className="text-[11px] text-white/70">Unlock advanced features</p>
                </div>
              </div>
              <Button className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white h-9 text-sm">
                Upgrade Now <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          <div className="flex-shrink-0 space-y-2.5 pt-4 border-t border-white/10 mt-4">
            <Button variant="ghost" className="w-full justify-start text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all h-10">
              <HelpCircle className="mr-3 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all h-10">
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        {/* CENTER — keep panes mounted & swap with `hidden` */}
        <div className="col-span-8 space-y-0">
          <div hidden={center !== "shops"} aria-hidden={center !== "shops"}>
            <CenterShops
              cardClass={CARD}
              shop={shop}
              staffs={shop.staffs}
              dailyTasks={dailyTasks}
              onAddTask={handleAddDayTask}
              onViewMoreTasks={goTasks}
              onViewMoreStaff={goStaff}
            />
          </div>

          <div hidden={center !== "analytics"} aria-hidden={center !== "analytics"}>
            <CenterAnalytics cardClass={CARD} shop={shop} />
          </div>

          <div hidden={center !== "reports"} aria-hidden={center !== "reports"}>
            <CenterReports cardClass={CARD} shop={shop} />
          </div>

          <div hidden={center !== "messages"} aria-hidden={center !== "messages"}>
            <CenterMessages cardClass={CARD} shop={shop} />
          </div>

          <div hidden={center !== "data"} aria-hidden={center !== "data"}>
            <CenterDataImport cardClass={CARD} shop={shop} />
          </div>

          <div hidden={center !== "tasks"} aria-hidden={center !== "tasks"}>
            <CenterTasksDetail cardClass={CARD} shop={shop} dailyTasks={dailyTasks} onBack={goShops} />
          </div>

          <div hidden={center !== "staff"} aria-hidden={center !== "staff"}>
            <CenterStaffDetail cardClass={CARD} shop={shop} staffs={shop.staffs} onBack={goShops} />
          </div>

          <div hidden={center !== "activity"} aria-hidden={center !== "activity"}>
            <CenterActivityDetail cardClass={CARD} activities={activityFeed} onBack={goShops} />
          </div>

          <div hidden={center !== "ai"} aria-hidden={center !== "ai"}>
            <CenterAIResult
              cardClass={CARD}
              ai={aiState}
              shop={shop}
              onBack={goShops}
              onCollapse={collapseAI}
            />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <Card className={`col-span-2 ${CARD} p-5 h-fit`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">Quick Actions</p>
              <Button onClick={() => setAddOpen(true)} className="h-9 bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Staff
              </Button>
            </div>

            {/* Recent Activity (Top 3) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-white">Recent Activity</h3>
                <Button size="sm" variant="ghost" className="h-8 text-white/80 hover:bg-white/10" onClick={goActivity}>
                  View more
                </Button>
              </div>
              <div className="space-y-3">
                {activityFeed.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 bg-black/40 rounded-xl border border-white/10">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "success" ? "bg-green-400" : activity.type === "info" ? "bg-blue-400" : "bg-white/60"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white truncate" title={activity.title}>{activity.title}</p>
                      <p className="text-[11px] text-white/60">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Top Performers</h3>
              <div className="space-y-3">
                {shop.staffs
                  .slice()
                  .sort((a, b) => b.tasksCompleted - a.tasksCompleted)
                  .slice(0, 3)
                  .map((staff, i) => (
                    <div key={staff.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-white/10 text-white text-xs">
                            {staff.role.split(" ").map((w) => w[0]).join("").toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{staff.role}</p>
                          <p className="text-[11px] text-white/60">{staff.tasksCompleted} tasks</p>
                        </div>
                      </div>
                      <Badge className="bg-white/10 text-white border-white/20">#{i + 1}</Badge>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Add Staff Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-black/70 border border-white/10 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Staff</DialogTitle>
            <DialogDescription className="text-white/60">
              Add a staff member to {shop.shopName}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddStaff} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70">Role</label>
                <select
                  value={newStaff.role}
                  onChange={(e) => setNewStaff((s) => ({ ...s, role: e.target.value }))}
                  className="mt-1 h-10 w-full rounded-md bg-black/40 border border-white/20 text-white px-3"
                >
                  {["Cashier", "Supervisor", "Stock Associate", "Security", "Sales Associate"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/70">Phone</label>
                <Input
                  value={newStaff.phoneNumber || ""}
                  onChange={(e) => setNewStaff((s) => ({ ...s, phoneNumber: e.target.value }))}
                  placeholder="+91 ..."
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-white/70">Status</label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff((s) => ({ ...s, status: e.target.value as Staff["status"] }))}
                  className="mt-1 h-10 w-full rounded-md bg-black/40 border border-white/20 text-white px-3"
                >
                  {["active", "inactive", "on_leave"].map((s) => (
                    <option key={s} value={s}>{s.replace("_", " ")}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-white/70">Start</label>
                <Input
                  value={newStaff.startTime || ""}
                  onChange={(e) => setNewStaff((s) => ({ ...s, startTime: e.target.value }))}
                  placeholder="09:00"
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/70">End</label>
                <Input
                  value={newStaff.endTime || ""}
                  onChange={(e) => setNewStaff((s) => ({ ...s, endTime: e.target.value }))}
                  placeholder="17:00"
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-white/70">Salary (₹)</label>
                <Input
                  type="number"
                  value={Number(newStaff.salary || 0)}
                  onChange={(e) => setNewStaff((s) => ({ ...s, salary: Number(e.target.value) }))}
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
              <div>
                <label className="text-xs text-white/70">Skills (comma separated)</label>
                <Input
                  value={(newStaff.skillset as string[])?.join(", ") || ""}
                  onChange={(e) =>
                    setNewStaff((s) => ({ ...s, skillset: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) }))
                  }
                  placeholder="POS, Inventory"
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" className="text-white/80 hover:bg-white/10" onClick={() => setAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                Add Staff
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* AI Prompt Dock */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100vw-2rem),44rem)]">
        <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-2.5">
          <form onSubmit={askAI} className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Work-kar Assistant
            </div>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ask: "Give todays summary", "Optimal employee for inventory", "Create a schedule"...'
              className="flex-1 h-9 bg-black/40 border border-white/15 text-white placeholder:text-white/40"
            />
            <Button
              type="submit"
              disabled={isThinking || !prompt.trim()}
              className="h-9 bg-white/10 hover:bg-white/20 border border-white/20 text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {isThinking ? "Asking..." : "Ask"}
            </Button>

            {center === "ai" && (
              <Button type="button" onClick={collapseAI} title="Hide result" className="h-9 bg-white/5 hover:bg-white/15 text-white border border-white/10">
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </form>

          {/* We still show raw response area only when *not* in AI center (to keep things tidy). */}
        </div>
      </div>
    </div>
  )
}
