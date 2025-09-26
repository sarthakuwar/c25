"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"
import type { Activity } from "@/app/dashboard/page"

type Props = {
  cardClass: string
  activities: Activity[]
  onBack: () => void
}

export default function CenterActivityDetail({ cardClass, activities, onBack }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-9 px-3 text-white/80 hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">Activity</h2>
          </div>
          <div className="text-white/60 text-sm">History</div>
        </div>
      </Card>

      <Card className={`${cardClass} p-5`}>
        <div id="activityScroll" className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
             style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}>
          {activities.map((a) => (
            <div key={a.id} className="flex items-center space-x-3 p-3 bg-black/40 rounded-xl border border-white/10">
              <div
                className={`w-2 h-2 rounded-full ${
                  a.type === "success" ? "bg-green-400" : a.type === "info" ? "bg-blue-400" : "bg-white/60"
                }`}
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate" title={a.title}>{a.title}</p>
                <p className="text-[11px] text-white/60">{a.time}</p>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Scoped scrollbar for WebKit */}
      <style jsx>{`
        #activityScroll::-webkit-scrollbar { width: 8px; }
        #activityScroll::-webkit-scrollbar-track { background: transparent; }
        #activityScroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 9999px;
        }
        #activityScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
