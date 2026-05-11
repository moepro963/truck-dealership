import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'
import { InventoryItem } from '../types'

interface Props {
  item: InventoryItem
  onBack: () => void
  onSaved: () => void
}

export default function ProfileView({ item, onBack, onSaved }: Props) {
  const [brand, setBrand] = useState(item.brand)
  const [model, setModel] = useState(item.model)
  const [year, setYear] = useState(item.year)
  const [color, setColor] = useState(item.color)
  const [chassis, setChassis] = useState(item.chassis)
  const [trailerType, setTrailerType] = useState(item.trailer_type)
  const [source, setSource] = useState(item.source)
  const [location, setLocation] = useState(item.location)
  const [notes, setNotes] = useState(item.notes)
  const [image, setImage] = useState(item.image)
  const [price, setPrice] = useState(item.price)
  const [shipping, setShipping] = useState(item.shipping)
  const [customs, setCustoms] = useState(item.customs)
  const [clearance, setClearance] = useState(item.clearance)
  const [maintenance, setMaintenance] = useState(item.maintenance)
  const [others, setOthers] = useState(item.others)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalCost = price + shipping + customs + clearance + maintenance + others

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => setImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const { error } = await supabase.from('inventory').update({
      brand, model, year, color, chassis, trailer_type: trailerType,
      source, location, notes, image,
      price, shipping, customs, clearance, maintenance, others,
      total_cost: totalCost,
    }).eq('id', item.id)

    if (!error) {
      alert('تم الحفظ!')
      onSaved()
      onBack()
    } else {
      alert('حدث خطأ: ' + error.message)
    }
    setSaving(false)
  }

  return (
    <div className="section-view">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">
          <i className="fa-solid fa-id-card text-info me-2"></i> ملف البطاقة:{' '}
          <span className="text-secondary">{item.sku}</span>
        </h4>
        <button className="btn btn-outline-secondary btn-sm" onClick={onBack}>
          <i className="fa-solid fa-arrow-right me-1"></i> عودة
        </button>
      </div>

      <div className="card border-top border-4 border-info">
        <div className="card-body">
          <div className="text-center mb-4 bg-light rounded" style={{ position: 'relative', overflow: 'hidden', height: 250 }}>
            <img src={image} alt={brand} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3 bg-light p-2 p-md-3 rounded">
              <div className="col-12 col-md-6">
                <label className="form-label">نوع الصنف</label>
                <input type="text" className="form-control" value={item.type === 'vehicle' ? 'مركبة' : 'ذيل'} disabled />
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">تغيير الصورة</label>
                <input ref={fileRef} type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              </div>
            </div>

            <h6 className="mb-3 text-info border-bottom pb-2">تعديل البيانات الأساسية</h6>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <label className="form-label">الماركة</label>
                <input type="text" className="form-control" value={brand} onChange={e => setBrand(e.target.value)} required />
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">الطراز/الفئة</label>
                <input type="text" className="form-control" value={model} onChange={e => setModel(e.target.value)} required />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">السنة</label>
                <input type="number" className="form-control" value={year} onChange={e => setYear(e.target.value)} required />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">اللون</label>
                <input type="text" className="form-control" value={color} onChange={e => setColor(e.target.value)} required />
              </div>
              <div className="col-12 col-md-2">
                <label className="form-label">رقم الهيكل</label>
                <input type="text" className="form-control" value={chassis} onChange={e => setChassis(e.target.value)} required />
              </div>
              {item.type === 'trailer' && (
                <div className="col-12 col-md-3">
                  <label className="form-label text-danger">النوع (الذيل)</label>
                  <select className="form-select" value={trailerType} onChange={e => setTrailerType(e.target.value)}>
                    <option value="سطحة">سطحة</option>
                    <option value="براد">براد</option>
                    <option value="قلاب">قلاب</option>
                    <option value="ستارة">ستارة</option>
                  </select>
                </div>
              )}
              <div className="col-12">
                <label className="form-label">ملاحظات إضافية</label>
                <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

            <h6 className="mb-3 text-info border-bottom pb-2">
              تعديل التكاليف ($){' '}
              <span className="text-muted fw-normal" style={{ fontSize: '0.75rem' }}>(لن يغير قيود الخزينة السابقة)</span>
            </h6>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <label className="form-label">المصدر</label>
                <select className="form-select" value={source} onChange={e => setSource(e.target.value)}>
                  <option value="أوروبا">أوروبا</option>
                  <option value="رومانيا">رومانيا</option>
                  <option value="دبي (الإمارات)">دبي (الإمارات)</option>
                  <option value="السوق المحلي">السوق المحلي</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <label className="form-label">الموقع الحالي</label>
                <select className="form-select" value={location} onChange={e => setLocation(e.target.value)}>
                  <option value="معبر باب الهوى">باب الهوى</option>
                  <option value="ميناء اللاذقية">اللاذقية</option>
                  <option value="المنطقة الحرة">المنطقة الحرة</option>
                  <option value="المعرض (الداخل)">المعرض</option>
                </select>
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">الشراء</label>
                <input type="number" className="form-control" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">الشحن</label>
                <input type="number" className="form-control" value={shipping} onChange={e => setShipping(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">الجمرك</label>
                <input type="number" className="form-control" value={customs} onChange={e => setCustoms(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">تخليص</label>
                <input type="number" className="form-control" value={clearance} onChange={e => setClearance(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">صيانة</label>
                <input type="number" className="form-control" value={maintenance} onChange={e => setMaintenance(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-6 col-md-2">
                <label className="form-label">أخرى</label>
                <input type="number" className="form-control" value={others} onChange={e => setOthers(parseFloat(e.target.value) || 0)} />
              </div>
              <div className="col-12 mt-3 p-3 bg-light rounded">
                <label className="form-label text-info fs-6 d-block">التكلفة الإجمالية المحدثة $</label>
                <input type="text" className="form-control form-control-lg bg-white fw-bold text-info" readOnly value={totalCost.toLocaleString()} />
              </div>
            </div>

            <button type="submit" className="btn btn-info text-white btn-lg w-100" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الحفظ...</> : <><i className="fa-solid fa-pen-to-square me-2"></i> حفظ التعديلات</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
