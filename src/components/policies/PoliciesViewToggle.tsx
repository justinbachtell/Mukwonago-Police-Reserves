'use client'

import { useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Grid2X2, Table } from 'lucide-react'

export function PoliciesViewToggle() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const view = searchParams.get('view') ?? 'table'

  const onViewChange = useCallback(
    (newView: string) => {
      const params = new URLSearchParams(searchParams)
      params.set('view', newView)
      router.replace(`${pathname}?${params.toString()}` as any, {
        scroll: false
      })
    },
    [pathname, router, searchParams]
  )

  return (
    <div className='flex items-center gap-2'>
      <Button
        variant={view === 'table' ? 'default' : 'ghost'}
        size='icon'
        onClick={() => onViewChange('table')}
        className='size-8'
      >
        <Table className='size-4' />
        <span className='sr-only'>Table view</span>
      </Button>
      <Button
        variant={view === 'grid' ? 'default' : 'ghost'}
        size='icon'
        onClick={() => onViewChange('grid')}
        className='size-8'
      >
        <Grid2X2 className='size-4' />
        <span className='sr-only'>Grid view</span>
      </Button>
    </div>
  )
}
