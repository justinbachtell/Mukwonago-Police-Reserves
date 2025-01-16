import { LoadingHeader, LoadingForm } from '@/components/loading/LoadingShell'

export default function ApplicationLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      <LoadingHeader />
      <div className='space-y-6'>
        {/* Multiple form sections */}
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <LoadingForm />
          </div>
        ))}
      </div>
    </div>
  )
}
