"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, FileText } from "lucide-react"

type Props = {
  cardClass: string
  shop: { shopName: string }
}

export default function CenterDataImport({ cardClass, shop }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Data Import</h2>
          <Database className="h-5 w-5 text-white/70" />
        </div>
        <p className="text-white/60 text-sm mt-1">Import staff and schedules for {shop.shopName}</p>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <Card className={`${cardClass} p-5`}>
          <p className="text-white font-medium">CSV Template</p>
          <p className="text-white/60 text-sm mt-1">Download and fill the template</p>
          <Button variant="ghost" className="mt-3 text-white/80 hover:bg-white/10">
            <FileText className="h-4 w-4 mr-2" />
            Download Template
          </Button>
        </Card>

        <Card className={`${cardClass} p-5`}>
          <p className="text-white font-medium">Upload CSV</p>
          <p className="text-white/60 text-sm mt-1">Drag & drop or click to upload</p>
          <Button className="mt-3 bg-white/10 hover:bg-white/20 border border-white/20 text-white">Choose File</Button>
        </Card>
      </div>
    </div>
  )
}
