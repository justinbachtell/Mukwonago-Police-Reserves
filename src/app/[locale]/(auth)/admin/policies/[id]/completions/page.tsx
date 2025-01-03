import {
  getPolicyCompletions,
  resetPolicyCompletion,
  getPolicy
} from '@/actions/policy'
import { getCurrentUser, getUserById } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { CompletionsTable } from '../../../../../../../components/admin/policies/PolicyCompletionsTable'

interface Props {
  params: Promise<{
    id: string
    locale: string
  }>
}

export default async function PolicyCompletionsPage({ params }: Props) {
  const { id } = await params
  const policyId = Number(id)

  const [currentUser, policy, completions] = await Promise.all([
    getCurrentUser(),
    getPolicy(policyId),
    getPolicyCompletions(policyId)
  ])

  if (!currentUser) {
    redirect('/sign-in')
  }

  if (currentUser.role !== 'admin') {
    redirect('/user/dashboard')
  }

  if (!policy) {
    redirect('/admin/policies')
  }

  // Fetch user details for each completion
  const completionsWithUsers = await Promise.all(
    completions.map(async completion => {
      const user = await getUserById(completion.user_id)
      return {
        ...completion,
        user
      }
    })
  )

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-4'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
          Policy Completions
        </h1>
        <p className='text-gray-600 dark:text-gray-300'>
          View and manage completion status for {policy.name} (
          {policy.policy_number})
        </p>
      </div>

      <div className='mb-6 flex items-center justify-end'>
        <form action={resetPolicyCompletion}>
          <input type='hidden' name='policyId' value={policyId} />
          <Button variant='destructive' type='submit'>
            Reset All Completions
          </Button>
        </form>
      </div>

      <div className='w-full space-y-4 overflow-x-auto'>
        <CompletionsTable data={completionsWithUsers} policyId={policyId} />
      </div>
    </div>
  )
}
