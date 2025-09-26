"use client"

import { useMemo } from "react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Banknote } from "lucide-react"
import type { Staff } from "@/app/dashboard/page"
import type { InventoryItem } from "./inventoryData"

type Props = {
  cardClass: string
  shop: { id: string; shopName: string; staffs: Staff[] }
  items: InventoryItem[]
}

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`

export default function CenterFinancials({ cardClass, shop, items }: Props) {
  const payrollMonthly = useMemo(() => shop.staffs.reduce((sum, s) => sum + (s.salary || 0), 0), [shop.staffs])

  const inventoryHoldingCost = useMemo(
    () => items.reduce((sum, it) => sum + it.cost * it.stock, 0),
    [items]
  )

  const inventoryRetailValue = useMemo(
    () => items.reduce((sum, it) => sum + it.price * it.stock, 0),
    [items]
  )

  const marginPct = useMemo(() => {
    if (inventoryRetailValue <= 0) return 0
    const gross = inventoryRetailValue - inventoryHoldingCost
    return Math.max(0, Math.round((gross / inventoryRetailValue) * 100))
  }, [inventoryRetailValue, inventoryHoldingCost])

  const topSalaries = useMemo(
    () => [...shop.staffs].sort((a, b) => b.salary - a.salary).slice(0, 5),
    [shop.staffs]
  )

  const topInventoryCost = useMemo(
    () =>
      [...items]
        .map((it) => ({ ...it, carryCost: it.cost * it.stock }))
        .sort((a, b) => b.carryCost - a.carryCost)
        .slice(0, 6),
    [items]
  )

  return (
    <div className="space-y-3.5">
      {/* Header */}
      <Card className={`${cardClass} p-4`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Banknote className="h-5 w-5 text-white/70" />
            <h2 className="text-2xl font-bold text-white">Financials</h2>
          </div>
          <div className="text-white/60 text-sm">{shop.shopName}</div>
        </div>
      </Card>

      {/* Scrollable content container */}
      <Card className={`${cardClass} p-0 overflow-hidden`}>
        <div
          id="financialScroll"
          className="max-h-[calc(100vh-14rem)] overflow-y-auto p-4 space-y-3.5"
          style={{ scrollbarColor: "rgba(255,255,255,0.35) transparent", scrollbarWidth: "thin" }}
        >
          {/* KPIs (reorder cost removed) */}
          <div className="grid grid-cols-3 gap-3.5">
            <KPI cardClass={cardClass} title="Monthly Payroll" value={inr(payrollMonthly)} hint="All staff, gross" />
            <KPI cardClass={cardClass} title="Inventory Holding Cost" value={inr(inventoryHoldingCost)} hint="Cost × Stock" />
            <KPI cardClass={cardClass} title="Inventory Retail Value" value={inr(inventoryRetailValue)} hint="Price × Stock" />
          </div>

          {/* Bars */}
          <Card className={`${cardClass} p-4`}>
            <div className="grid grid-cols-2 gap-4">
              <BarRow
                label="Payroll vs Inventory Cost"
                leftLabel="Payroll"
                leftValue={payrollMonthly}
                rightLabel="Inventory"
                rightValue={inventoryHoldingCost}
              />
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-white/80 text-sm">Potential Gross Margin</p>
                  <p className="text-white font-semibold">{marginPct}%</p>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div className="h-2 rounded-full bg-gradient-to-r from-green-400 to-emerald-400" style={{ width: `${marginPct}%` }} />
                </div>
                <p className="text-white/60 text-xs mt-2">Based on current stock (retail − cost) / retail</p>
              </div>
            </div>
          </Card>

          {/* Tables */}
          <div className="grid grid-cols-2 gap-3.5">
            <Card className={`${cardClass} p-0 overflow-hidden`}>
              <SectionHeader title="Top Salaries" />
              <div className="divide-y divide-white/10">
                {topSalaries.map((s) => (
                  <Row key={s.id}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-white/10 grid place-items-center text-white text-xs">
                        {s.role
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{s.role}</p>
                        <p className="text-white/60 text-xs truncate">{s.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">{inr(s.salary)}</p>
                      <Badge className="bg-white/10 text-white border-white/20 text-[10px]">
                        {s.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </Row>
                ))}
              </div>
            </Card>

            <Card className={`${cardClass} p-0 overflow-hidden`}>
              <SectionHeader title="Top Inventory Carry Cost" />
              <div className="divide-y divide-white/10">
                {topInventoryCost.map((it) => (
                  <Row key={it.id}>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate" title={it.name}>
                        {it.name}
                      </p>
                      <p className="text-white/60 text-xs">
                        SKU {it.sku} • {it.category}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-white text-sm font-semibold">{inr(it.carryCost)}</p>
                      <p className="text-white/60 text-xs">
                        Stock {it.stock} × {inr(it.cost)}
                      </p>
                    </div>
                  </Row>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* scrollbar styling */}
        <style jsx>{`
          #financialScroll::-webkit-scrollbar { width: 8px; }
          #financialScroll::-webkit-scrollbar-track { background: transparent; }
          #financialScroll::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.25); border-radius: 9999px; }
          #financialScroll::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.35); }
        `}</style>
      </Card>
    </div>
  )
}

/* ---------- Small building blocks ---------- */

function KPI({ cardClass, title, value, hint }: { cardClass: string; title: string; value: string; hint?: string }) {
  return (
    <Card className={`${cardClass} p-3.5`}>
      <p className="text-white/60 text-xs">{title}</p>
      <p className="text-xl font-bold text-white">{value}</p>
      {hint && <p className="text-white/50 text-[11px]">{hint}</p>}
    </Card>
  )
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
      <h3 className="text-white font-semibold text-lg">{title}</h3>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return (
    <div className="px-4 py-3 flex items-center justify-between bg-black/30">
      {children}
    </div>
  )
}

function BarRow({
  label,
  leftLabel,
  leftValue,
  rightLabel,
  rightValue,
}: {
  label: string
  leftLabel: string
  leftValue: number
  rightLabel: string
  rightValue: number
}) {
  const total = Math.max(1, leftValue + rightValue)
  const leftPct = Math.round((leftValue / total) * 100)
  const rightPct = 100 - leftPct

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-white/80 text-sm">{label}</p>
        <p className="text-white/60 text-xs">{inr(leftValue + rightValue)}</p>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2 mt-2 flex overflow-hidden">
        <div className="h-2 bg-blue-400" style={{ width: `${leftPct}%` }} />
        <div className="h-2 bg-purple-400" style={{ width: `${rightPct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-white/70 text-xs">
        <span>
          {leftLabel}: {inr(leftValue)} ({leftPct}%)
        </span>
        <span>
          {rightLabel}: {inr(rightValue)} ({rightPct}%)
        </span>
      </div>
    </div>
  )
}
