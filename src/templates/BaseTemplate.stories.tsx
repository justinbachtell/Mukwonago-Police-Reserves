import type { Meta, StoryObj } from '@storybook/react'
import { BaseTemplate } from './BaseTemplate'
import { UserContext } from '@/components/auth/UserContext'
import { toISOString } from '@/lib/utils'

const meta = {
  component: BaseTemplate,
  decorators: [
    Story => (
      <UserContext.Provider value={null}>
        <Story />
      </UserContext.Provider>
    )
  ],
  parameters: {
    layout: 'fullscreen'
  },
  tags: ['autodocs'],
  title: 'templates/BaseTemplate'
} satisfies Meta<typeof BaseTemplate>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    children: <div className='p-4'>Page Content</div>
  }
}

export const WithAuthenticatedUser: Story = {
  decorators: [
    Story => (
      <UserContext.Provider
        value={{
          id: '1',
          email: 'user@example.com',
          first_name: 'John',
          last_name: 'Doe',
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
        }}
      >
        <Story />
      </UserContext.Provider>
    )
  ],
  args: {
    children: <div className='p-4'>Authenticated User Content</div>,
    signOutButton: <button>Sign Out</button>
  }
}

export const WithAdminUser: Story = {
  decorators: [
    Story => (
      <UserContext.Provider
        value={{
          id: '2',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          role: 'admin',
          position: 'admin',
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
        }}
      >
        <Story />
      </UserContext.Provider>
    )
  ],
  args: {
    children: <div className='p-4'>Admin User Content</div>,
    signOutButton: <button>Sign Out</button>
  }
}
