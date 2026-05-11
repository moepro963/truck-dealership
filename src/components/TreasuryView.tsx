import { useState } from 'react'
import { supabase } from '../supabaseClient'
import { TreasuryEntry } from '../types'

interface Props {
  treasury: TreasuryEntry[]
  onSaved: () => void
}

export default function TreasuryView({ treasury, onSaved }: Props) {
  const [type, setType] = useState<'in' | 'out'>('in')
  const [account, setAccount] = useState('')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState(0)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('treasury').insert({
      date: new Date().toLocaleDateString('en-GB'),
      account,
      description,
      type,
      amount,
    })
    if (!error) {
      setAccount(''); setDescription(''); setAmount(0)
      onSaved()
    } else {
      alert('خطأ: ' + error.message)
    }
    setSaving(false)
  }

  let balance = 0
  const sorted = [...treasury].reverse()

  const rows = sorted.map(t => {
    balance += t.type === 'in' ? t.amount : -t.amount
    return { ...t, balance }
  }).reverse()

  const totalBalance = treasury.reduce((s, t) => t.type === 'in' ? s + t.amount : s - t.amount, 0)

  return (
    <div className="section-view">
      <h4 className="mb-3">
        <i className="fa-solid fa-vault text-warning me-2"></i> الخزينة
      </h4>

      <div className="card mb-4">
        <div className="card-body">
          <form onSubmit={handleSubmit} className="row g-2 align-items-end">
            <div className="col-6 col-md-2">
              <label className="form-label">النوع</label>
              <select className="form-select" value={type} onChange={e => setType(e.target.value as 'in' | 'out')}>
                <option value="in">قبض (+)</option>
                <option value="out">صرف (-)</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">الحساب</label>
              <input type="text" className="form-control" value={account} onChange={e => setAccount(e.target.value)} required />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label">البيان</label>
              <input type="text" className="form-control" value={description} onChange={e => setDescription(e.target.value)} required />
            </div>
            <div className="col-8 col-md-2">
              <label className="form-label">المبلغ $</label>
              <input type="number" className="form-control" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} required />
            </div>
            <div className="col-4 col-md-1">
              <button type="submit" className="btn btn-dark w-100" disabled={saving}>
                {saving ? <span className="spinner-border spinner-border-sm"></span> : <i className="fa-solid fa-plus"></i>}
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="card-header d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <span>حركة الصندوق</span>
          <span className={`badge fs-6 p-2 w-100 mobile-w-100 text-center ${totalBalance >= 0 ? 'bg-dark' : 'bg-danger'}`}>
            الرصيد: {totalBalance.toLocaleString()} $
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0 text-center text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>التاريخ</th>
                  <th>الحساب</th>
                  <th>البيان</th>
                  <th className="text-success">وارد (+)</th>
                  <th className="text-danger">صادر (-)</th>
                  <th>الرصيد التراكمي</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr><td colSpan={6} className="text-muted py-3">لا توجد حركات بعد</td></tr>
                ) : (
                  rows.map(t => (
                    <tr key={t.id}>
                      <td>{t.date}</td>
                      <td>{t.account}</td>
                      <td>{t.description}</td>
                      <td className="text-success">{t.type === 'in' ? `$${t.amount.toLocaleString()}` : '-'}</td>
                      <td className="text-danger">{t.type === 'out' ? `$${t.amount.toLocaleString()}` : '-'}</td>
                      <td className={t.balance >= 0 ? 'text-dark fw-bold' : 'text-danger fw-bold'}>
                        ${t.balance.toLocaleString()}
                      </td>
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
