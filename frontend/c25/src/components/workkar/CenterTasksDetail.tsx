"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, CheckCircle, Target, ChevronLeft } from "lucide-react"
import type { DayTask } from "@/app/dashboard/page"
import { decorateTasksWithStatus } from "./utils"
import { Button } from "@/components/ui/button"

type Props = {
  cardClass: string
  shop: { id: string; shopName: string; startTime: string; endTime: string }
  dailyTasks: DayTask[]
  onBack: () => void
}

export default function CenterTasksDetail({ cardClass, shop, dailyTasks, onBack }: Props) {
  const tasks = decorateTasksWithStatus(dailyTasks).sort((a, b) => a.start.localeCompare(b.start))

  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-9 px-3 text-white/80 hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">Tasks</h2>
          </div>
          <div className="text-white/60 text-sm">
            {shop.shopName} • {new Date().toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" })}
          </div>
        </div>
      </Card>

      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-white/70" />
          <h3 className="text-lg font-semibold text-white">Today’s Schedule</h3>
        </div>

        <div id="tasksScroll" className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
             style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}>
          {tasks.map((t) => (
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
                  <Badge
                    className={
                      "text-[10px] " +
                      (t.status === "done"
                        ? "bg-green-500/20 text-green-300 border-green-400/30"
                        : t.status === "in_progress"
                        ? "bg-blue-500/20 text-blue-300 border-blue-400/30"
                        : "bg-white/10 text-white/70 border-white/20")
                    }
                  >
                    {t.status?.replace("_", " ")}
                  </Badge>
                </div>
              </div>

              <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400"
                  style={{ width: `${t.progress ?? 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scoped scrollbar for WebKit */}
      <style jsx>{`
        #tasksScroll::-webkit-scrollbar { width: 8px; }
        #tasksScroll::-webkit-scrollbar-track { background: transparent; }
        #tasksScroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 9999px;
        }
        #tasksScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
