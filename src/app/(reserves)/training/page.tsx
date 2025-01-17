import { getTrainings } from '@/actions/training'
import { TrainingView } from '@/components/reserves/training/TrainingView'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export const metadata = {
  title: 'Training - Mukwonago Police Reserves',
  description: 'View and manage reserve police training sessions'
}

export default async function TrainingPage() {
  const user = await getCurrentUser()
  if (!user) {
    redirect('/auth/login')
  }

  const rawTrainings = await getTrainings()
  if (!rawTrainings) {
    return null
  }

  // Calculate training statistics
  const now = new Date()
  const upcomingTrainings = rawTrainings.filter(
    training => new Date(training.training_date) > now
  ).length
  const pastTrainings = rawTrainings.filter(
    training => new Date(training.training_date) <= now
  ).length
  const myAssignments = rawTrainings.reduce(
    (acc, training) =>
      acc +
      (training.assignments?.filter(a => a.user_id === user.id)?.length || 0),
    0
  )
  const myCompletedAssignments = rawTrainings.reduce(
    (acc, training) =>
      acc +
      (training.assignments?.filter(
        a => a.user_id === user.id && a.completion_status === 'completed'
      )?.length || 0),
    0
  )
  const myCompletionRate =
    myAssignments > 0
      ? Math.round((myCompletedAssignments / myAssignments) * 100)
      : 0

  return (
    <div className='container mx-auto space-y-8 px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GraduationCap className='size-5 text-blue-500' />
            My Training Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-5'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{rawTrainings.length}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Upcoming Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{upcomingTrainings}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Past Trainings</p>
            <p className='mt-1 text-2xl font-bold'>{pastTrainings}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>My Assignments</p>
            <p className='mt-1 text-2xl font-bold'>{myAssignments}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>My Completion Rate</p>
            <p className='mt-1 text-2xl font-bold'>{myCompletionRate}%</p>
          </div>
        </CardContent>
      </Card>

      <TrainingView training={rawTrainings} />
    </div>
  )
}
