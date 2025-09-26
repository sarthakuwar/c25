export type TaskStatus = "upcoming" | "in_progress" | "done"

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number)
  return h * 60 + m
}

export function decorateTasksWithStatus<T extends { start: string; end: string; status?: TaskStatus; progress?: number }>(
  tasks: T[],
  now: Date = new Date()
): (T & { status: TaskStatus; progress: number })[] {
  const nowMin = now.getHours() * 60 + now.getMinutes()
  return tasks.map((t) => {
    if (t.status !== undefined && t.progress !== undefined) return t as T & { status: TaskStatus; progress: number }
    const s = toMin(t.start)
    const e = toMin(t.end)
    const status: TaskStatus = nowMin < s ? "upcoming" : nowMin > e ? "done" : "in_progress"
    const progress = status === "upcoming" ? 0 : status === "done" ? 100 : Math.max(5, Math.min(95, Math.round(((nowMin - s) / (e - s)) * 100)))
    return { ...t, status, progress }
  })
}

export function getStaffStatusBadge(status: "active" | "inactive" | "on_leave") {
  const map: Record<string, { color: string; label: string }> = {
    active: { color: "bg-green-500/20 text-green-400 border-green-400/30", label: "Active" },
    inactive: { color: "bg-gray-500/20 text-gray-400 border-gray-400/30", label: "Inactive" },
    on_leave: { color: "bg-yellow-500/20 text-yellow-400 border-yellow-400/30", label: "On Leave" },
  }
  return map[status] || map.inactive
}
