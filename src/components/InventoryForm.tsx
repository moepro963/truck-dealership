import { useState, useRef } from 'react'
import { supabase } from '../supabaseClient'

interface Props {
  onSaved: () => void
}

function generateSKU(type: string) {
  return `${type === 'vehicle' ? 'VEH' : 'TRL'}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`
}

export default function InventoryForm({ onSaved }: Props) {
  const [type, setType] = useState('vehicle')
  const [sku, setSku] = useState(generateSKU('vehicle'))
  const [brand, setBrand] = useState('')
  const [customBrand, setCustomBrand] = useState('')
  const [model, setModel] = useState('')
  const [year, setYear] = useState('')
  const [color, setColor] = useState('')
  const [chassis, setChassis] = useState('')
  const [trailerType, setTrailerType] = useState('سطحة')
  const [source, setSource] = useState('أوروبا')
  const [location, setLocation] = useState('معبر باب الهوى')
  const [notes, setNotes] = useState('')
  const [image, setImage] = useState('')
  const [price, setPrice] = useState(0)
  const [shipping, setShipping] = useState(0)
  const [customs, setCustoms] = useState(0)
  const [clearance, setClearance] = useState(0)
  const [maintenance, setMaintenance] = useState(0)
  const [others, setOthers] = useState(0)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const totalCost = price + shipping + customs + clearance + maintenance + others

  const handleTypeChange = (val: string) => {
    setType(val)
    setSku(generateSKU(val))
  }

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
    const finalBrand = brand === 'other' ? customBrand : brand
    const dateAdded = new Date().toLocaleDateString('en-GB')

    const { error } = await supabase.from('inventory').insert({
      date_added: dateAdded,
      sku,
      type,
      brand: finalBrand,
      model,
      year,
      color,
      chassis,
      trailer_type: trailerType,
      source,
      location,
      notes,
      image: image || 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400',
      price,
      shipping,
      customs,
      clearance,
      maintenance,
      others,
      total_cost: totalCost,
      status: 'متوفر',
    })

    if (!error) {
      await supabase.from('treasury').insert({
        date: dateAdded,
        account: 'استيراد',
        description: `إصدار ${sku}`,
        type: 'out',
        amount: totalCost,
      })
      alert('تم الحفظ!')
      // Reset
      setBrand(''); setCustomBrand(''); setModel(''); setYear(''); setColor('')
      setChassis(''); setNotes(''); setImage(''); setPrice(0); setShipping(0)
      setCustoms(0); setClearance(0); setMaintenance(0); setOthers(0)
      setSku(generateSKU(type))
      if (fileRef.current) fileRef.current.value = ''
      onSaved()
    } else {
      alert('حدث خطأ: ' + error.message)
    }
    setSaving(false)
  }

  return (
    <div className="section-view">
      <h4 className="mb-3">
        <i className="fa-solid fa-file-circle-plus text-primary me-2"></i> إضافة بطاقة
      </h4>
      <div className="card border-top border-4 border-primary">
        <div className="card-body">
          <form onSubmit={handleSubmit}>
            <div className="row g-2 mb-3 bg-light p-2 p-md-3 rounded">
              <div className="col-12 col-md-6">
                <label className="form-label">نوع الصنف</label>
                <select className="form-select" value={type} onChange={e => handleTypeChange(e.target.value)}>
                  <option value="vehicle">مركبة</option>
                  <option value="trailer">ذيل</option>
                </select>
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label text-secondary">رقم SKU (تلقائي)</label>
                <input type="text" className="form-control bg-white" value={sku} readOnly disabled />
              </div>
            </div>

            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <label className="form-label">الماركة</label>
                <select className="form-select" value={brand} onChange={e => setBrand(e.target.value)} required={brand !== 'other'}>
                  <option value="" disabled>اختر...</option>
                  <option value="مرسيدس">مرسيدس</option>
                  <option value="فولفو">فولفو</option>
                  <option value="سكانيا">سكانيا</option>
                  <option value="مان">مان</option>
                  <option value="other">+ أخرى...</option>
                </select>
                {brand === 'other' && (
                  <input type="text" className="form-control mt-2" placeholder="اسم الماركة" value={customBrand} onChange={e => setCustomBrand(e.target.value)} required />
                )}
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
              {type === 'trailer' && (
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
              <div className="col-12 col-md-4">
                <label className="form-label">الصورة</label>
                <input ref={fileRef} type="file" className="form-control" accept="image/*" onChange={handleImageChange} />
              </div>
              <div className="col-12 col-md-8">
                <label className="form-label">الملاحظات</label>
                <input type="text" className="form-control" value={notes} onChange={e => setNotes(e.target.value)} />
              </div>
            </div>

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
                <label className="form-label">الموقع</label>
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
                <label className="form-label text-success fs-6 d-block">إجمالي التكلفة $</label>
                <input type="text" className="form-control form-control-lg bg-white fw-bold text-success" readOnly value={totalCost.toLocaleString()} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-lg w-100" disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2"></span>جاري الحفظ...</> : <><i className="fa-solid fa-save me-2"></i> حفظ البطاقة</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
