"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Boxes } from "lucide-react"
import type { InventoryItem } from "./inventoryData"

type Props = {
  cardClass: string
  items: InventoryItem[]
}

export default function CenterInventory({ cardClass, items }: Props) {
  return (
    <div className="space-y-4">
      <Card className={`${cardClass} p-5`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Boxes className="h-5 w-5 text-white/70" />
            <h2 className="text-2xl font-bold text-white">Inventory</h2>
          </div>
          <div className="text-white/60 text-sm">{items.length} items</div>
        </div>
      </Card>

      <Card className={`${cardClass} p-0 overflow-hidden`}>
        <div
          className="max-h-[calc(100vh-16rem)] overflow-y-auto"
          style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}
        >
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 bg-black/40 backdrop-blur-xl">
              <tr className="text-white/70">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">SKU</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium text-right">Stock</th>
                <th className="px-3 py-3 font-medium text-right">Reorder</th>
                <th className="px-3 py-3 font-medium">Supplier</th>
                <th className="px-3 py-3 font-medium text-right">Cost</th>
                <th className="px-3 py-3 font-medium text-right">Price</th>
                <th className="px-5 py-3 font-medium text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const low = it.stock <= it.reorderLevel
                return (
                  <tr key={it.id} className="border-t border-white/10 text-white/90">
                    <td className="px-5 py-3">{it.name}</td>
                    <td className="px-3 py-3 text-white/70">{it.sku}</td>
                    <td className="px-3 py-3 text-white/70">{it.category}</td>
                    <td className="px-3 py-3 text-right">{it.stock}</td>
                    <td className="px-3 py-3 text-right">{it.reorderLevel}</td>
                    <td className="px-3 py-3 text-white/70">{it.supplier}</td>
                    <td className="px-3 py-3 text-right">₹{it.cost.toLocaleString("en-IN")}</td>
                    <td className="px-3 py-3 text-right">₹{it.price.toLocaleString("en-IN")}</td>
                    <td className="px-5 py-3 text-right">
                      <Badge className={low ? "bg-red-500/20 text-red-300 border-red-400/30" : "bg-white/10 text-white border-white/20"}>
                        {low ? "Low" : "OK"}
                      </Badge>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* WebKit scrollbar theme */}
        <style jsx>{`
          div::-webkit-scrollbar { width: 8px; }
          div::-webkit-scrollbar-track { background: transparent; }
          div::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
          div::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
        `}</style>
      </Card>
    </div>
  )
}
