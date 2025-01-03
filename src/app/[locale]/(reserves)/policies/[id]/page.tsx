import { getPolicy, getPolicyUrl } from '@/actions/policy'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { notFound } from 'next/navigation'

interface PolicyPageProps {
  params: {
    id: string
    locale: string
  }
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const id = Number(params.id)
  if (Number.isNaN(id)) {
    notFound()
  }

  const policy = await getPolicy(id)
  if (!policy) {
    notFound()
  }

  // Get the signed URL server-side to avoid client-side requests
  const signedUrl = await getPolicyUrl(policy.policy_url)

  return (
    <div className='container py-8 mx-auto'>
      <div className='flex flex-col gap-8'>
        <div className='flex flex-col gap-2'>
          <h1 className='text-2xl font-bold'>{policy.name}</h1>
          <p className='text-muted-foreground'>
            Policy Number: {policy.policy_number}
          </p>
          <p className='text-muted-foreground'>
            Effective Date: {policy.effective_date.toLocaleDateString()}
          </p>
          {policy.description && (
            <p className='text-muted-foreground'>{policy.description}</p>
          )}
        </div>

        <PDFViewer url={signedUrl} />
      </div>
    </div>
  )
}
