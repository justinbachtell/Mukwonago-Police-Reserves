import { getPolicy, getPolicyUrl } from '@/actions/policy'
import { PDFViewer } from '@/components/ui/pdf-viewer'
import { notFound } from 'next/navigation'

interface PageProps {
  params: Promise<{
    locale: string
    id: string
  }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PolicyPage({
  params,
  searchParams: _searchParams
}: PageProps) {
  try {
    // Validate and parse policy ID
    const { id } = await params
    if (!id || typeof id !== 'string') {
      return notFound()
    }

    const policyId = Number.parseInt(id, 10)
    if (Number.isNaN(policyId)) {
      return notFound()
    }

    const policy = await getPolicy(policyId)
    if (!policy) {
      return notFound()
    }

    // Get the signed URL server-side to avoid client-side requests
    const signedUrl = await getPolicyUrl(policy.policy_url)

    return (
      <div className='container mx-auto py-8'>
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
  } catch (error) {
    console.error('Error in PolicyPage:', error)
    return notFound()
  }
}
