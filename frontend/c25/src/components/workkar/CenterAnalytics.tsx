"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, DollarSign, Clock } from "lucide-react"

type Props = {
  cardClass: string
  shop: { shopName: string }
}

export default function CenterAnalytics({ cardClass, shop }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Analytics <TrendingUp className="inline h-6 w-6 ml-1 text-white/80" /></h2>
          <Badge className="bg-white/10 text-white border-white/20">Preview</Badge>
        </div>
        <p className="text-white/60 text-sm mt-1">High-level metrics for {shop.shopName}</p>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {[
          { title: "Utilization", value: "78%", icon: Clock },
          { title: "Avg Tasks/Staff", value: "25", icon: Users },
          { title: "Payroll / Rev", value: "32%", icon: DollarSign },
        ].map((s, i) => (
          <Card key={i} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-white/60 text-sm">{s.title}</p>
              <s.icon className="h-5 w-5 text-white/70" />
            </div>
            <p className="text-2xl font-bold text-white mt-2">{s.value}</p>
            <div className="mt-3 w-full bg-white/10 rounded-full h-2">
              <div className="h-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400" style={{ width: s.title === "Utilization" ? "78%" : s.title === "Payroll / Rev" ? "32%" : "50%" }} />
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
