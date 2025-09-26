"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

type Suggestion = {
  id: string
  sku: string
  name: string
  supplier: string
  stock: number
  reorderLevel: number
  shortageRatio: number
}

type Props = {
  cardClass: string
  suggestions: Suggestion[]
  onBack: () => void
}

export default function CenterAISuggestions({ cardClass, suggestions, onBack }: Props) {
  return (
    <div className="space-y-3.5">
      <Card className={`${cardClass} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-8 px-3 text-white/80 hover:bg-white/10" onClick={onBack}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back
            </Button>
            <h2 className="text-2xl font-bold text-white">AI Suggestions</h2>
          </div>
          <div className="text-white/60 text-sm">{suggestions.length} items</div>
        </div>
      </Card>

      <Card className={`${cardClass} p-0 overflow-hidden`}>
        <div
          id="aiSuggScroll"
          className="max-h-[calc(100vh-16rem)] overflow-y-auto p-4 space-y-3"
          style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}
        >
          {suggestions.map((it) => (
            <div key={it.id} className="p-3.5 bg-black/40 rounded-xl border border-white/10">
              <div className="flex items-center justify-between">
                <p className="text-base text-white truncate" title={it.name}>{it.name}</p>
                <Badge className="bg-white/10 text-white border-white/20">SKU {it.sku}</Badge>
              </div>
              <p className="text-xs text-white/60 mt-0.5">
                Stock {it.stock}/{it.reorderLevel} • Supplier: {it.supplier}
              </p>
              <div className="mt-2 w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full bg-gradient-to-r from-red-400 to-yellow-400"
                  style={{ width: `${Math.min(100, Math.max(5, (it.stock / Math.max(1, it.reorderLevel)) * 100))}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <style jsx>{`
          #aiSuggScroll::-webkit-scrollbar { width: 8px; }
          #aiSuggScroll::-webkit-scrollbar-track { background: transparent; }
          #aiSuggScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
          #aiSuggScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
        `}</style>
      </Card>
    </div>
  )
}
