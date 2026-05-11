import { useState, useRef, useEffect } from 'react'
import { Chart, registerables } from 'chart.js'
import { InventoryItem, Sale, TreasuryEntry } from '../types'

Chart.register(...registerables)

interface Props {
  inventory: InventoryItem[]
  sales: Sale[]
  treasury: TreasuryEntry[]
}

function parseGBDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  const parts = dateStr.split('/')
  return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]))
}

interface ReportStats {
  stats: { label: string; value: string; color: string }[]
  tableHead: string[]
  tableRows: string[][]
  chartLabels: string[]
  chartData1: number[]
  chartData2: number[]
  chartTitle1: string
  chartTitle2: string
  chartType: 'line' | 'bar'
  title: string
}

export default function ReportsView({ inventory, sales, treasury }: Props) {
  const [reportType, setReportType] = useState('sales')
  const [dateFrom, setDateFrom] = useState(() => {
    const today = new Date()
    return new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0]
  })
  const [dateTo, setDateTo] = useState(() => new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<ReportStats | null>(null)
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!report || !chartRef.current) return
    if (chartInstance.current) chartInstance.current.destroy()

    const datasets: Chart['data']['datasets'] = [{
      label: report.chartTitle1,
      data: report.chartData1,
      backgroundColor: '#38bdf8',
      borderColor: '#0284c7',
      borderWidth: 2,
      fill: true,
      tension: 0.3,
    } as never]

    if (report.chartData2.length > 0) {
      datasets.push({
        label: report.chartTitle2,
        data: report.chartData2,
        backgroundColor: reportType === 'treasury' ? '#f87171' : '#34d399',
        borderColor: reportType === 'treasury' ? '#dc2626' : '#059669',
        borderWidth: 2,
        fill: true,
        tension: 0.3,
      } as never)
    }

    chartInstance.current = new Chart(chartRef.current.getContext('2d')!, {
      type: report.chartType,
      data: { labels: report.chartLabels, datasets },
      options: { responsive: true, maintainAspectRatio: false },
    })
  }, [report, reportType])

  const generateReport = (e: React.FormEvent) => {
    e.preventDefault()
    const fromDate = new Date(dateFrom)
    const toDate = new Date(dateTo)
    toDate.setHours(23, 59, 59, 999)

    if (reportType === 'sales') {
      let totalSales = 0, totalProfit = 0, totalComms = 0, count = 0
      const filtered = sales.filter(s => {
        const d = parseGBDate(s.date)
        return d >= fromDate && d <= toDate
      })

      const salesByDate: Record<string, { sales: number; profit: number }> = {}
      const tableRows: string[][] = []

      filtered.forEach(s => {
        totalSales += s.price
        totalComms += s.commission
        const profit = s.price - s.cost - s.commission
        totalProfit += profit
        count++
        if (!salesByDate[s.date]) salesByDate[s.date] = { sales: 0, profit: 0 }
        salesByDate[s.date].sales += s.price
        salesByDate[s.date].profit += profit
        tableRows.push([s.date, s.sku, s.title, `$${s.price.toLocaleString()}`, `$${profit.toLocaleString()}`])
      })

      setReport({
        title: 'تقرير المبيعات والأرباح الشامل',
        stats: [
          { label: 'عدد المبيعات', value: String(count), color: '' },
          { label: 'إجمالي الإيرادات', value: `$${totalSales.toLocaleString()}`, color: 'text-primary' },
          { label: 'إجمالي العمولات', value: `$${totalComms.toLocaleString()}`, color: 'text-danger' },
          { label: 'صافي الأرباح', value: `$${totalProfit.toLocaleString()}`, color: 'text-success' },
        ],
        tableHead: ['التاريخ', 'رقم SKU', 'المركبة', 'سعر المبيع', 'الربح الصافي'],
        tableRows,
        chartLabels: Object.keys(salesByDate),
        chartData1: Object.values(salesByDate).map(v => v.sales),
        chartData2: Object.values(salesByDate).map(v => v.profit),
        chartTitle1: 'الإيرادات',
        chartTitle2: 'الأرباح',
        chartType: 'line',
      })
    } else if (reportType === 'purchases') {
      let totalCost = 0, vehicleCount = 0, trailerCount = 0
      const filtered = inventory.filter(i => {
        const d = parseGBDate(i.date_added)
        return d >= fromDate && d <= toDate
      })

      const costByDate: Record<string, number> = {}
      const tableRows: string[][] = []

      filtered.forEach(i => {
        totalCost += i.total_cost
        if (i.type === 'vehicle') vehicleCount++; else trailerCount++
        if (!costByDate[i.date_added]) costByDate[i.date_added] = 0
        costByDate[i.date_added] += i.total_cost
        tableRows.push([i.date_added, i.sku, `${i.brand} ${i.model}`, i.source, `$${i.total_cost.toLocaleString()}`])
      })

      setReport({
        title: 'تقرير المشتريات وإضافة المخزون',
        stats: [
          { label: 'إجمالي المركبات', value: String(vehicleCount), color: '' },
          { label: 'إجمالي الأذيال', value: String(trailerCount), color: '' },
          { label: 'إجمالي تكلفة المشتريات', value: `$${totalCost.toLocaleString()}`, color: 'text-danger' },
          { label: '', value: '', color: '' },
        ],
        tableHead: ['تاريخ الإضافة', 'رقم SKU', 'الصنف', 'المصدر', 'التكلفة الإجمالية'],
        tableRows,
        chartLabels: Object.keys(costByDate),
        chartData1: Object.values(costByDate),
        chartData2: [],
        chartTitle1: 'تكلفة المشتريات',
        chartTitle2: '',
        chartType: 'bar',
      })
    } else {
      let totalIn = 0, totalOut = 0
      const filtered = treasury.filter(t => {
        const d = parseGBDate(t.date)
        return d >= fromDate && d <= toDate
      })

      const byDate: Record<string, { in: number; out: number }> = {}
      const tableRows: string[][] = []

      filtered.forEach(t => {
        if (t.type === 'in') totalIn += t.amount; else totalOut += t.amount
        if (!byDate[t.date]) byDate[t.date] = { in: 0, out: 0 }
        if (t.type === 'in') byDate[t.date].in += t.amount; else byDate[t.date].out += t.amount
        tableRows.push([t.date, t.account, t.description, t.type === 'in' ? `$${t.amount.toLocaleString()}` : '-', t.type === 'out' ? `$${t.amount.toLocaleString()}` : '-'])
      })

      const net = totalIn - totalOut
      setReport({
        title: 'تقرير حركة الخزينة العام (وارد وصادر)',
        stats: [
          { label: 'إجمالي الوارد (القبض)', value: `$${totalIn.toLocaleString()}`, color: 'text-success' },
          { label: 'إجمالي الصادر (الصرف)', value: `$${totalOut.toLocaleString()}`, color: 'text-danger' },
          { label: 'المحصلة في هذه الفترة', value: `$${net.toLocaleString()}`, color: net >= 0 ? 'text-primary' : 'text-danger' },
          { label: '', value: '', color: '' },
        ],
        tableHead: ['التاريخ', 'الحساب', 'البيان', 'وارد (+)', 'صادر (-)'],
        tableRows,
        chartLabels: Object.keys(byDate),
        chartData1: Object.values(byDate).map(v => v.in),
        chartData2: Object.values(byDate).map(v => v.out),
        chartTitle1: 'الواردات',
        chartTitle2: 'الصادرات',
        chartType: 'line',
      })
    }
  }

  return (
    <div className="section-view">
      <h4 className="mb-3 fw-bold">
        <i className="fa-solid fa-file-pdf text-danger me-2"></i> التقارير المتقدمة
      </h4>

      <div className="card border-top border-4 border-warning mb-4">
        <div className="card-body">
          <form onSubmit={generateReport} className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label">نوع التقرير</label>
              <select className="form-select" value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="sales">تقرير المبيعات والأرباح</option>
                <option value="purchases">تقرير المشتريات والمخزون</option>
                <option value="treasury">تقرير حركة الخزينة العام</option>
              </select>
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">من تاريخ</label>
              <input type="date" className="form-control" value={dateFrom} onChange={e => setDateFrom(e.target.value)} required />
            </div>
            <div className="col-6 col-md-3">
              <label className="form-label">إلى تاريخ</label>
              <input type="date" className="form-control" value={dateTo} onChange={e => setDateTo(e.target.value)} required />
            </div>
            <div className="col-12 col-md-2">
              <button type="submit" className="btn btn-warning w-100 fw-bold">
                <i className="fa-solid fa-bolt me-1"></i> توليد التقرير
              </button>
            </div>
          </form>
        </div>
      </div>

      {report && (
        <>
          <div className="d-flex justify-content-end mb-3">
            <button className="btn btn-danger" onClick={() => window.print()}>
              <i className="fa-solid fa-file-export me-2"></i> طباعة / تصدير PDF
            </button>
          </div>

          <div className="report-printable-area">
            <div className="d-flex justify-content-between align-items-center mb-4 border-bottom pb-3">
              <div>
                <h3 className="fw-bold text-primary mb-1">{report.title}</h3>
                <p className="text-muted mb-0">الفترة: {dateFrom} إلى {dateTo}</p>
              </div>
              <div className="text-end">
                <h4 className="fw-bold mb-0">
                  <i className="fa-solid fa-truck-fast text-info"></i> نظام المعرض
                </h4>
                <small className="text-muted">تاريخ الطباعة: {new Date().toLocaleDateString('ar-EG')}</small>
              </div>
            </div>

            <div className="row g-3 mb-4">
              {report.stats.filter(s => s.label).map((s, i) => (
                <div key={i} className="col-6 col-md-3">
                  <div className="report-stat-box">
                    <h5>{s.label}</h5>
                    <h3 className={s.color}>{s.value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-4" style={{ height: 300 }}>
              <canvas ref={chartRef}></canvas>
            </div>

            <h5 className="fw-bold text-secondary mb-3">البيانات التفصيلية</h5>
            <div className="table-responsive">
              <table className="table table-bordered table-striped text-center text-nowrap align-middle">
                <thead className="table-dark">
                  <tr>{report.tableHead.map((h, i) => <th key={i}>{h}</th>)}</tr>
                </thead>
                <tbody>
                  {report.tableRows.length === 0 ? (
                    <tr><td colSpan={report.tableHead.length} className="text-muted py-3">لا توجد بيانات في هذه الفترة</td></tr>
                  ) : (
                    report.tableRows.map((row, i) => (
                      <tr key={i}>{row.map((cell, j) => <td key={j}>{cell}</td>)}</tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
