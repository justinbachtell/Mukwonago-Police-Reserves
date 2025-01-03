import { getAllPolicies } from '@/actions/policy'
import { PoliciesClient } from '@/components/admin/policies/PoliciesClient'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'

export default async function AdminPoliciesPage() {
  const [currentUser, policies] = await Promise.all([
    getCurrentUser(),
    getAllPolicies()
  ])

  if (!currentUser) {
    redirect('/sign-in')
  }

  if (currentUser.role !== 'admin') {
    redirect('/user/dashboard')
  }

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-4'>
        <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
          Policy Management
        </h1>
        <p className='text-gray-600 dark:text-gray-300'>
          Create and manage policies for reserve officers.
        </p>
      </div>

      <div className='w-full space-y-4 overflow-x-auto'>
        <PoliciesClient data={policies} />
      </div>
    </div>
  )
}
