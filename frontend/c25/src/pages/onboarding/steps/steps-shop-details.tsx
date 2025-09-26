"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Shop } from "../types"

type Props = {
  shop: Shop
  onChange: (s: Shop) => void
}

export function StepShopDetails({ shop, onChange }: Props) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-2">
        <Label htmlFor="shop-name" className="text-white/80">
          Shop name
        </Label>
        <Input
          id="shop-name"
          value={shop.name}
          onChange={(e) => onChange({ ...shop, name: e.target.value })}
          placeholder="e.g., Downtown Coffee Roasters"
          className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="shop-address" className="text-white/80">
          Address
        </Label>
        <Input
          id="shop-address"
          value={shop.address}
          onChange={(e) => onChange({ ...shop, address: e.target.value })}
          placeholder="123 Main St, Springfield"
          className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="employees-count" className="text-white/80">
          Number of employees
        </Label>
        <Input
          id="employees-count"
          type="number"
          min={0}
          step={1}
          value={shop.employeesCount}
          onChange={(e) => onChange({ ...shop, employeesCount: Math.max(0, Number(e.target.value || 0)) })}
          className="bg-black/20 border-white/20 text-white"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="working-hours-note" className="text-white/80">
          Working hours (note)
        </Label>
        <Input
          id="working-hours-note"
          value={shop.workingHoursNote ?? ""}
          onChange={(e) => onChange({ ...shop, workingHoursNote: e.target.value })}
          placeholder="e.g., Peak hours 8–10am and 4–6pm"
          className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
        />
      </div>
    </div>
  )
}
