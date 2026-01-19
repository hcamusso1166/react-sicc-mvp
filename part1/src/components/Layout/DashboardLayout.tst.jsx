import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import DashboardLayout from './DashboardLayout'

const renderLayout = (props) =>
  renderToStaticMarkup(
    <MemoryRouter>
      <DashboardLayout {...props}>
        <div>Dashboard content</div>
      </DashboardLayout>
    </MemoryRouter>,
  )

describe('DashboardLayout', () => {
  it('renders the logo, menu items, sign out action, and content', () => {
    const markup = renderLayout({
      menuItems: [{ label: 'Home', to: '/' }],
      onSignOut: () => {},
    })

    expect(markup).toContain('SICC')
    expect(markup).toContain('Home')
    expect(markup).toContain('Sign Out')
    expect(markup).toContain('Dashboard content')
  })

  it('omits the sign out action when no handler is provided', () => {
    const markup = renderLayout({
      menuItems: [{ label: 'Reports', to: '/reports' }],
      logo: 'Portal',
    })

    expect(markup).toContain('Portal')
    expect(markup).toContain('Reports')
    expect(markup).not.toContain('Sign Out')
  })

  it('merges class names for layout sections', () => {
    const markup = renderLayout({
      menuItems: [{ label: 'Docs', to: '/docs' }],
      className: 'layout-root',
      sidebarClassName: 'layout-sidebar',
      menuClassName: 'layout-menu',
      contentClassName: 'layout-content',
    })

    expect(markup).toContain('dashboard layout-root')
    expect(markup).toContain('sidebar layout-sidebar')
    expect(markup).toContain('sidebar-menu layout-menu')
    expect(markup).toContain('dashboard-content layout-content')
  })

  it('supports custom logo content and menu rendering', () => {
    const renderMenuItem = vi.fn((item) => (
      <a className="custom-link" href={item.to}>
        {item.label}
      </a>
    ))

    const markup = renderLayout({
      menuItems: [{ label: 'Custom', to: '/custom' }],
      logo: <strong>Portal</strong>,
      renderMenuItem,
    })

    expect(renderMenuItem).toHaveBeenCalledWith(
      { label: 'Custom', to: '/custom' },
      0,
    )
    expect(markup).toContain('<strong>Portal</strong>')
    expect(markup).toContain('custom-link')
    expect(markup).toContain('Custom')
  })
})