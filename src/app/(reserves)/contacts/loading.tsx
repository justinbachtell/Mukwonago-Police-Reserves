import { LoadingHeader, LoadingCard } from '@/components/loading/LoadingShell'

export default function ContactsLoading() {
  return (
    <div className='container mx-auto space-y-6 px-4 py-8 md:px-6 lg:px-8'>
      <LoadingHeader />
      <div className='grid gap-6 md:grid-cols-2'>
        {Array.from({ length: 4 }).map((_, i) => (
          <LoadingCard key={i} />
        ))}
      </div>
    </div>
  )
}
