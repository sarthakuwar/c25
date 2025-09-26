"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Download } from "lucide-react"

type Props = {
  cardClass: string
  shop: { shopName: string }
}

export default function CenterReports({ cardClass, shop }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Reports</h2>
          <Button className="bg-white/10 hover:bg-white/20 border border-white/20 text-white">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
        <p className="text-white/60 text-sm mt-1">Download summaries for {shop.shopName}</p>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        {["Staff Summary", "Payroll Summary", "Tasks Summary"].map((title) => (
          <Card key={title} className={`${cardClass} p-5`}>
            <div className="flex items-center justify-between">
              <p className="text-white font-medium">{title}</p>
              <FileText className="h-5 w-5 text-white/70" />
            </div>
            <p className="text-white/60 text-sm mt-1">Last generated: Today</p>
            <Button variant="ghost" className="mt-3 text-white/80 hover:bg-white/10">
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
