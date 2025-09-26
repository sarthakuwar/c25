"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Users, ChevronLeft } from "lucide-react"
import type { Staff } from "@/app/dashboard/page"
import { getStaffStatusBadge } from "./utils"
import { Button } from "@/components/ui/button"

type Props = {
  cardClass: string
  shop: { id: string; shopName: string; startTime: string; endTime: string }
  staffs: Staff[]
  onBack: () => void
}

export default function CenterStaffDetail({ cardClass, shop, staffs, onBack }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-9 px-3 text-white/80 hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">Staff</h2>
          </div>
          <div className="text-white/60 text-sm">
            {shop.shopName} • {shop.startTime}–{shop.endTime}
          </div>
        </div>
      </Card>

      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center gap-2 mb-3">
          <Users className="h-5 w-5 text-white/70" />
          <h3 className="text-lg font-semibold text-white">Team</h3>
        </div>

        <div id="staffScroll" className="space-y-3 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1"
             style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}>
          {staffs.map((staff) => {
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
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white text-sm truncate" title={staff.role}>{staff.role}</p>
                        <p className="text-[11px] text-white/60 truncate">
                          {staff.phoneNumber} • {staff.startTime} - {staff.endTime}
                        </p>
                      </div>
                      <div className="text-right ml-3">
                        <p className="font-bold text-white text-sm">₹{staff.salary.toLocaleString("en-IN")}</p>
                        <Badge className={`text-[10px] ${statusConfig.color}`}>{statusConfig.label}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {staff.skillset.map((skill, idx) => (
                        <span key={idx} className="text-[10px] bg-white/10 text-white/80 px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Scoped scrollbar for WebKit */}
      <style jsx>{`
        #staffScroll::-webkit-scrollbar { width: 8px; }
        #staffScroll::-webkit-scrollbar-track { background: transparent; }
        #staffScroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.25);
          border-radius: 9999px;
        }
        #staffScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
      `}</style>
    </div>
  )
}
