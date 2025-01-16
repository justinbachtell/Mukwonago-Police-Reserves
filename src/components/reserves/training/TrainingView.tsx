'use client'

import type { Training } from '@/types/training'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table } from 'lucide-react'
import { useState, Suspense } from 'react'
import { TrainingTable } from './TrainingTable'
import { TrainingGrid } from './TrainingGrid'
import { Skeleton } from '@/components/ui/skeleton'

interface TrainingViewProps {
  training: Training[]
}

function TrainingTableSkeleton() {
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

export function TrainingView({ training }: TrainingViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  return (
    <div className='container mx-auto pt-8'>
      <div className='mb-6 flex items-center justify-between lg:mb-0'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Training
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            View and sign up for upcoming training sessions.
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
            <LayoutGrid className='size-4' />
          </Button>
        </div>
      </div>

      <Suspense fallback={<TrainingTableSkeleton />}>
        {viewMode === 'table' ? (
          <TrainingTable data={training} />
        ) : (
          <TrainingGrid data={training} />
        )}
      </Suspense>
    </div>
  )
}
