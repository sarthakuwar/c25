"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { DEFAULT_SHOP, STORAGE_KEY, type Shop } from "../onboarding/types"
import { StepShopDetails } from "./steps/steps-shop-details"
import { StepBusinessHours } from "./steps/steps-business-hours"
import { StepRoles } from "./steps/steps-roles"

export function OnboardingWizard() {
  const router = useRouter()
  const [shop, setShop] = useState<Shop>(() => DEFAULT_SHOP())
  const [step, setStep] = useState(0)

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null
      if (raw) {
        const parsed = JSON.parse(raw) as Shop
        setShop({
          ...DEFAULT_SHOP(),
          ...parsed,
        })
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const steps = useMemo(
    () => [{ title: "Shop details" }, { title: "Business hours" }, { title: "Employee details" }],
    [],
  )

  const pct = ((step + 1) / steps.length) * 100

  function saveToStorage(data: Shop) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore in demo
    }
  }

  function next() {
    const nextStep = Math.min(step + 1, steps.length - 1)
    setStep(nextStep)
    saveToStorage(shop)
  }

  function back() {
    const prev = Math.max(step - 1, 0)
    setStep(prev)
    saveToStorage(shop)
  }

  function validate(): string[] {
    const errs: string[] = []
    if (!shop.name.trim()) errs.push("Shop name is required.")
    if (!shop.address.trim()) errs.push("Address is required.")
    if (shop.employeesCount < 0) errs.push("Number of employees cannot be negative.")
    // additional validations can be added here
    return errs
  }

  function finish() {
    const errs = validate()
    if (errs.length) {
     console.log("hello")
      return
    }
    saveToStorage(shop)
    
    router.push("/schedule")
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <Card className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[24px] text-white">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl">{steps[step]?.title}</CardTitle>
          <Progress value={pct} className="h-2 bg-white/10" />
          <p className="text-xs text-white/50">{`Step ${step + 1} of ${steps.length}`}</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {step === 0 && <StepShopDetails shop={shop} onChange={setShop} />}
          {step === 1 && <StepBusinessHours shop={shop} onChange={setShop} />}
          {step === 2 && <StepRoles shop={shop} onChange={setShop} />}

          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="secondary"
              className="bg-white/10 border border-white/20 hover:bg-white/20 text-white"
              onClick={back}
              disabled={step === 0}
            >
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button
                type="button"
                className="bg-white/20 border border-white/20 hover:bg-white/30 text-white"
                onClick={next}
              >
                Next
              </Button>
            ) : (
              <Button
                type="button"
                className="bg-white/20 border border-white/20 hover:bg-white/30 text-white"
                onClick={finish}
              >
                Finish
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
