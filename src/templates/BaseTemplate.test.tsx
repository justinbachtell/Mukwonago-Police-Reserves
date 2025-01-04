import messages from '@/locales/en.json';
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import { BaseTemplate } from './BaseTemplate'
import { vi } from 'vitest'

const mockNavigationSidebarWrapper = vi.fn(() => (
  <div data-testid='mock-sidebar'>Sidebar</div>
))

vi.mock('@/components/NavigationSidebarWrapper', () => ({
  NavigationSidebarWrapper: mockNavigationSidebarWrapper
}))

describe('BaseTemplate', () => {
  describe('render method', () => {
    it('should render the navigation sidebar', () => {
      render(
        <NextIntlClientProvider locale='en' messages={messages}>
          <BaseTemplate user={null}>{null}</BaseTemplate>
        </NextIntlClientProvider>
      )

      expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument()
    })

    it('should render children content', () => {
      const testContent = 'Test Content'
      render(
        <NextIntlClientProvider locale='en' messages={messages}>
          <BaseTemplate user={null}>{testContent}</BaseTemplate>
        </NextIntlClientProvider>
      )

      expect(screen.getByText(testContent)).toBeInTheDocument()
    })

    it('should have a link to justinbachtell.com', () => {
      render(
        <NextIntlClientProvider locale='en' messages={messages}>
          <BaseTemplate user={null}>{null}</BaseTemplate>
        </NextIntlClientProvider>
      )

      const link = screen.getByRole('link', { name: 'Justin Bachtell' })

      /*
       * PLEASE READ THIS SECTION
       * We'll really appreciate if you could have a link to our website
       * The link doesn't need to appear on every pages, one link on one page is enough.
       * Thank you for your support it'll mean a lot for us.
       */
      expect(link).toHaveAttribute('href', 'https://justinbachtell.com')
    })
  })
})
