export type DayIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6

export type HoursRange = {
  open: string // "HH:MM"
  close: string // "HH:MM"
}

export type HoursByDay = Partial<Record<DayIndex, HoursRange | null>>

export type Employee = {
  id: string
  name: string
  role: string
  salary: number
  skills: string[] // freeform skill tags
}

export type Shop = {
  id: string
  name: string
  address: string
  employeesCount: number
  workingHoursNote?: string
  businessHours: HoursByDay
  employees: Employee[]
}

export const DEFAULT_BUSINESS_HOURS: HoursByDay = {
  0: null, // Sunday closed
  1: { open: "09:00", close: "17:00" },
  2: { open: "09:00", close: "17:00" },
  3: { open: "09:00", close: "17:00" },
  4: { open: "09:00", close: "17:00" },
  5: { open: "09:00", close: "17:00" },
  6: { open: "10:00", close: "14:00" },
}

export const DEFAULT_SHOP = (): Shop => ({
  id: crypto?.randomUUID?.() ?? String(Date.now()),
  name: "",
  address: "",
  employeesCount: 1,
  workingHoursNote: "",
  businessHours: DEFAULT_BUSINESS_HOURS,
  employees: [],
})

export const STORAGE_KEY = "workforce-lite"

export const DAY_NAMES: Record<DayIndex, string> = {
  0: "Sunday",
  1: "Monday",
  2: "Tuesday",
  3: "Wednesday",
  4: "Thursday",
  5: "Friday",
  6: "Saturday",
}
