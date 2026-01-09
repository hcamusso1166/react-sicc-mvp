const DashboardLayout = ({ menuItems, activeView, onNavigate, children }) => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">SICC</div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <button
              key={item}
              type="button"
              className={`sidebar-link${activeView === item ? ' active' : ''}`}
              onClick={() => onNavigate(item)}
            >
              {item}
            </button>
          ))}
        </nav>
      </aside>
      <main className="dashboard-content">{children}</main>
    </div>
  )
}

export default DashboardLayout