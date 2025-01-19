'use client'

import { getAllPolicies } from '@/actions/policy'
import { PoliciesClient } from '@/components/admin/policies/PoliciesClient'
import { getCurrentUser } from '@/actions/user'
import { redirect } from 'next/navigation'
import { createLogger } from '@/lib/debug'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { PolicyForm } from '@/components/admin/forms/PolicyForm'
import type { Policy } from '@/types/policy'
import { LoadingCard } from '@/components/ui/loading'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollText } from 'lucide-react'

const logger = createLogger({
  module: 'admin',
  file: 'policies/page.tsx'
})

export default function AdminPoliciesPage() {
  const [open, setOpen] = useState(false)
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPolicies = async () => {
    try {
      const [currentUser, fetchedPolicies] = await Promise.all([
        getCurrentUser(),
        getAllPolicies()
      ])

      if (!currentUser) {
        logger.warn(
          'No user found, redirecting to sign-in',
          undefined,
          'AdminPoliciesPage'
        )
        redirect('/sign-in')
      }

      if (currentUser.role !== 'admin') {
        logger.warn(
          'Non-admin user access attempt',
          { userId: currentUser.id },
          'AdminPoliciesPage'
        )
        redirect('/user/dashboard')
      }

      setPolicies(fetchedPolicies ?? [])
      logger.info(
        'Policies loaded successfully',
        { count: fetchedPolicies?.length },
        'AdminPoliciesPage'
      )
    } catch (error) {
      logger.error(
        'Error fetching policies',
        logger.errorWithData(error),
        'AdminPoliciesPage'
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPolicies()
  }, [])

  if (loading) {
    return <LoadingCard />
  }

  // Calculate policy statistics
  const totalPolicies = policies.length
  const totalCompletions = policies.reduce(
    (acc, policy) => acc + (policy.completions?.length || 0),
    0
  )
  const policiesWithCompletions = policies.filter(
    policy => policy.completions && policy.completions.length > 0
  ).length
  const completionRate =
    totalPolicies > 0
      ? Math.round((policiesWithCompletions / totalPolicies) * 100)
      : 0

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 pt-4 md:px-6 lg:px-10'>
      {/* Stats Card */}
      <Card className='mb-8 bg-white/80 shadow-md dark:bg-white/5'>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <ScrollText className='size-5 text-blue-500' />
            Policy Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className='grid gap-4 sm:grid-cols-4'>
          <div>
            <p className='text-sm text-muted-foreground'>Total Policies</p>
            <p className='mt-1 text-2xl font-bold'>{totalPolicies}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Total Completions</p>
            <p className='mt-1 text-2xl font-bold'>{totalCompletions}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>
              Policies with Completions
            </p>
            <p className='mt-1 text-2xl font-bold'>{policiesWithCompletions}</p>
          </div>
          <div>
            <p className='text-sm text-muted-foreground'>Completion Rate</p>
            <p className='mt-1 text-2xl font-bold'>{completionRate}%</p>
          </div>
        </CardContent>
      </Card>

      <div className='mb-4 flex flex-col items-center justify-between gap-4 md:flex-row'>
        <div>
          <h1 className='mb-2 text-3xl font-bold text-gray-900 dark:text-white'>
            Policy Management
          </h1>
          <p className='text-gray-600 dark:text-gray-300'>
            Create and manage policies for reserve officers.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Create Policy</Button>
      </div>

      <div className='w-full space-y-4 overflow-x-auto'>
        <PoliciesClient data={policies} />
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Policy</DialogTitle>
          </DialogHeader>
          <PolicyForm
            closeDialog={() => setOpen(false)}
            onSuccess={() => {
              setOpen(false)
              fetchPolicies()
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
