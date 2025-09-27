"use client"

import { useMemo, useState, useEffect, FormEvent } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, IndianRupee, CheckCircle, Target, Calendar, ListPlus } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Staff, DayTask } from "@/app/dashboard/page"
import { decorateTasksWithStatus, getStaffStatusBadge } from "./utils"
import { Textarea } from "@/components/ui/textarea"

// === Client-side SMS config (intentionally exposed per your request) ===
const HTTPSMS_API_KEY =
  "HIppOXq09XlgtOmn1aR1fTa1oRQJM0Edg8jdoAw0C1DaWCNCDp009Ql0OUXFz_Yg"
const DEFAULT_FROM_NUMBER = "+919653268068"

type Props = {
  cardClass: string
  shop: {
    id: string
    shopName: string
    startTime: string
    endTime: string
  }
  staffs: Staff[]
  dailyTasks: DayTask[]
  onAddTask: (task: DayTask) => void
  onViewMoreTasks: () => void
  onViewMoreStaff: () => void
}

export default function CenterShops({
  cardClass,
  shop,
  staffs,
  dailyTasks,
  onAddTask,
  onViewMoreTasks,
  onViewMoreStaff,
}: Props) {
  const activeStaff = useMemo(() => staffs.filter((s) => s.status === "active"), [staffs])
  const totalPayroll = useMemo(() => staffs.reduce((sum, s) => sum + s.salary, 0), [staffs])
  const tasksWithStatus = decorateTasksWithStatus(dailyTasks).sort((a, b) => a.start.localeCompare(b.start))

  // Add Task modal
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [newTask, setNewTask] = useState<Required<Omit<DayTask, "id">>>({
    title: "",
    start: "10:00",
    end: "10:30",
    assignee: "Supervisor",
    priority: "Medium",
    status: "upcoming",
    progress: 0,
  })

  // --- SMS state (lightweight controls) ---
  const [smsFrom, setSmsFrom] = useState<string>(DEFAULT_FROM_NUMBER)
  const [smsContent, setSmsContent] = useState<string>("") // auto-generated, editable

  // Build a sensible default SMS whenever task fields change
  useEffect(() => {
    const lines = [
      `New Task Assigned`,
      `Shop: ${shop.shopName}`,
      `Title: ${newTask.title || "(no title)"}`,
      `When: ${newTask.start} – ${newTask.end} today`,
      `Role: ${newTask.assignee}`,
      newTask.priority ? `Priority: ${newTask.priority}` : null,
    ].filter(Boolean)
    setSmsContent(lines.join("\n"))
  }, [shop.shopName, newTask.title, newTask.start, newTask.end, newTask.assignee, newTask.priority])

  // Pick recipients based on assignee
  function getSmsRecipients(): string[] {
    if (newTask.assignee === "All") {
      return activeStaff
        .filter((s) => !!s.phoneNumber)
        .map((s) => s.phoneNumber!) // non-null after filter
    }
    const match = activeStaff.find(
      (s) => s.role === newTask.assignee && !!s.phoneNumber
    )
    return match?.phoneNumber ? [match.phoneNumber] : []
  }

  async function sendSmsToRecipients(content: string, fromNum: string, toNumbers: string[]) {
    if (!toNumbers.length) return { sent: 0, failed: 0 }

    const headersList = {
      Accept: "*/*",
      "x-api-key": HTTPSMS_API_KEY,
      "Content-Type": "application/json",
    } as const

    const results = await Promise.allSettled(
      toNumbers.map((to) =>
        fetch("https://api.httpsms.com/v1/messages/send", {
          method: "POST",
          headers: headersList,
          body: JSON.stringify({
            content,
            encrypted: false,
            from: fromNum,
            to,
          }),
        }).then(async (r) => {
          const text = await r.text()
          if (!r.ok) throw new Error(`(${r.status}) ${text}`)
          return text
        })
      )
    )

    const sent = results.filter((r) => r.status === "fulfilled").length
    const failed = results.length - sent
    return { sent, failed }
  }

  const addTask = async (e?: FormEvent) => {
    e?.preventDefault()
    if (!newTask.title.trim()) {
      alert("Please enter a task title.")
      return
    }
    setSubmitting(true)
    try {
      const p = Math.max(0, Math.min(100, newTask.progress))
      const taskPayload: DayTask = { id: `task-${Date.now()}`, ...newTask, progress: p }

      // 1) Add to schedule
      onAddTask(taskPayload)

      // 2) Send SMS (to matching assignee(s))
      const recipients = getSmsRecipients()
      if (recipients.length === 0) {
        // No phone found — just inform quietly
        console.warn("No SMS recipients found for assignee:", newTask.assignee)
      } else {
        const { sent, failed } = await sendSmsToRecipients(smsContent, smsFrom, recipients)
        if (failed > 0 && sent === 0) {
          alert(`Task added, but SMS failed to send to ${failed} recipient(s).`)
        } else if (failed > 0) {
          alert(`Task added. SMS sent to ${sent}, failed for ${failed}.`)
        } else {
          console.log("All SMS sent successfully to:", recipients)
        }
      }

      // 3) Reset + close
      setTaskModalOpen(false)
      setNewTask({
        title: "",
        start: "10:00",
        end: "10:30",
        assignee: "Supervisor",
        priority: "Medium",
        status: "upcoming",
        progress: 0,
      })
    } catch (err: any) {
      console.error("Add task / SMS error:", err)
      alert(err?.message ?? "Failed to add task / send SMS.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <Card className={`${cardClass} p-4`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white leading-tight">Dashboard</h2>
            <p className="text-white/60 text-sm">Welcome back! Here's your shop overview</p>
          </div>
          <div className="text-white/60 text-sm">{shop.shopName}</div>
        </div>
      </Card>

      {/* Stats (3 cards) */}
      <div className="grid grid-cols-3 gap-3.5">
        {[
          { title: "Total Staff", value: staffs.length.toString(), change: "+2%", icon: Users, color: "text-blue-400" },
          { title: "Active Staff", value: activeStaff.length.toString(), change: "+5%", icon: CheckCircle, color: "text-green-400" },
          { title: "Monthly Payroll", value: `₹${(totalPayroll / 100000).toFixed(2)}L`, change: "+8%", icon: IndianRupee, color: "text-yellow-400" },
        ].map((stat, i) => (
          <Card key={i} className={`${cardClass} p-3.5`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">{stat.title}</p>
                <p className="text-xl font-bold text-white">{stat.value}</p>
                <p className={`text-xs ${stat.color}`}>{stat.change}</p>
              </div>
              <stat.icon className={`h-6 w-6 ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Staff List + Daily Schedule */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Staff Members */}
        <Card className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-semibold text-white">Staff Members</h3>
            <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10 h-8" onClick={onViewMoreStaff}>
              View more
            </Button>
          </div>

          <div className="space-y-2.5">
            {staffs.slice(0, 3).map((staff) => {
              const statusConfig = getStaffStatusBadge(staff.status)
              return (
                <div key={staff.id} className="flex items-center justify-between p-3 bg-black/40 rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3 flex-1">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-white/10 text-white text-xs font-medium">
                        {staff.role.split(" ").map((w) => w[0]).join("").toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-white text-sm">{staff.role}</p>
                          <p className="text-[11px] text-white/60">
                            {staff.phoneNumber} • {staff.startTime} - {staff.endTime}
                          </p>
                        </div>
                        <div className="text-right ml-3">
                          <p className="font-bold text-white text-sm">₹{staff.salary.toLocaleString("en-IN")}</p>
                          <Badge className={`text-[10px] ${statusConfig.color}`}>{statusConfig.label}</Badge>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {staff.skillset.slice(0, 3).map((skill, idx) => (
                          <span key={idx} className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded">
                            {skill}
                          </span>
                        ))}
                        {staff.skillset.length > 3 && <span className="text-[10px] text-white/60">+{staff.skillset.length - 3} more</span>}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        {/* Daily Schedule */}
        <Card className={`${cardClass} p-4`}>
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2.5">
              <Calendar className="h-5 w-5 text-white/70" />
              <h3 className="text-xl font-semibold text-white">
                Daily Schedule — {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="ghost" className="text-white/80 hover:bg-white/10 h-8" onClick={onViewMoreTasks}>
                View more
              </Button>
              <Button size="sm" className="bg-white/10 hover:bg-white/20 border border-white/20 text-white h-8" onClick={() => setTaskModalOpen(true)}>
                <ListPlus className="h-4 w-4 mr-1" />
                Add Task
              </Button>
            </div>
          </div>

          <div className="space-y-2.5">
            {tasksWithStatus.slice(0, 3).map((t) => (
              <div key={t.id} className="p-3 rounded-xl border border-white/10 bg-black/40">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-white font-medium text-sm truncate">{t.title}</p>
                    <p className="text-[11px] text-white/60">
                      {t.start}–{t.end} • {t.assignee} • Priority: {t.priority}
                    </p>
                  </div>
                  <div className="ml-3 flex items-center gap-2">
                    {t.status === "done" && <CheckCircle className="h-4 w-4 text-green-400" />}
                    {t.status === "in_progress" && <Target className="h-4 w-4 text-blue-400" />}
                  </div>
                </div>

                <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                    style={{ width: `${t.progress ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Add Task Modal */}
      <Dialog open={taskModalOpen} onOpenChange={setTaskModalOpen}>
        <DialogContent className="bg-black/70 border border-white/10 text-white">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
            <DialogDescription className="text-white/60">Create a one-off task for today’s schedule. An SMS will be sent to the assignee.</DialogDescription>
          </DialogHeader>

          <form onSubmit={addTask} className="space-y-4">
            {/* Task fields */}
            <div className="space-y-3">
              <Input
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Task title"
                className="bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
              />
              <div className="grid grid-cols-2 gap-3">
                <Input
                  value={newTask.start}
                  onChange={(e) => setNewTask({ ...newTask, start: e.target.value })}
                  placeholder="Start (HH:MM)"
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
                />
                <Input
                  value={newTask.end}
                  onChange={(e) => setNewTask({ ...newTask, end: e.target.value })}
                  placeholder="End (HH:MM)"
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40 h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="h-9 rounded-md bg-black/40 border border-white/20 text-white px-3"
                >
                  {["Supervisor", "Cashier", "Stock Associate", "Security", "All"].map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as "High" | "Medium" | "Low" })}
                  className="h-9 rounded-md bg-black/40 border border-white/20 text-white px-3"
                >
                  {["High", "Medium", "Low"].map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* SMS section (simple + always on) */}
            <div className="space-y-2 rounded-lg border border-white/10 bg-black/40 p-3">
              <p className="text-sm font-semibold">SMS Notification</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-white/60 mb-1">From</p>
                  <Input
                    value={smsFrom}
                    onChange={(e) => setSmsFrom(e.target.value)}
                    placeholder="+91XXXXXXXXXX"
                    className="h-9 bg-black/40 border-white/20 text-white placeholder:text-white/40"
                  />
                </div>
                <div>
                  <p className="text-xs text-white/60 mb-1">To (auto)</p>
                  <div className="h-9 rounded-md bg-black/30 border border-white/20 px-3 flex items-center text-sm overflow-x-auto whitespace-nowrap">
                    {(() => {
                      const recips = getSmsRecipients()
                      return recips.length
                        ? recips.join(", ")
                        : "No matching recipient found"
                    })()}
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-white/60 mb-1">Message</p>
                <Textarea
                  value={smsContent}
                  onChange={(e) => setSmsContent(e.target.value)}
                  rows={4}
                  className="bg-black/40 border-white/20 text-white placeholder:text-white/40"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="ghost" className="text-white/80 hover:bg-white/10" onClick={() => setTaskModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                disabled={submitting}
              >
                {submitting ? "Adding…" : "Add to Schedule & Send SMS"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
