import { getUserTrainingAssignments } from '@/actions/trainingAssignment'
import { getCurrentUser } from '@/actions/user'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GraduationCap, ListPlus } from 'lucide-react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { UserTrainingTable } from '@/components/user/training/UserTrainingTable'
import { UserTrainingGrid } from '@/components/user/training/UserTrainingGrid'
import { ViewToggle } from '@/components/ui/view-toggle'
import { Suspense } from 'react'

export const metadata = {
  title: 'My Training - Mukwonago Police Reserves',
  description:
    'View your training assignments and sign up for new training sessions'
}

export default async function UserTrainingPage() {
  const user = await getCurrentUser()
  if (!user) {
    return notFound()
  }

  const trainingAssignments = await getUserTrainingAssignments(user.id)

  return (
    <div className='container mx-auto min-h-screen px-4 md:px-6 lg:px-10'>
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-3xl font-bold'>My Training</h1>
          <p className='mt-2 text-muted-foreground'>
            View and manage your training assignments
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <Link href='/training'>
            <Button variant='outline' className='gap-2'>
              <ListPlus className='size-4' />
              View All Training
            </Button>
          </Link>
          <ViewToggle />
        </div>
      </div>

      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <GraduationCap className='size-5 text-purple-500' />
            Training Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-3'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Assignments</p>
            <p className='mt-1 text-2xl font-bold'>
              {trainingAssignments?.length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Upcoming Training</p>
            <p className='mt-1 text-2xl font-bold'>
              {trainingAssignments?.filter(
                assignment =>
                  assignment.training &&
                  new Date(assignment.training.training_date) >= new Date()
              ).length ?? 0}
            </p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Completed Training</p>
            <p className='mt-1 text-2xl font-bold'>
              {trainingAssignments?.filter(
                assignment =>
                  assignment.training &&
                  new Date(assignment.training.training_date) < new Date()
              ).length ?? 0}
            </p>
          </div>
        </CardContent>
      </Card>

      <Suspense fallback={<div>Loading training...</div>}>
        <UserTrainingTable data={trainingAssignments ?? []} />
        <UserTrainingGrid data={trainingAssignments ?? []} />
      </Suspense>
    </div>
  )
}
