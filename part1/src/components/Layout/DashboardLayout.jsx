import { NavLink } from 'react-router-dom'

const DashboardLayout = ({ menuItems, onSignOut, children }) => {
  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-logo">SICC</div>
        <nav className="sidebar-menu">
          {menuItems.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              className={({ isActive }) =>
                `sidebar-link${isActive ? ' active' : ''}`
              }
            >
              {item.label}
            </NavLink>
          ))}
                    <button
            type="button"
            className="sidebar-link"
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </nav>
      </aside>
      <main className="dashboard-content">{children}</main>
    </div>
  )
}

export default DashboardLayout