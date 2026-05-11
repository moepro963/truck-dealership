export interface InventoryItem {
  id: string
  date_added: string
  sku: string
  type: 'vehicle' | 'trailer'
  brand: string
  model: string
  year: string
  color: string
  chassis: string
  trailer_type: string
  source: string
  location: string
  notes: string
  image: string
  price: number
  shipping: number
  customs: number
  clearance: number
  maintenance: number
  others: number
  total_cost: number
  status: 'متوفر' | 'مباع'
  created_at?: string
}

export interface Sale {
  id: string
  sku: string
  title: string
  cost: number
  price: number
  commission: number
  buyer: string
  seller: string
  date: string
  created_at?: string
}

export interface TreasuryEntry {
  id: string
  date: string
  account: string
  description: string
  type: 'in' | 'out'
  amount: number
  created_at?: string
}
