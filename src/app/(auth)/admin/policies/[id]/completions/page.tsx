import {
  resetPolicyCompletion,
  getPolicyById,
  getPolicyCompletions
} from '@/actions/policy'
import { getCurrentUser, getUserById } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { redirect } from 'next/navigation'
import { CompletionsTable } from '@/components/admin/policies/PolicyCompletionsTable'
import type { Policy, PolicyCompletion } from '@/types/policy'
import type { DBUser } from '@/types/user'
import { toISOString } from '@/lib/utils'

const DEBUG = process.env.NODE_ENV === 'development'

interface Props {
  params: Promise<{
    id: string
    locale: string
  }>
}

// Add type for the completion with user
interface CompletionWithUser extends Omit<PolicyCompletion, 'user'> {
  user: DBUser | null
  policy: Policy
}

// Update resetPolicyCompletion to return void
async function handleResetCompletion(formData: FormData) {
  await resetPolicyCompletion(formData)
}

export default async function PolicyCompletionsPage({ params }: Props) {
  try {
    const { id } = await params
    const policyId = Number(id)

    DEBUG &&
      console.log(
        '[PolicyCompletionsPage] Loading policy completions:',
        policyId
      )

    // Get policy completions from the database
    const completions = await getPolicyCompletions(policyId)

    if (!completions) {
      DEBUG && console.log('[PolicyCompletionsPage] No completions found')
      return redirect('/admin/policies')
    }

    const [currentUser, policy] = await Promise.all([
      getCurrentUser(),
      getPolicyById(policyId)
    ])

    if (!currentUser) {
      DEBUG &&
        console.log(
          '[PolicyCompletionsPage] No user found, redirecting to sign-in'
        )
      redirect('/sign-in')
    }

    if (currentUser.role !== 'admin') {
      DEBUG &&
        console.log(
          '[PolicyCompletionsPage] User not admin, redirecting to dashboard'
        )
      redirect('/user/dashboard')
    }

    if (!policy || !policy.policy) {
      DEBUG &&
        console.log('[PolicyCompletionsPage] Policy not found, redirecting')
      redirect('/admin/policies')
    }

    const policyData = policy.policy

    // Fetch user details for each completion and process dates
    DEBUG &&
      console.log(
        '[PolicyCompletionsPage] Processing completions with user data'
      )
    const completionsWithUsers: CompletionWithUser[] = await Promise.all(
      completions.map(async completion => {
        const user = await getUserById(completion.user_id)
        return {
          ...completion,
          created_at: toISOString(new Date(completion.created_at)),
          updated_at: toISOString(new Date(completion.updated_at)),
          user,
          policy: {
            ...policyData,
            effective_date: toISOString(new Date(policyData.effective_date)),
            created_at: toISOString(new Date(policyData.created_at)),
            updated_at: toISOString(new Date(policyData.updated_at))
          }
        }
      })
    )

    return (
      <div className='container relative mx-auto overflow-hidden'>
        <div className='mb-4'>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Policy Completions
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            View and manage completion status for {policyData.name} (
            {policyData.policy_number})
          </p>
        </div>

        <div className='mb-6 flex items-center justify-end'>
          <form action={handleResetCompletion}>
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
  } catch (error) {
    console.error('[PolicyCompletionsPage] Error:', error)
    redirect('/error')
  }
}
