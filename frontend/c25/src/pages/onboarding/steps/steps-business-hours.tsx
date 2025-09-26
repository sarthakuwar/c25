"use client"

import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent } from "@/components/ui/card"
import type { DayIndex, HoursByDay, Shop } from "../types"

type Props = {
  shop: Shop
  onChange: (s: Shop) => void
}

function setDay(hours: HoursByDay, day: DayIndex, value: HoursByDay[DayIndex]) {
  return { ...hours, [day]: value }
}

export function StepBusinessHours({ shop, onChange }: Props) {
  const [sameForBoth, setSameForBoth] = useState<boolean>(false)

  // helpers for weekday/weekend sets
  const weekdays: DayIndex[] = [1, 2, 3, 4, 5]
  const weekends: DayIndex[] = [0, 6]

  // derive representative values
  const weekdayVal = weekdays.map((d) => shop.businessHours[d] ?? null).find((v) => v !== null) ?? {
    open: "09:00",
    close: "17:00",
  }
  const weekendVal = weekends.map((d) => shop.businessHours[d] ?? null).find((v) => v !== null) ?? {
    open: "10:00",
    close: "16:00",
  }

  function setBlock(isWeekend: boolean, open: string, close: string) {
    const days = isWeekend ? weekends : weekdays
    let next = { ...shop.businessHours }
    days.forEach((d) => {
      next = setDay(next, d, { open, close })
    })
    onChange({ ...shop, businessHours: next })
  }

  useEffect(() => {
    if (sameForBoth) {
      setBlock(true, weekdayVal.open, weekdayVal.close)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sameForBoth, weekdayVal.open, weekdayVal.close])

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-3">
        <Switch checked={sameForBoth} onCheckedChange={setSameForBoth} />
        <Label className="text-white/80">Keep same schedule for both</Label>
      </div>

      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-4 grid gap-4">
          <Label className="text-white">Regular days (Mon–Fri)</Label>
          <div className="grid grid-cols-2 gap-3 md:max-w-md">
            <div className="grid gap-2">
              <Label className="text-white/70">Open</Label>
              <Input
                type="time"
                value={weekdayVal.open}
                onChange={(e) => setBlock(false, e.target.value, weekdayVal.close)}
                className="bg-black/20 border-white/20 text-white"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70">Close</Label>
              <Input
                type="time"
                value={weekdayVal.close}
                onChange={(e) => setBlock(false, weekdayVal.open, e.target.value)}
                className="bg-black/20 border-white/20 text-white"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/20 border-white/10">
        <CardContent className="py-4 grid gap-4 opacity-100">
          <Label className="text-white">Weekends (Sat–Sun)</Label>
          <div className="grid grid-cols-2 gap-3 md:max-w-md">
            <div className="grid gap-2">
              <Label className="text-white/70">Open</Label>
              <Input
                type="time"
                value={weekendVal.open}
                onChange={(e) => setBlock(true, e.target.value, weekendVal.close)}
                disabled={sameForBoth}
                className="bg-black/20 border-white/20 text-white disabled:opacity-40"
              />
            </div>
            <div className="grid gap-2">
              <Label className="text-white/70">Close</Label>
              <Input
                type="time"
                value={weekendVal.close}
                onChange={(e) => setBlock(true, weekendVal.open, e.target.value)}
                disabled={sameForBoth}
                className="bg-black/20 border-white/20 text-white disabled:opacity-40"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
