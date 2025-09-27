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
  Database,
  Plus,
  HelpCircle,
  LogOut,
  Crown,
  ChevronRight,
  Send,
  Sparkles,
  ChevronDown,
  Boxes,
  Banknote,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// 👇 Import translated pages (adjust paths if needed)
import DashboardPageHindi from "./dash-hin"
import DashboardPageMarathi from "./dash-mar"

// Center panes
import CenterShops from "@/components/workkar/CenterShops"
import CenterAnalytics from "@/components/workkar/CenterAnalytics"
import CenterReports from "@/components/workkar/CenterReports"
import CenterDataImport from "@/components/workkar/CenterDataImport"
import CenterTasksDetail from "@/components/workkar/CenterTasksDetail"
import CenterStaffDetail from "@/components/workkar/CenterStaffDetail"
import CenterActivityDetail from "@/components/workkar/CenterActivityDetail"
import CenterAIResult, { AIKind } from "@/components/workkar/CenterAIResult"
import CenterInventory from "@/components/workkar/CenterInventory"
import CenterAISuggestions from "@/components/workkar/CenterAISuggestions"
import CenterFinancials from "@/components/workkar/CenterFinancials"

// Inventory dataset
import { inventoryData, type InventoryItem } from "@/components/workkar/inventoryData"

const CARD = "backdrop-blur-xl bg-black/50 border border-white/10 rounded-3xl"

/* -------------------- Types -------------------- */
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

/* -------------------- Seeds -------------------- */
const seedShop: Shop = {
  id: "shop-001",
  shopName: "Work-kar Demo - Koramangala",
  startTime: "09:00",
  endTime: "21:00",
  staffs: [
    { id: "shop-001-staff-001", phoneNumber: "+91 74985 23422", role: "Cashier", status: "active", startTime: "09:00", endTime: "17:00", skillset: ["Merchandising", "Baking", "Inventory"], tasksCompleted: 27, salary: 32000, day: [], name: "Cashier" },
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

/* -------------------- Page -------------------- */
type CenterKey =
  | "shops"
  | "analytics"
  | "reports"
  | "inventory"
  | "financials"
  | "data"
  | "tasks"
  | "staff"
  | "activity"
  | "ai"
  | "ai_suggestions"

export default function DashboardPageEnglish() {
  // 🔤 Language selector state (keep hooks at the top; do NOT early return yet)
  const [lang, setLang] = useState<"en" | "hi" | "mr">("en")

  // Global state (English page)
  const [shop, setShop] = useState<Shop>(seedShop)
  const [dailyTasks, setDailyTasks] = useState<DayTask[]>(seedTasks)
  const [activityFeed] = useState<Activity[]>(seedActivities)
  const [inventory, setInventory] = useState<InventoryItem[]>(inventoryData)

  const [center, setCenter] = useState<CenterKey>("shops")
  const [prevCenter, setPrevCenter] = useState<CenterKey>("shops")

  // Add Staff dialog
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

  // Apply schedule from AI (replace existing dailyTasks)
  const applyScheduleFromAI = useCallback((tasks: DayTask[]) => {
    setDailyTasks(tasks)
    setCenter("tasks")
  }, [])

  // Center navigation
  const goCenter = useCallback((k: CenterKey) => startTransition(() => setCenter(k)), [])
  const goShops = useCallback(() => goCenter("shops"), [goCenter])
  const goTasks = useCallback(() => goCenter("tasks"), [goCenter])
  const goStaff = useCallback(() => goCenter("staff"), [goCenter])
  const goActivity = useCallback(() => goCenter("activity"), [goCenter])
  const goAnalytics = useCallback(() => goCenter("analytics"), [goCenter])
  const goReports = useCallback(() => goCenter("reports"), [goCenter])
  const goInventory = useCallback(() => goCenter("inventory"), [goCenter])
  const goFinancials = useCallback(() => goCenter("financials"), [goCenter])
  const goData = useCallback(() => goCenter("data"), [goCenter])
  const goAISuggestions = useCallback(() => goCenter("ai_suggestions"), [goCenter])

  // Sidebar menu
  const menu = useMemo(() => ([
    { key: "shops" as const, icon: Store, label: "Shops", onClick: goShops },
    { key: "analytics" as const, icon: TrendingUp, label: "Analytics", onClick: goAnalytics },
    { key: "reports" as const, icon: FileText, label: "Reports", onClick: goReports },
    { key: "inventory" as const, icon: Boxes, label: "Inventory", onClick: goInventory },
    { key: "financials" as const, icon: Banknote, label: "Financials", onClick: goFinancials },
  ]), [goShops, goAnalytics, goReports, goInventory, goFinancials, goData])

  /* -------------------- AI dock + caching -------------------- */
  type AIState = {
    raw: string
    data: any
    kind: AIKind
    prompt: string
    parseError?: string
  } | null

  const [aiState, setAiState] = useState<AIState>(null)
  const [lastAiState, setLastAiState] = useState<AIState>(null)

  const guessKindFromPrompt = (p: string): AIKind | "auto" => {
    const s = p.toLowerCase()
    if (s.includes("optimal employee")) return "optimal_staff"
    if (s.includes("create a schedule") || s.includes("generate a fresh task schedule")) return "schedule"
    if (s.includes("summary")) return "summary"
    return "auto"
  }
  const inferKindFromData = (data: any): AIKind => {
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === "object" && ("task" in data[0] || "tasks" in data[0]) && ("staff" in data[0] || "staffId" in data[0])) {
        return "schedule"
      }
      if (data.length && typeof data[0] === "object" && ("role" in data[0]) && ("status" in data[0])) {
        return "optimal_staff"
      }
      if (data.length && (("summary" in data[0]) || ("status" in data[0] && ("task" in data[0] || "title" in data[0])))) {
        return "summary"
      }
    } else if (data && typeof data === "object") {
      if ("summary" in data) return "summary"
    }
    return "summary"
  }
  const extractJson = (text: string) => {
    const codeBlock = text.match(/```(?:json)?\s*([\s\S]*?)```/i)
    return codeBlock ? codeBlock[1].trim() : text.trim()
  }

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

      const result: AIState = { raw: text, data: parsed, kind, prompt: q, ...(parseError ? { parseError } : {}) }
      setAiState(result)
      setLastAiState(result)
      setPrevCenter((c) => (c === "ai" ? "shops" : c))
      setCenter("ai")
    } catch (err) {
      const result: AIState = { raw: "Request failed", data: null, kind: "summary", prompt: q, parseError: (err as any)?.message ?? "unknown error" }
      setAiState(result)
      setLastAiState(result)
      setPrevCenter((c) => (c === "ai" ? "shops" : c))
      setCenter("ai")
    } finally {
      setIsThinking(false)
      setPrompt("")
    }
  }, [prompt])

  const collapseAI = useCallback(() => setCenter(prevCenter), [prevCenter])
  const showLastAI = useCallback(() => {
    if (!lastAiState) return
    setAiState(lastAiState)
    setPrevCenter((c) => (c === "ai" ? "shops" : c))
    setCenter("ai")
  }, [lastAiState])

  /* -------------------- AI Suggestions (inventory lows) -------------------- */
  const suggestionsAll = useMemo(() => {
    return inventory
      .map((it) => ({
        ...it,
        shortageRatio: it.reorderLevel === 0 ? 1 : it.stock / it.reorderLevel,
        critical: it.stock <= it.reorderLevel,
      }))
      .filter((x) => x.critical)
      .sort((a, b) => a.shortageRatio - b.shortageRatio)
  }, [inventory])

  const currentSuggestion = suggestionsAll[0]

  /* -------------------- Language handoff (AFTER all hooks have run) -------------------- */
  if (lang === "hi") {
    return <DashboardPageHindi />
  }
  if (lang === "mr") {
    return <DashboardPageMarathi />
  }

  /* -------------------- Render (English) -------------------- */
  return (
    <div className="h-screen relative overflow-hidden">
      {/* Main grid */}
      <div className="relative z-10 p-4 grid grid-cols-12 gap-4 h-screen pb-20">
        {/* LEFT SIDEBAR */}
        <Card className={`col-span-2 ${CARD} p-4 h-fit flex flex-col`}>
          <div className="space-y-4">
            <div className="text-center">
              <h1 className="text-xl font-bold text-white">Work-kar</h1>
              <p className="text-white/60 text-xs">Staff Management</p>
            </div>

            {/* Language selector (navbar/left sidebar) */}
            <div className="mt-1">
              <label className="text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-2 block">
                Language
              </label>
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value as "en" | "hi" | "mr")}
                className="h-9 w-full rounded-md bg-black/40 border border-white/20 text-white px-3"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
            </div>

            <div>
              <h4 className="text-white/80 text-[11px] font-semibold uppercase tracking-wider mb-2">Workspace</h4>
              <nav className="space-y-1.5">
                {menu.map((item) => {
                  const Icon = item.icon
                  const isActive = center === item.key
                  return (
                    <Button
                      key={item.key}
                      variant="ghost"
                      onClick={() => setCenter(item.key)}
                      className={`w-full justify-start text-[13px] text-white/80 hover:bg-white/10 hover:text-white transition-all h-9 ${
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
            <Card className="bg-black/60 border border-white/20 rounded-2xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/10 grid place-items-center border border-white/10">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm">Go Premium</h4>
                  <p className="text-[11px] text-white/70">Unlock advanced features</p>
                </div>
              </div>
              <Button className="mt-3 w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white h-8 text-sm">
                Upgrade Now <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </Card>
          </div>

          <div className="flex-shrink-0 space-y-2 pt-3 border-t border-white/10 mt-3">
            <Button variant="ghost" className="w-full justify-start text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all h-8">
              <HelpCircle className="mr-3 h-4 w-4" />
              Contact Support
            </Button>
            <Button variant="ghost" className="w-full justify-start text-sm text-white/80 hover:bg-white/10 hover:text-white transition-all h-8">
              <LogOut className="mr-3 h-4 w-4" />
              Logout
            </Button>
          </div>
        </Card>

        {/* CENTER panes */}
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

          <div hidden={center !== "inventory"} aria-hidden={center !== "inventory"}>
            <CenterInventory cardClass={CARD} items={inventory} />
          </div>

          <div hidden={center !== "financials"} aria-hidden={center !== "financials"}>
            <CenterFinancials cardClass={CARD} shop={shop} items={inventory} />
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
              onAcceptSchedule={applyScheduleFromAI}
            />
          </div>

          <div hidden={center !== "ai_suggestions"} aria-hidden={center !== "ai_suggestions"}>
            <CenterAISuggestions cardClass={CARD} suggestions={suggestionsAll} onBack={goShops} />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <Card className={`col-span-2 ${CARD} p-4 h-fit`}>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">Quick Actions</p>
              <Button onClick={() => setAddOpen(true)} className="h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Staff
              </Button>
            </div>

            {/* Recent Activity (Top 3) */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xl font-semibold text-white">Recent Activity</h3>
                <Button size="sm" variant="ghost" className="h-8 text-white/80 hover:bg-white/10" onClick={goActivity}>
                  View more
                </Button>
              </div>
              <div className="space-y-2.5">
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

            {/* AI Suggestions — single most critical + View more */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-xl font-semibold text-white">AI Suggestions</h3>
                <Button size="sm" variant="ghost" className="h-8 text-white/80 hover:bg-white/10" onClick={goAISuggestions}>
                  View more
                </Button>
              </div>

              {!currentSuggestion ? (
                <p className="text-white/70 text-sm">No restock suggestions right now.</p>
              ) : (
                <div className="p-3.5 bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center justify-between">
                    <p className="text-base text-white truncate" title={currentSuggestion.name}>{currentSuggestion.name}</p>
                    <Badge className="bg-white/10 text-white border-white/20">SKU {currentSuggestion.sku}</Badge>
                  </div>
                  <p className="text-xs text-white/60 mt-0.5">
                    Stock {currentSuggestion.stock}/{currentSuggestion.reorderLevel} • Supplier: {currentSuggestion.supplier}
                  </p>
                  <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                    <div
                      className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-yellow-400"
                      style={{
                        width: `${Math.min(100, Math.max(5, (currentSuggestion.stock / Math.max(1, currentSuggestion.reorderLevel)) * 100))}%`,
                      }}
                    />
                  </div>
                </div>
              )}
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
                  className="mt-1 h-9 w-full rounded-md bg-black/40 border border-white/20 text-white px-3"
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
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-white/70">Status</label>
                <select
                  value={newStaff.status}
                  onChange={(e) => setNewStaff((s) => ({ ...s, status: e.target.value as Staff["status"] }))}
                  className="mt-1 h-9 w-full rounded-md bg-black/40 border border-white/20 text-white px-3"
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
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
                />
              </div>
              <div>
                <label className="text-xs text-white/70">End</label>
                <Input
                  value={newStaff.endTime || ""}
                  onChange={(e) => setNewStaff((s) => ({ ...s, endTime: e.target.value }))}
                  placeholder="17:00"
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
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
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
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
                  className="mt-1 bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
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

      {/* AI Prompt Dock + Last result pill */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100vw-2rem),44rem)]">
        {lastAiState && center !== "ai" && (
          <div className="mb-2 flex justify-center">
            <button
              onClick={showLastAI}
              className="px-3 py-1 rounded-full text-xs text-white bg-white/10 border border-white/15 hover:bg-white/20 transition"
            >
              Show last result
            </button>
          </div>
        )}

        <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-2">
          <form onSubmit={askAI} className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Work-kar Assistant
            </div>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ask: "Give todays summary", "Optimal employee for inventory", "Create a schedule"...'
              className="flex-1 h-8 bg-black/40 border border-white/15 text-white placeholder:text-white/40"
            />
            <Button
              type="submit"
              disabled={isThinking || !prompt.trim()}
              className="h-8 bg-white/10 hover:bg-white/20 border border-white/20 text-white disabled:opacity-60"
            >
              <Send className="h-4 w-4 mr-1.5" />
              {isThinking ? "Asking..." : "Ask"}
            </Button>

            {center === "ai" && (
              <Button type="button" onClick={collapseAI} title="Hide result" className="h-8 bg-white/5 hover:bg-white/15 text-white border border-white/10">
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}