export type InventoryItem = {
  id: string
  sku: string
  name: string
  category: string
  stock: number
  reorderLevel: number
  supplier: string
  cost: number
  price: number
  lastRestocked: string
}

const categories = ["Grocery", "Bakery", "Beverages", "Electronics", "Cleaning", "Personal Care"]
const suppliers = ["Acme Supply", "Northwind Traders", "Contoso Retail", "Globex", "Stark Logistics", "Wayne Wholesale"]

function rand(seed: number) {
  let x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

function makeItem(i: number): InventoryItem {
  const cat = categories[i % categories.length]
  const supp = suppliers[(i * 7) % suppliers.length]
  const stock = Math.floor(rand(i + 1) * 120)
  const reorder = 20 + (i % 15) // 20..34
  const base = 50 + (i % 30) * 5
  const cost = base + Math.floor(rand(i + 2) * 30)
  const price = cost + 20 + Math.floor(rand(i + 3) * 50)
  const day = 1 + (i % 28)
  const month = 1 + (i % 12)
  const lastRestocked = `2025-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`

  return {
    id: `inv-${i + 1}`,
    sku: `SKU-${String(1000 + i)}`,
    name: `${cat} Item ${i + 1}`,
    category: cat,
    stock,
    reorderLevel: reorder,
    supplier: supp,
    cost,
    price,
    lastRestocked,
  }
}

export const inventoryData: InventoryItem[] = Array.from({ length: 50 }, (_, i) => makeItem(i))
