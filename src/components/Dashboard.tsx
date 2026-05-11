import { useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { InventoryItem, Sale } from '../types'

Chart.register(...registerables)

interface Props {
  inventory: InventoryItem[]
  sales: Sale[]
  onOpenProfile: (id: string) => void
}

export default function Dashboard({ inventory, sales, onOpenProfile }: Props) {
  const financeRef = useRef<HTMLCanvasElement>(null)
  const statusRef = useRef<HTMLCanvasElement>(null)
  const financeChart = useRef<Chart | null>(null)
  const statusChart = useRef<Chart | null>(null)

  const available = inventory.filter(i => i.status === 'متوفر')
  const sold = inventory.filter(i => i.status === 'مباع')
  const avCost = available.reduce((s, i) => s + i.total_cost, 0)
  const tRev = sales.reduce((s, i) => s + i.price, 0)
  const tCom = sales.reduce((s, i) => s + i.commission, 0)
  const netP = sales.reduce((s, i) => s + (i.price - i.cost - i.commission), 0)

  useEffect(() => {
    if (!financeRef.current || !statusRef.current) return

    if (financeChart.current) financeChart.current.destroy()
    if (statusChart.current) statusChart.current.destroy()

    financeChart.current = new Chart(financeRef.current.getContext('2d')!, {
      type: 'bar',
      data: {
        labels: ['التكلفة', 'الإيرادات', 'الربح', 'العمولات'],
        datasets: [{
          label: 'المبلغ ($)',
          data: [avCost, tRev, netP, tCom],
          backgroundColor: ['#64748b', '#0ea5e9', '#22c55e', '#ef4444'],
          borderRadius: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
      },
    })

    statusChart.current = new Chart(statusRef.current.getContext('2d')!, {
      type: 'doughnut',
      data: {
        labels: ['متوفر', 'مباع'],
        datasets: [{
          data: [available.length, sold.length],
          backgroundColor: ['#3b82f6', '#10b981'],
          hoverOffset: 4,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom' } },
      },
    })

    return () => {
      financeChart.current?.destroy()
      statusChart.current?.destroy()
    }
  }, [inventory, sales, avCost, tRev, netP, tCom, available.length, sold.length])

  return (
    <div className="section-view">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold mb-0">
          <i className="fa-solid fa-chart-line text-primary me-2"></i> لوحة القيادة
        </h4>
        <span className="badge bg-primary fs-6">{available.length} متوفرة</span>
      </div>

      <div className="row mb-4">
        <div className="col-lg-8 col-12 mb-3 mb-lg-0">
          <div className="card h-100 mb-0">
            <div className="card-header">
              <i className="fa-solid fa-chart-column text-info me-1"></i> الأداء المالي ($)
            </div>
            <div className="card-body">
              <div className="chart-container">
                <canvas ref={financeRef}></canvas>
              </div>
            </div>
          </div>
        </div>
        <div className="col-lg-4 col-12">
          <div className="card h-100 mb-0">
            <div className="card-header">
              <i className="fa-solid fa-chart-pie text-success me-1"></i> حالة المخزون
            </div>
            <div className="card-body d-flex justify-content-center align-items-center">
              <div className="chart-container" style={{ height: 220 }}>
                <canvas ref={statusRef}></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h5 className="mb-3 fw-bold text-secondary border-bottom pb-2">
        <i className="fa-solid fa-warehouse me-2"></i> المخزون المتوفر
      </h5>

      {available.length === 0 ? (
        <div className="col-12 text-center text-muted py-4">
          <i className="fa-solid fa-box-open fa-3x mb-2"></i>
          <p>المعرض فارغ حالياً.</p>
        </div>
      ) : (
        <div className="row g-3">
          {available.map(item => (
            <div key={item.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card vehicle-card">
                <div className="vehicle-img-container">
                  <span className="sku-badge">{item.sku}</span>
                  <img src={item.image || 'https://images.pexels.com/photos/1335077/pexels-photo-1335077.jpeg?auto=compress&cs=tinysrgb&w=400'} alt={item.brand} />
                </div>
                <div className="card-body p-3 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <h6 className="card-title fw-bold mb-0">{item.brand} {item.model}</h6>
                    <span className="badge bg-secondary">{item.year}</span>
                  </div>
                  <p className="text-muted small mb-2">
                    {item.type === 'vehicle'
                      ? <><i className="fa-solid fa-truck"></i> مركبة</>
                      : <><i className="fa-solid fa-trailer"></i> ذيل ({item.trailer_type})</>
                    } | {item.location}
                  </p>
                  <hr className="my-2" />
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="text-secondary small">التكلفة:</span>
                    <span className="price-tag">${item.total_cost.toLocaleString()}</span>
                  </div>
                  <button
                    className="btn btn-outline-info btn-sm w-100 mt-auto"
                    onClick={() => onOpenProfile(item.id)}
                  >
                    <i className="fa-solid fa-folder-open me-1"></i> الملف والتعديل
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
