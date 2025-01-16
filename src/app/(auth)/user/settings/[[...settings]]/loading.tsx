import { LoadingHeader, LoadingForm } from '@/components/loading/LoadingShell'

export default function SettingsLoading() {
  return (
    <div className='container mx-auto space-y-8 px-4 py-8 md:px-6 lg:px-8'>
      <LoadingHeader />
      <div className='space-y-6'>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className='space-y-4'>
            <LoadingForm />
          </div>
        ))}
      </div>
    </div>
  )
}
