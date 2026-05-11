import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { InventoryItem, Sale } from '../types'

interface Props {
  inventory: InventoryItem[]
  sales: Sale[]
  onSaved: () => void
}

export default function SalesView({ inventory, sales, onSaved }: Props) {
  const [selectedItemId, setSelectedItemId] = useState('')
  const [salePrice, setSalePrice] = useState(0)
  const [buyer, setBuyer] = useState('')
  const [phone, setPhone] = useState('')
  const [seller, setSeller] = useState('')
  const [commission, setCommission] = useState(0)
  const [saving, setSaving] = useState(false)

  const available = inventory.filter(i => i.status === 'متوفر')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const item = inventory.find(i => i.id === selectedItemId)
    if (!item) return
    setSaving(true)

    const dateSold = new Date().toLocaleDateString('en-GB')

    const { error: invErr } = await supabase.from('inventory').update({ status: 'مباع' }).eq('id', item.id)
    if (invErr) { alert('خطأ: ' + invErr.message); setSaving(false); return }

    await supabase.from('sales').insert({
      sku: item.sku,
      title: `${item.brand} ${item.model}`,
      cost: item.total_cost,
      price: salePrice,
      commission,
      buyer,
      seller,
      date: dateSold,
    })

    await supabase.from('treasury').insert({
      date: dateSold,
      account: buyer,
      description: `مبيع ${item.sku}`,
      type: 'in',
      amount: salePrice,
    })

    if (commission > 0) {
      await supabase.from('treasury').insert({
        date: dateSold,
        account: seller,
        description: `عمولة ${item.sku}`,
        type: 'out',
        amount: commission,
      })
    }

    alert('تم البيع!')
    setSelectedItemId(''); setSalePrice(0); setBuyer(''); setPhone(''); setSeller(''); setCommission(0)
    onSaved()
    setSaving(false)
  }

  return (
    <div className="section-view">
      <h4 className="mb-3">
        <i className="fa-solid fa-handshake text-success me-2"></i> بيع مركبة
      </h4>

      <div className="card border-top border-4 border-success">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-4 bg-light p-2 p-md-3 rounded">
              <div className="col-12 col-md-8">
                <label className="form-label">المركبة المباعة</label>
                <select className="form-select" value={selectedItemId} onChange={e => setSelectedItemId(e.target.value)} required>
                  <option value="" disabled>اختر المركبة...</option>
                  {available.map(i => (
                    <option key={i.id} value={i.id}>[{i.sku}] {i.brand} {i.model}</option>
                  ))}
                </select>
              </div>
              <div className="col-12 col-md-4">
                <label className="form-label text-success">سعر المبيع $</label>
                <input type="number" className="form-control form-control-lg" value={salePrice} onChange={e => setSalePrice(parseFloat(e.target.value) || 0)} required />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-12 col-md-4">
                <label className="form-label">المشتري</label>
                <input type="text" className="form-control" value={buyer} onChange={e => setBuyer(e.target.value)} required />
              </div>
              <div className="col-12 col-md-3">
                <label className="form-label">رقم الهاتف</label>
                <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">المندوب (البائع)</label>
                <input type="text" className="form-control" value={seller} onChange={e => setSeller(e.target.value)} required />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label text-danger">عمولة $</label>
                <input type="number" className="form-control" value={commission} onChange={e => setCommission(parseFloat(e.target.value) || 0)} />
              </div>
            </div>

            <button type="submit" className="btn btn-success btn-lg w-100" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الحفظ...</> : <><i className="fa-solid fa-check me-2"></i> اعتماد البيع</>}
            </button>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header bg-white">سجل المبيعات</div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center align-middle text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>رقم (SKU)</th>
                  <th>المركبة</th>
                  <th>المشتري</th>
                  <th>البائع</th>
                  <th>المبيع $</th>
                  <th>العمولة $</th>
                  <th>الصافي $</th>
                </tr>
              </thead>
              <tbody>
                {sales.length === 0 ? (
                  <tr><td colSpan={7} className="text-muted py-3">لا توجد مبيعات بعد</td></tr>
                ) : (
                  sales.map(s => (
                    <tr key={s.id}>
                      <td><small>{s.sku}</small></td>
                      <td>{s.title}</td>
                      <td>{s.buyer}</td>
                      <td>{s.seller}</td>
                      <td className="text-primary fw-bold">${s.price.toLocaleString()}</td>
                      <td className="text-danger">${s.commission.toLocaleString()}</td>
                      <td className="text-success fw-bold">${(s.price - s.cost - s.commission).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
