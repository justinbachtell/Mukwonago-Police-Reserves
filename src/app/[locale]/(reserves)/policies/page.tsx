'use client'

import { PoliciesTable } from '@/components/policies/PoliciesTable'
import { getPoliciesWithCompletionStatus } from '@/actions/policy'
import { useEffect, useState } from 'react'
import type { Policy } from '@/types/policy'
import { toast } from 'sonner'
import { LoaderCircle } from 'lucide-react'

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [completedPolicies, setCompletedPolicies] = useState<
    Record<number, boolean>
  >({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true)
        const data = await getPoliciesWithCompletionStatus()
        setPolicies(data.policies)
        setCompletedPolicies(data.completedPolicies)
      } catch (error) {
        console.error('Error fetching policies:', error)
        toast.error('Failed to fetch policies')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handlePolicyAcknowledged = (policyId: number) => {
    setCompletedPolicies(prev => ({
      ...prev,
      [policyId]: true
    }))
  }

  if (isLoading) {
    return (
      <div className='container mx-auto py-6'>
        <h1 className='mb-6 text-2xl font-bold'>Policies</h1>
        <div className='flex flex-col gap-6'>
          <div className='flex h-1/3 w-full items-center justify-center rounded-lg border p-4'>
            <LoaderCircle className='size-12 animate-spin opacity-50' />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='container mx-auto py-6'>
      <h1 className='mb-6 text-2xl font-bold'>Policies</h1>
      <div className='flex flex-col gap-6'>
        <PoliciesTable
          data={policies}
          completedPolicies={completedPolicies}
          onPolicyAcknowledged={handlePolicyAcknowledged}
        />
      </div>
    </div>
  )
}
