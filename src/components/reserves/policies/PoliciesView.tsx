'use client'

import type { Policy } from '@/types/policy'
import { Button } from '@/components/ui/button'
import { Grid2X2, Table } from 'lucide-react'
import { useState, Suspense } from 'react'
import { PoliciesTable } from '@/components/policies/PoliciesTable'
import { PoliciesGrid } from '@/components/reserves/policies/PoliciesGrid'
import { Skeleton } from '@/components/ui/skeleton'

interface PoliciesViewProps {
  policies: Policy[]
  completedPolicies: Record<number, boolean>
}

function PoliciesTableSkeleton() {
  return (
    <div className='space-y-4'>
      <div className='rounded-md border'>
        <div className='p-4'>
          <div className='space-y-3'>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className='flex items-center justify-between'>
                <Skeleton className='h-4 w-[200px]' />
                <div className='flex gap-2'>
                  <Skeleton className='size-8' />
                  <Skeleton className='size-8' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PoliciesView({
  policies,
  completedPolicies
}: PoliciesViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  return (
    <div className='container mx-auto py-8'>
      <div className='mb-6 flex items-center justify-between lg:mb-0'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Policies
          </h1>
          <p className='pr-8 text-gray-600 dark:text-gray-300'>
            View and acknowledge required department policies.
          </p>
        </div>

        <div className='flex gap-2'>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
            size='icon'
          >
            <Table className='size-4' />
          </Button>
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            onClick={() => setViewMode('grid')}
            size='icon'
          >
            <Grid2X2 className='size-4' />
          </Button>
        </div>
      </div>

      <Suspense fallback={<PoliciesTableSkeleton />}>
        {viewMode === 'table' ? (
          <PoliciesTable
            data={policies}
            completedPolicies={completedPolicies}
          />
        ) : (
          <PoliciesGrid data={policies} completedPolicies={completedPolicies} />
        )}
      </Suspense>
    </div>
  )
}
