'use client'

import { PoliciesTable } from '@/components/policies/PoliciesTable'
import { getAllPolicies } from '@/actions/policy'
import { useEffect, useState } from 'react'
import type { Policy } from '@/types/policy'
import Link from 'next/link'

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const data = await getAllPolicies()
        setPolicies(data)
      } catch (error) {
        console.error('Error fetching policies:', error)
      }
    }

    fetchPolicies()
  }, [])

  return (
    <div className='container mx-auto py-6'>
      <h1 className='mb-6 text-2xl font-bold'>Policies</h1>
      <div className='grid gap-6 md:grid-cols-12'>
        <div className='col-span-3 rounded-lg border p-4'>
          <h2 className='mb-4 text-xl font-semibold'>Policy Navigation</h2>
          <nav className='space-y-2'>
            {policies.map(policy => (
              <Link
                key={policy.id}
                href={`/policies/${policy.id}`}
                className='block rounded-md p-2 transition-colors hover:bg-gray-100'
              >
                {policy.policy_number} - {policy.name}
              </Link>
            ))}
          </nav>
        </div>

        <div className='col-span-9 rounded-lg border p-4'>
          <PoliciesTable data={policies} />
        </div>
      </div>
    </div>
  )
}
