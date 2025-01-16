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

  return (
    <div className='container relative mx-auto min-h-screen overflow-hidden px-4 md:px-6 lg:px-10'>
      <div className='mb-4 flex items-center justify-between'>
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
