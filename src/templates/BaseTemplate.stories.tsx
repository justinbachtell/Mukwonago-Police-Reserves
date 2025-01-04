import type { Meta, StoryObj } from '@storybook/react';
import messages from '@/locales/en.json'
import { NextIntlClientProvider } from 'next-intl'
import { BaseTemplate } from './BaseTemplate'

const meta = {
  component: BaseTemplate,
  decorators: [
    Story => (
      <NextIntlClientProvider locale='en' messages={messages}>
        <Story />
      </NextIntlClientProvider>
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
    children: <div className='p-4'>Page Content</div>,
    user: null
  }
}

export const WithAuthenticatedUser: Story = {
  args: {
    children: <div className='p-4'>Authenticated User Content</div>,
    user: {
      id: 1,
      email: 'user@example.com',
      first_name: 'John',
      last_name: 'Doe',
      phone: null,
      driver_license: null,
      driver_license_state: null,
      street_address: null,
      city: null,
      state: null,
      zip_code: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clerk_id: 'user_2NkV2OTBx9bHJtV',
      role: 'member',
      position: 'reserve',
      callsign: null,
      radio_number: null
    },
    signOutButton: <button>Sign Out</button>
  }
}

export const WithAdminUser: Story = {
  args: {
    children: <div className='p-4'>Admin User Content</div>,
    user: {
      id: 2,
      email: 'admin@example.com',
      first_name: 'Admin',
      last_name: 'User',
      phone: null,
      driver_license: null,
      driver_license_state: null,
      street_address: null,
      city: null,
      state: null,
      zip_code: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      clerk_id: 'user_2NkV2OTBx9bHJtW',
      role: 'admin',
      position: 'admin',
      callsign: null,
      radio_number: null
    },
    signOutButton: <button>Sign Out</button>
  }
}
