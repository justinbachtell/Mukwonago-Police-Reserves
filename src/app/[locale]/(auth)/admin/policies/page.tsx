import { getAllPolicies } from '@/actions/policy'
import { PolicyForm } from '@/components/admin/policies/PolicyForm'
import { PoliciesTable } from '@/components/policies/PoliciesTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog'
import { Plus } from 'lucide-react'

export default async function AdminPoliciesPage() {
  const policies = await getAllPolicies()

  return (
    <div className='container mx-auto px-4 py-8'>
      <div className='mb-6 flex items-center justify-between'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Policy Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage policies for reserve officers.
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className='mr-2 size-4' />
              Create Policy
            </Button>
          </DialogTrigger>
          <DialogContent className='max-h-[90vh] overflow-y-auto sm:max-w-[600px]'>
            <DialogHeader>
              <DialogTitle>Create New Policy</DialogTitle>
            </DialogHeader>
            <PolicyForm />
          </DialogContent>
        </Dialog>
      </div>

      <PoliciesTable data={policies} />
    </div>
  )
}
