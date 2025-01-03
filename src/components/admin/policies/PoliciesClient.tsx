'use client'

import { AdminPoliciesTable } from '@/components/admin/policies/AdminPoliciesTable'
import { deletePolicy } from '@/actions/policy'
import { toast } from 'sonner'
import type { Policy } from '@/types/policy'

const DEFAULT_DATA: Policy[] = []

interface PoliciesClientProps {
  data?: Policy[]
}

export function PoliciesClient({ data = DEFAULT_DATA }: PoliciesClientProps) {
  const handleDelete = async (id: number) => {
    try {
      await deletePolicy(id)
      toast.success('Policy deleted successfully')
    } catch (error) {
      console.error('Error deleting policy:', error)
      toast.error('Failed to delete policy')
    }
  }

  return <AdminPoliciesTable data={data} onDelete={handleDelete} />
}
