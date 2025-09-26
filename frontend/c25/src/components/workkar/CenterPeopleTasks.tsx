"use client"

import { useState, FormEvent } from "react"
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
  Bell,
  Plus,
  HelpCircle,
  LogOut,
  Crown,
  ChevronRight,
  Send,
  Sparkles,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Middle-section components
import CenterShops from "@/components/workkar/CenterShops"
import CenterAnalytics from "@/components/workkar/CenterAnalytics"
import CenterReports from "@/components/workkar/CenterReports"
import CenterMessages from "@/components/workkar/CenterMessages"
import CenterDataImport from "@/components/workkar/CenterDataImport"
import CenterTasksDetail from "@/components/workkar/CenterTasksDetail"
import CenterStaffDetail from "@/components/workkar/CenterStaffDetail"

const CARD = "backdrop-blur-xl bg-black/50 border border-white/10 rounded-3xl"

// ---- Seed data & types
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

const seedShop: Shop = {
  id: "shop-001",
  shopName: "Work-kar Demo - Koramangala",
  startTime: "09:00",
  endTime: "21:00",
  staffs: [
    { id: "shop-001-staff-001", phoneNumber: "+91 97468 782554", role: "Cashier", status: "active", startTime: "09:00", endTime: "17:00", skillset: ["Merchandising", "Baking", "Inventory"], tasksCompleted: 27, salary: 32000, day: [] },
    { id: "shop-001-staff-002", phoneNumber: "+91 97101 202163", role: "Supervisor", status: "inactive", startTime: "12:00", endTime: "20:00", skillset: ["Inventory", "Electronics", "POS", "Merchandising"], tasksCompleted: 25, salary: 22000, day: [] },
    { id: "shop-001-staff-003", phoneNumber: "+91 99137 708064", role: "Stock Associate", status: "on_leave", startTime: "13:00", endTime: "22:00", skillset: ["Merchandising", "Inventory", "Cooking"], tasksCompleted: 23, salary: 27500, day: [] },
    { id: "shop-001-staff-004", phoneNumber: "+91 96878 815887", role: "Security", status: "on_leave", startTime: "09:00", endTime: "18:00", skillset: ["Customer Service", "Inventory", "Returns Handling"], tasksCompleted: 28, salary: 34000, day: [] },
    { id: "shop-001-staff-005", phoneNumber: "+91 93659 215268", role: "Sales Associate", status: "on_leave", startTime: "08:00", endTime: "17:00", skillset: ["POS", "Inventory", "Returns Handling", "Electronics"], tasksCompleted: 22, salary: 22000, day: [] },
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

type TabKey = "shops" | "analytics" | "reports" | "messages" | "data" | "tasks" | "staff"

export default function DashboardPage() {
  // App state
  const [shop, setShop] = useState<Shop>(seedShop)
  const [dailyTasks, setDailyTasks] = useState<DayTask[]>(seedTasks)
  const [active, setActive] = useState<TabKey>("shops")

  // ---- Add Staff Dialog
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

  const submitAddStaff = (e?: FormEvent) => {
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
    }
    setShop((prev) => ({ ...prev, staffs: [...prev.staffs, staff] }))
    setAddOpen(false)
    setNewStaff({
      role: "Cashier",
      phoneNumber: "",
      status: "active",
      startTime: "09:00",
      endTime: "17:00",
      salary: 20000,
      skillset: [],
    })
  }

  // ---- AI prompt dock (wired to /ai)
  const [prompt, setPrompt] = useState("")
  const [aiReply, setAiReply] = useState<string | null>(null)
  const [isThinking, setIsThinking] = useState(false)

  const handleAsk = async (e?: FormEvent) => {
    e?.preventDefault()
    const q = prompt.trim()
    if (!q) return
    setIsThinking(true)
    setAiReply(null)
    try {
      const headers: Record<string, string> = {
        Accept: "*/*",
        "Content-Type": "application/json",
      }
      const res = await fetch("http://localhost:3000/ai", {
        method: "POST",
        headers,
        body: JSON.stringify({ prompt: q }),
      })
      const text = await res.text()
      setAiReply(text || "(empty response)")
    } catch (err: any) {
      setAiReply(`Request failed: ${err?.message ?? "unknown error"}`)
    } finally {
      setIsThinking(false)
      setPrompt("")
    }
  }

  const menu = [
    { key: "shops", icon: Store, label: "Shops" },
    { key: "analytics", icon: TrendingUp, label: "Analytics" },
    { key: "reports", icon: FileText, label: "Reports" },
    { key: "messages", icon: MessageSquare, label: "Messages" },
    { key: "data", icon: Database, label: "Data Import" },
  ] as const

  // Child handlers
  const handleAddDayTask = (task: DayTask) => setDailyTasks((prev) => [...prev, task])
  const goToTasks = () => setActive("tasks")
  const goToStaff = () => setActive("staff")

  return (
    <div className="h-screen relative overflow-hidden">
      {/* Main grid — padded bottom so AI dock doesn't overlap */}
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
                  const isActive = active === item.key
                  return (
                    <Button
                      key={item.key}
                      variant="ghost"
                      onClick={() => setActive(item.key as TabKey)}
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

            {/* Premium (ONLY here) */}
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

        {/* MIDDLE SECTION (switches by tab) */}
        <div className="col-span-8">
          {active === "shops" && (
            <CenterShops
              cardClass={CARD}
              shop={shop}
              staffs={shop.staffs}
              dailyTasks={dailyTasks}
              onAddTask={handleAddDayTask}
              onViewMoreTasks={goToTasks}
              onViewMoreStaff={goToStaff}
            />
          )}
          {active === "analytics" && <CenterAnalytics cardClass={CARD} shop={shop} />}
          {active === "reports" && <CenterReports cardClass={CARD} shop={shop} />}
          {active === "messages" && <CenterMessages cardClass={CARD} shop={shop} />}
          {active === "data" && <CenterDataImport cardClass={CARD} shop={shop} />}
          {active === "tasks" && (
            <CenterTasksDetail cardClass={CARD} shop={shop} dailyTasks={dailyTasks} />
          )}
          {active === "staff" && (
            <CenterStaffDetail cardClass={CARD} shop={shop} staffs={shop.staffs} />
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <Card className={`col-span-2 ${CARD} p-5 h-fit`}>
          <div className="space-y-4">
            {/* Header with Add Staff (opens dialog) */}
            <div className="flex items-center justify-between">
              <p className="text-white/70 text-sm">Quick Actions</p>
              <Button onClick={() => setAddOpen(true)} className="h-9 bg-white/10 hover:bg-white/20 border border-white/20 text-white">
                <Plus className="h-4 w-4 mr-1.5" />
                Add Staff
              </Button>
            </div>

            {/* Recent Activity */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Recent Activity 📈</h3>
              <div className="space-y-3">
                {[
                  { action: "Shift schedule updated", time: "2 min ago", type: "success" },
                  { action: "New staff added", time: "1 hour ago", type: "success" },
                  { action: "Payroll processed", time: "3 hours ago", type: "info" },
                  { action: "Task assigned", time: "5 hours ago", type: "default" },
                ].map((activity, idx) => (
                  <div key={idx} className="flex items-center space-x-3 p-3 bg-black/40 rounded-xl border border-white/10">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "success" ? "bg-green-400" : activity.type === "info" ? "bg-blue-400" : "bg-white/60"
                      }`}
                    />
                    <div className="flex-1">
                      <p className="text-sm text-white">{activity.action}</p>
                      <p className="text-[11px] text-white/60">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Top Performers 🏆</h3>
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

          <form onSubmit={submitAddStaff} className="space-y-3">
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

      {/* AI Prompt Dock (calls /ai) */}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 w-[min(calc(100vw-2rem),44rem)]">
        <div className="backdrop-blur-xl bg-black/60 border border-white/10 rounded-2xl p-2.5">
          <form onSubmit={handleAsk} className="flex items-center gap-2">
            <div className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] text-white/70">
              <Sparkles className="h-3.5 w-3.5" />
              Work-kar Assistant
            </div>
            <Input
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder='Ask: "Give todays summary", "Who is on leave?"...'
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
          </form>

          {(isThinking || aiReply) && (
            <div className="mt-2 rounded-md border border-white/10 bg-black/50 p-2.5">
              <p className="text-[10px] uppercase tracking-wide text-white/50 mb-1">Response</p>
              <div className="text-sm text-white whitespace-pre-wrap min-h-[1.25rem]">
                {isThinking ? "Thinking…" : aiReply}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
