'use client'

import { LayoutGrid, Table } from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from './button'
import type { Route } from 'next'

export function ViewToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'table'

  const setView = (newView: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('view', newView)
    router.push(`${pathname}?${params.toString()}` as Route)
  }

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant={view === 'table' ? 'default' : 'outline'}
        size='icon'
        onClick={() => setView('table')}
        aria-label='Table view'
      >
        <Table className='size-4' />
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'outline'}
        size='icon'
        onClick={() => setView('grid')}
        aria-label='Grid view'
      >
        <LayoutGrid className='size-4' />
      </Button>
    </div>
  )
}
