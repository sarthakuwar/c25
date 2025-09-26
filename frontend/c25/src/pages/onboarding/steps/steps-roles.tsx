"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import type { Employee, Shop } from "../types"

type Props = {
  shop: Shop
  onChange: (s: Shop) => void
}

export function StepRoles({ shop, onChange }: Props) {
  const [draft, setDraft] = useState<Employee>({
    id: "",
    name: "",
    role: "",
    salary: 20,
    skills: [],
  })
  const [skillsInput, setSkillsInput] = useState<string>("")

  function addEmployee() {
    if (!draft.name.trim() || !draft.role.trim()) return
    const emp: Employee = {
      ...draft,
      id: crypto?.randomUUID?.() ?? String(Date.now()),
      skills:
        skillsInput
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean) || [],
    }
    onChange({ ...shop, employees: [...shop.employees, emp] })
    setDraft({ id: "", name: "", role: "", salary: 20, skills: [] })
    setSkillsInput("")
  }

  function removeEmployee(id: string) {
    onChange({ ...shop, employees: shop.employees.filter((e) => e.id !== id) })
  }

  return (
    <div className="grid gap-6">
      <Card className="bg-black/20 border-white/10">
        <CardContent className="pt-6 grid gap-4 md:grid-cols-4">
          <div className="grid gap-2">
            <Label className="text-white/80">Name</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
              placeholder="e.g., Alex Rivera"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-white/80">Role</Label>
            <Input
              value={draft.role}
              onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))}
              placeholder="e.g., Barista"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="grid gap-2">
            <Label className="text-white/80">Salary ($/hr)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={draft.salary}
              onChange={(e) => setDraft((d) => ({ ...d, salary: Number(e.target.value) }))}
              className="bg-black/20 border-white/20 text-white"
            />
          </div>
          <div className="grid gap-2 md:col-span-4">
            <Label className="text-white/80">Skills (comma-separated)</Label>
            <Input
              value={skillsInput}
              onChange={(e) => setSkillsInput(e.target.value)}
              placeholder="e.g., espresso, latte art, POS"
              className="bg-black/20 border-white/20 text-white placeholder:text-white/40"
            />
          </div>
          <div className="md:col-span-4">
            <Button
              type="button"
              onClick={addEmployee}
              className="bg-white/20 border border-white/20 hover:bg-white/30 text-white"
            >
              Add employee
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3">
        {shop.employees.length === 0 ? (
          <p className="text-white/60 text-sm">No employees added yet.</p>
        ) : (
          shop.employees.map((e) => (
            <Card key={e.id} className="bg-black/20 border-white/10">
              <CardContent className="py-4 flex items-center justify-between">
                <div className="grid gap-1">
                  <p className="text-white">{e.name}</p>
                  <p className="text-white/60 text-sm">
                    {e.role} • ${e.salary.toFixed(2)}/hr
                  </p>
                  {e.skills.length > 0 && <p className="text-white/60 text-xs">Skills: {e.skills.join(", ")}</p>}
                </div>
                <Button
                  variant="secondary"
                  className="bg-white/10 border border-white/20 hover:bg-white/20 text-white"
                  onClick={() => removeEmployee(e.id)}
                >
                  Remove
                </Button>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
