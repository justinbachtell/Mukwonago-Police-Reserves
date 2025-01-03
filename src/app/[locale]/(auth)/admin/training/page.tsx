import { getTrainings } from '@/actions/training'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { TrainingTableWrapper } from '@/components/admin/training/TrainingTableWrapper'

export const metadata = {
  description: 'Manage training sessions and participants',
  title: 'Training Management'
}

export default async function TrainingManagementPage() {
  const user = await getCurrentUser()

  if (!user || user.role !== 'admin') {
    redirect('/')
  }

  const trainings = await getTrainings()

  return (
    <div className='container space-y-6 px-4 py-6 lg:space-y-10 lg:py-10'>
      <TrainingTableWrapper initialData={trainings} />
    </div>
  )
}
