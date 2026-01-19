import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
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
})