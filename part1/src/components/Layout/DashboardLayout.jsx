import { cloneElement, isValidElement, useState } from 'react'
import { NavLink } from 'react-router-dom'

const buildMenuItemKey = (item, index) =>
  item?.key ?? item?.label ?? item?.to ?? index

const defaultRenderMenuItem = (item, index) => (
  <NavLink
    key={buildMenuItemKey(item, index)}
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      `sidebar-link${isActive ? ' active' : ''} ${item.className || ''}`.trim()
    }
  >
    {item.label}
  </NavLink>
)

const DashboardLayout = ({
  menuItems = [],
  onSignOut,
  signOutLabel = 'Sign Out',
  signOutClassName = '',
  logo = 'SICC',
  className = '',
  sidebarClassName = '',
  menuClassName = '',
  contentClassName = '',
  renderMenuItem = defaultRenderMenuItem,
  children,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const handleMobileMenuClose = () => {
    setIsMobileMenuOpen(false)
  }
  const menuNodes = menuItems.map((item, index) => {
    const node = renderMenuItem(item, index)
    if (isValidElement(node) && node.key == null) {
      return cloneElement(node, {
        key: buildMenuItemKey(item, index),
                onClick: (event) => {
          node.props.onClick?.(event)
          if (!event.defaultPrevented) {
            handleMobileMenuClose()
          }
        },
      })
    }
    if (isValidElement(node)) {
      return cloneElement(node, {
        onClick: (event) => {
          node.props.onClick?.(event)
          if (!event.defaultPrevented) {
            handleMobileMenuClose()
          }
        },
      })
    }
    return node
  })

  return (
      <div className={['dashboard', className].filter(Boolean).join(' ')}>
      <header className="mobile-header">
        <span className="mobile-logo">{logo}</span>
        <button
          type="button"
          className="mobile-menu-toggle"
          aria-label="Abrir menú"
          aria-expanded={isMobileMenuOpen}
          onClick={() => setIsMobileMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </header>
      <nav
        className={[
          'mobile-menu',
          isMobileMenuOpen ? 'mobile-menu--open' : '',
        ]
          .filter(Boolean)
          .join(' ')}
      >
        {menuNodes}
        {onSignOut ? (
          <button
            type="button"
            className={['sidebar-link', signOutClassName]
              .filter(Boolean)
              .join(' ')}
            onClick={() => {
              onSignOut?.()
              handleMobileMenuClose()
            }}
          >
             {signOutLabel}
          </button>
        ) : null}
      </nav>
      <aside className={['sidebar', sidebarClassName].filter(Boolean).join(' ')}>
        <div className="sidebar-logo">
          {typeof logo === 'string' ? <span>{logo}</span> : logo}
        </div>
        <nav className={['sidebar-menu', menuClassName].filter(Boolean).join(' ')}>
          {menuNodes}
          {onSignOut ? (
            <button
              type="button"
              className={['sidebar-link', signOutClassName]
                .filter(Boolean)
                .join(' ')}
              onClick={onSignOut}
            >
               {signOutLabel}
            </button>
          ) : null}            
        </nav>
      </aside>
      <main
        className={['dashboard-content', contentClassName]
          .filter(Boolean)
          .join(' ')}
      >
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout