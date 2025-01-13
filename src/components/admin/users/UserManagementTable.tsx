'use client'

import type { SortingState } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { columns, sortUsers } from '@/app/(auth)/admin/users/columns'
import type { UserWithApplication } from '@/app/(auth)/admin/users/columns'
import { useState } from 'react'
import { createLogger } from '@/lib/debug'

const logger = createLogger({
  module: 'admin',
  file: 'users/UserManagementTable.tsx'
})

interface UserManagementTableProps {
  data: UserWithApplication[]
}

export function UserManagementTable({ data }: UserManagementTableProps) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'created_at', desc: true }
  ])

  logger.debug('Rendering UserManagementTable', {
    totalUsers: data.length,
    pendingApplications: data.filter(
      user => user.application_status === 'pending'
    ).length,
    approvedApplications: data.filter(
      user => user.application_status === 'approved'
    ).length,
    rejectedApplications: data.filter(
      user => user.application_status === 'rejected'
    ).length
  })

  try {
    // Apply custom sorting
    const sortedUsers = sortUsers(data)
    logger.debug(
      'Sorted users',
      {
        count: sortedUsers.length,
        firstUser: {
          status: sortedUsers[0]?.application_status,
          date: sortedUsers[0]?.created_at
        },
        lastUser: {
          status: sortedUsers[sortedUsers.length - 1]?.application_status,
          date: sortedUsers[sortedUsers.length - 1]?.created_at
        }
      },
      'UserManagementTable'
    )

    return (
      <DataTable
        columns={columns}
        data={sortedUsers}
        sorting={sorting}
        onSortingChange={setSorting}
      />
    )
  } catch (error) {
    logger.error('Error rendering UserManagementTable', { error })
    return <div>Error loading user data</div>
  }
}
