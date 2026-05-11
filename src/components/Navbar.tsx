import { TabId } from '../App'

interface Props {
  activeTab: TabId
  onSwitchTab: (tab: TabId) => void
  onImportDummy: () => void
  onClearData: () => void
}

export default function Navbar({ activeTab, onSwitchTab, onImportDummy, onClearData }: Props) {
  return (
    <nav className="navbar navbar-expand-lg sticky-top mb-3 mb-md-4">
      <div className="container">
        <a className="navbar-brand">
          <i className="fa-solid fa-truck-fast me-2 text-info"></i> إدارة المعرض
        </a>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {([
              { id: 'dashboard', label: 'الرئيسية' },
              { id: 'inventory', label: 'إضافة بطاقة' },
              { id: 'sales', label: 'المبيعات' },
              { id: 'treasury', label: 'الخزينة' },
            ] as { id: TabId; label: string }[]).map(tab => (
              <li key={tab.id} className="nav-item">
                <a
                  className={`nav-link${activeTab === tab.id ? ' active' : ''}`}
                  onClick={() => onSwitchTab(tab.id)}
                >
                  {tab.label}
                </a>
              </li>
            ))}
            <li className="nav-item">
              <a
                className={`nav-link text-warning${activeTab === 'reports' ? ' active' : ''}`}
                onClick={() => onSwitchTab('reports')}
              >
                <i className="fa-solid fa-chart-pie me-1"></i> التقارير
              </a>
            </li>
          </ul>
          <div className="d-flex flex-column flex-lg-row gap-2 mt-3 mt-lg-0 pb-3 pb-lg-0">
            <button className="btn btn-success btn-sm w-100" onClick={onImportDummy}>
              <i className="fa-solid fa-download"></i> جلب بيانات
            </button>
            <button className="btn btn-outline-danger btn-sm w-100" onClick={onClearData}>
              <i className="fa-solid fa-trash-can"></i> مسح الكل
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
