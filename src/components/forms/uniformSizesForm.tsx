'use client';

import type { SaveResult } from '@/types/forms';
import type { UniformSizes } from '@/types/uniformSizes';
import type { DBUser } from '@/types/user';
import type { MutableRefObject } from 'react'
import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { updateUniformSizes } from '@/actions/uniformSizes'
import { Textarea } from '../ui/textarea'
import { toISOString } from '@/lib/utils'
import { createLogger } from '@/lib/debug'
import { createClient } from '@/lib/client'
import type { Session } from '@supabase/supabase-js'

const logger = createLogger({
  module: 'forms',
  file: 'uniformSizesForm.tsx'
})

// Standard shirt sizes including all common variations
const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL', '4XL', '5XL']

// Pant sizes combining waist (28-44) and inseam (30-34) measurements
const PANT_SIZES = [
  '28x30',
  '30x30',
  '32x30',
  '34x30',
  '36x30',
  '38x30',
  '40x30',
  '28x32',
  '30x32',
  '32x32',
  '34x32',
  '36x32',
  '38x32',
  '40x32',
  '30x34',
  '32x34',
  '34x34',
  '36x34',
  '38x34',
  '40x34'
]

// Shoe sizes from 6 to 15, including half sizes
const SHOE_SIZES = [
  '6',
  '6.5',
  '7',
  '7.5',
  '8',
  '8.5',
  '9',
  '9.5',
  '10',
  '10.5',
  '11',
  '11.5',
  '12',
  '13',
  '14',
  '15'
]

interface UniformSizesFormProps {
  user: DBUser
  currentSizes: UniformSizes | null
  saveRef: MutableRefObject<(() => Promise<SaveResult>) | null>
}

export function UniformSizesForm({
  currentSizes,
  saveRef,
  user: dbUser
}: UniformSizesFormProps) {
  logger.info(
    'Rendering uniform sizes form',
    { userId: dbUser.id },
    'UniformSizesForm'
  )
  logger.time('uniform-sizes-form-render')

  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()
  const [session, setSession] = useState<Session | null>(null)

  const [uniformData, setUniformData] = useState<UniformSizes>({
    created_at: currentSizes?.created_at || toISOString(new Date()),
    id: currentSizes?.id || 0,
    is_current: true,
    notes: currentSizes?.notes || '',
    pant_size: currentSizes?.pant_size || '',
    shirt_size: currentSizes?.shirt_size || '',
    shoe_size: currentSizes?.shoe_size || '',
    updated_at: currentSizes?.updated_at || toISOString(new Date()),
    user: dbUser,
    user_id: dbUser.id
  })

  useEffect(() => {
    const checkSession = async () => {
      logger.info('Checking auth session', undefined, 'checkSession')
      const {
        data: { session: currentSession }
      } = await supabase.auth.getSession()
      setSession(currentSession)
      setIsLoading(false)
    }

    checkSession()
  }, [supabase.auth])

  // Update state when props change
  useEffect(() => {
    if (currentSizes) {
      logger.debug(
        'Updating from new currentSizes',
        { currentSizes },
        'UniformSizesForm'
      )

      setUniformData({
        created_at: currentSizes.created_at || toISOString(new Date()),
        id: currentSizes.id,
        is_current: true,
        notes: currentSizes.notes || '',
        pant_size: currentSizes.pant_size,
        shirt_size: currentSizes.shirt_size,
        shoe_size: currentSizes.shoe_size,
        updated_at: currentSizes.updated_at || toISOString(new Date()),
        user: dbUser,
        user_id: dbUser.id
      })
    }
  }, [currentSizes, dbUser])

  const hasUniformSizesChanged = useCallback((): boolean => {
    const changed =
      uniformData.shirt_size !== (currentSizes?.shirt_size || '') ||
      uniformData.pant_size !== (currentSizes?.pant_size || '') ||
      uniformData.shoe_size !== (currentSizes?.shoe_size || '') ||
      uniformData.notes !== (currentSizes?.notes || '')

    logger.debug(
      'Checking for changes',
      { changed, current: currentSizes, new: uniformData },
      'hasUniformSizesChanged'
    )

    return changed
  }, [uniformData, currentSizes])

  const handleUniformChange = (name: keyof UniformSizes, value: string) => {
    logger.debug(
      'Updating uniform field',
      { field: name, value },
      'handleUniformChange'
    )
    setUniformData(prev => ({ ...prev, [name]: value }))
  }

  const handleUniformSizesSaveChanges = useCallback(async () => {
    logger.info(
      'Saving uniform sizes',
      { userId: dbUser.id },
      'handleUniformSizesSaveChanges'
    )
    logger.time('save-uniform-sizes')

    try {
      if (isLoading) {
        logger.warn(
          'Auth state loading',
          undefined,
          'handleUniformSizesSaveChanges'
        )
        return { message: 'Loading authentication state', success: false }
      }

      if (!session) {
        logger.warn(
          'Not authenticated',
          undefined,
          'handleUniformSizesSaveChanges'
        )
        return { message: 'Not authenticated', success: false }
      }

      if (!hasUniformSizesChanged()) {
        logger.info(
          'No changes to save',
          undefined,
          'handleUniformSizesSaveChanges'
        )
        return { message: 'No changes detected', success: true }
      }

      logger.debug(
        'Saving changes',
        { uniformData },
        'handleUniformSizesSaveChanges'
      )
      const updatedSizes = await updateUniformSizes(dbUser.id, uniformData)
      return { data: updatedSizes, success: true }
    } catch (error) {
      logger.error(
        'Error saving changes',
        logger.errorWithData(error),
        'handleUniformSizesSaveChanges'
      )
      return { message: 'Failed to update uniform sizes', success: false }
    } finally {
      logger.timeEnd('save-uniform-sizes')
    }
  }, [uniformData, dbUser.id, isLoading, session, hasUniformSizesChanged])

  // Store the save function in the ref
  useEffect(() => {
    logger.debug('Updating save ref', undefined, 'UniformSizesForm')
    saveRef.current = handleUniformSizesSaveChanges
  }, [handleUniformSizesSaveChanges, saveRef])

  try {
    return (
      <Card className='flex w-full flex-col p-6 shadow-md xl:max-w-[450px]'>
        <h2 className='mb-6 text-xl font-semibold text-gray-900 dark:text-white'>
          Uniform Sizes
        </h2>
        <div className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='shirt_size'>Shirt Size</Label>
            <Select
              value={uniformData.shirt_size}
              onValueChange={value => handleUniformChange('shirt_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select shirt size'>
                  {uniformData.shirt_size || 'Select shirt size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SHIRT_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='pant_size'>Pant Size</Label>
            <Select
              value={uniformData.pant_size}
              onValueChange={value => handleUniformChange('pant_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select pant size'>
                  {uniformData.pant_size || 'Select pant size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {PANT_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='shoe_size'>Shoe Size</Label>
            <Select
              value={uniformData.shoe_size}
              onValueChange={value => handleUniformChange('shoe_size', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder='Select shoe size'>
                  {uniformData.shoe_size || 'Select shoe size'}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {SHOE_SIZES.map(size => (
                  <SelectItem key={size} value={size}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='notes'>Notes</Label>
            <Textarea
              id='notes'
              value={uniformData.notes || ''}
              onChange={e => handleUniformChange('notes', e.target.value)}
              className='w-full'
              placeholder='Any special sizing requirements'
              rows={1}
            />
          </div>
        </div>
      </Card>
    )
  } catch (error) {
    logger.error(
      'Error rendering uniform sizes form',
      logger.errorWithData(error),
      'UniformSizesForm'
    )
    throw error
  } finally {
    logger.timeEnd('uniform-sizes-form-render')
  }
}
