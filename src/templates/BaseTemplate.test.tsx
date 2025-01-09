import { render, screen } from '@testing-library/react'
import { BaseTemplate } from './BaseTemplate'
import { vi } from 'vitest'
import type { DBUser } from '@/types/user'
import { UserContext } from '@/components/auth/UserContext'
import { toISOString } from '@/lib/utils'

// Mock needs to be before any imports that use it
vi.mock('@/components/NavigationSidebarWrapper', () => ({
  NavigationSidebarWrapper: () => <div data-testid='mock-sidebar'>Sidebar</div>
}))

describe('BaseTemplate', () => {
  const mockUser: DBUser = {
    id: '1',
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    role: 'member',
    position: 'reserve',
    phone: null,
    street_address: null,
    city: null,
    state: null,
    zip_code: null,
    driver_license: null,
    driver_license_state: null,
    callsign: null,
    radio_number: null,
    status: 'active',
    created_at: toISOString(new Date()),
    updated_at: toISOString(new Date())
  }

  describe('render method', () => {
    it('should render the navigation sidebar', () => {
      render(
        <UserContext.Provider value={null}>
          <BaseTemplate>{null}</BaseTemplate>
        </UserContext.Provider>
      )
      expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    })

    it('should render children content', () => {
      const testContent = 'Test Content'
      render(
        <UserContext.Provider value={null}>
          <BaseTemplate>{testContent}</BaseTemplate>
        </UserContext.Provider>
      )
      expect(screen.getByText(testContent)).toBeInTheDocument()
    })

    it('should render with authenticated user', () => {
      render(
        <UserContext.Provider value={mockUser}>
          <BaseTemplate signOutButton={<button>Sign Out</button>}>
            Content
          </BaseTemplate>
        </UserContext.Provider>
      )
      expect(screen.getByText('Content')).toBeInTheDocument()
      expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    })

    it('should have a link to justinbachtell.com', () => {
      render(
        <UserContext.Provider value={null}>
          <BaseTemplate>{null}</BaseTemplate>
        </UserContext.Provider>
      )
      const link = screen.getByRole('link', { name: 'Justin Bachtell' })
      expect(link).toHaveAttribute('href', 'https://justinbachtell.com')
    })

    it('should display the current year in the copyright notice', () => {
      render(
        <UserContext.Provider value={null}>
          <BaseTemplate>{null}</BaseTemplate>
        </UserContext.Provider>
      )
      const currentYear = new Date().getFullYear()
      expect(
        screen.getByText(new RegExp(currentYear.toString()))
      ).toBeInTheDocument()
    })
  })
})
