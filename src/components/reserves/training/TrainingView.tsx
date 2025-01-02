'use client'

import type { Training } from '@/types/training'
import { Button } from '@/components/ui/button'
import { LayoutGrid, Table } from 'lucide-react'
import { useState } from 'react'
import { TrainingTable } from './TrainingTable'
import { TrainingGrid } from './TrainingGrid'

interface TrainingViewProps {
  training: Training[]
}

export function TrainingView({ training }: TrainingViewProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 lg:mb-0 flex items-center justify-between'>
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

      {viewMode === 'table' ? (
        <TrainingTable data={training} />
      ) : (
        <TrainingGrid data={training} />
      )}
    </div>
  )
}
