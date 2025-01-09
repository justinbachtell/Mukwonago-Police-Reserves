import { LoadingShell } from '@/components/loading/LoadingShell'

export default function HomeLoading() {
  return (
    <div className='min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900'>
      {/* Hero Section Loading */}
      <div className='container mx-auto px-4 pb-16 pt-20'>
        <LoadingShell className='mx-auto max-w-4xl text-center'>
          <div className='mt-8 flex justify-center gap-4'>
            <div className='h-14 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
            <div className='h-14 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
          </div>
        </LoadingShell>
      </div>

      {/* Department Overview Loading */}
      <div className='bg-white py-20 dark:bg-gray-900'>
        <div className='container mx-auto px-4'>
          <LoadingShell className='mb-16 text-center'>
            <div className='mt-8 grid gap-8 md:grid-cols-2'>
              <div className='h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              <div className='h-48 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
            </div>
          </LoadingShell>
        </div>
      </div>

      {/* Requirements Section Loading */}
      <div className='py-20'>
        <div className='container mx-auto px-4'>
          <LoadingShell className='text-center'>
            <div className='mt-8 grid gap-8 md:grid-cols-3'>
              <div className='h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              <div className='h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              <div className='h-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
            </div>
          </LoadingShell>
        </div>
      </div>

      {/* Reserve Program Section Loading */}
      <div className='py-20'>
        <div className='container mx-auto px-4'>
          <LoadingShell className='mb-16 text-center'>
            <div className='mt-8 grid gap-8 md:grid-cols-3'>
              <div className='h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              <div className='h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
              <div className='h-64 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800' />
            </div>
          </LoadingShell>
        </div>
      </div>

      {/* CTA Section Loading */}
      <div className='container mx-auto px-4 pb-20'>
        <div className='h-64 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800' />
      </div>
    </div>
  )
}
