import { LoadingHeader, LoadingForm } from '@/components/loading/LoadingShell'

export default function SettingsLoading() {
  return (
    <div className='container space-y-8 py-8'>
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
