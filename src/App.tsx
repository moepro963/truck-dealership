import { useState, useEffect, useCallback } from 'react'
import { supabase } from './supabaseClient'
import { InventoryItem, Sale, TreasuryEntry } from './types'
import Navbar from './components/Navbar'
import Dashboard from './components/Dashboard'
import InventoryForm from './components/InventoryForm'
import ProfileView from './components/ProfileView'
import SalesView from './components/SalesView'
import TreasuryView from './components/TreasuryView'
import ReportsView from './components/ReportsView'

export type TabId = 'dashboard' | 'inventory' | 'profile' | 'sales' | 'treasury' | 'reports'

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [inventory, setInventory] = useState<InventoryItem[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [treasury, setTreasury] = useState<TreasuryEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [profileItemId, setProfileItemId] = useState<string | null>(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const [invRes, salesRes, trsRes] = await Promise.all([
      supabase.from('inventory').select('*').order('created_at', { ascending: false }),
      supabase.from('sales').select('*').order('created_at', { ascending: false }),
      supabase.from('treasury').select('*').order('created_at', { ascending: false }),
    ])
    if (invRes.data) setInventory(invRes.data as InventoryItem[])
    if (salesRes.data) setSales(salesRes.data as Sale[])
    if (trsRes.data) setTreasury(trsRes.data as TreasuryEntry[])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const switchTab = (tab: TabId, itemId?: string) => {
    setActiveTab(tab)
    if (itemId) setProfileItemId(itemId)
  }

  const dummyData: InventoryItem[] = [
    { id: 'd1', date_added: '01/05/2026', sku: 'VEH-2026-8012', type: 'vehicle', brand: 'مرسيدس', model: 'Actros 1845', year: '2018', color: 'أبيض', chassis: 'WDB123', trailer_type: '', source: 'أوروبا', location: 'معبر باب الهوى', notes: 'نظيفة', image: 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400', price: 40000, shipping: 2500, customs: 0, clearance: 0, maintenance: 0, others: 0, total_cost: 42500, status: 'متوفر' },
    { id: 'd2', date_added: '03/05/2026', sku: 'VEH-2026-5534', type: 'vehicle', brand: 'فولفو', model: 'FH 500', year: '2020', color: 'أسود', chassis: 'YV2RT', trailer_type: '', source: 'رومانيا', location: 'المنطقة الحرة', notes: 'جاهزة', image: 'https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=400', price: 50000, shipping: 1000, customs: 0, clearance: 0, maintenance: 0, others: 0, total_cost: 51000, status: 'متوفر' },
    { id: 'd3', date_added: '05/05/2026', sku: 'TRL-2026-9022', type: 'trailer', brand: 'كرون', model: 'مقطورة', year: '2021', color: 'فضي', chassis: 'WKR123', trailer_type: 'براد', source: 'أوروبا', location: 'ميناء اللاذقية', notes: 'تبريد', image: 'https://images.pexels.com/photos/1008155/pexels-photo-1008155.jpeg?auto=compress&cs=tinysrgb&w=400', price: 20000, shipping: 2000, customs: 0, clearance: 0, maintenance: 0, others: 0, total_cost: 22000, status: 'متوفر' },
  ]

  const importDummyData = async () => {
    let added = 0
    for (const item of dummyData) {
      const exists = inventory.find(i => i.sku === item.sku)
      if (!exists) {
        const { id: _id, ...itemWithoutId } = item
        void _id
        const { error: invErr } = await supabase.from('inventory').insert(itemWithoutId)
        if (!invErr) {
          await supabase.from('treasury').insert({
            date: item.date_added,
            account: 'موردين',
            description: `استيراد ${item.sku}`,
            type: 'out',
            amount: item.total_cost,
          })
          added++
        }
      }
    }
    if (added > 0) {
      alert(`تم استيراد ${added} مركبة بنجاح.`)
      fetchAll()
    } else {
      alert('تم جلب البيانات مسبقاً.')
    }
  }

  const clearData = async () => {
    if (!confirm('سيتم مسح كافة البيانات نهائياً. متأكد؟')) return
    await Promise.all([
      supabase.from('inventory').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('sales').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('treasury').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
    ])
    fetchAll()
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <div className="text-center text-white">
          <div className="spinner-border text-info mb-3" role="status" style={{ width: 50, height: 50 }}></div>
          <p className="fs-5 fw-bold">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  const profileItem = profileItemId ? inventory.find(i => i.id === profileItemId) || null : null

  return (
    <>
      <Navbar
        activeTab={activeTab}
        onSwitchTab={switchTab}
        onImportDummy={importDummyData}
        onClearData={clearData}
      />
      <div className="container px-2 px-md-3">
        {activeTab === 'dashboard' && (
          <Dashboard inventory={inventory} sales={sales} onOpenProfile={(id) => switchTab('profile', id)} />
        )}
        {activeTab === 'inventory' && (
          <InventoryForm onSaved={fetchAll} />
        )}
        {activeTab === 'profile' && profileItem && (
          <ProfileView item={profileItem} onBack={() => switchTab('dashboard')} onSaved={fetchAll} />
        )}
        {activeTab === 'sales' && (
          <SalesView inventory={inventory} sales={sales} onSaved={fetchAll} />
        )}
        {activeTab === 'treasury' && (
          <TreasuryView treasury={treasury} onSaved={fetchAll} />
        )}
        {activeTab === 'reports' && (
          <ReportsView inventory={inventory} sales={sales} treasury={treasury} />
        )}
      </div>
    </>
  )
}
