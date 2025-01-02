'use client'

import type { Training } from '@/types/training'
import { trainingTypes } from '@/types/training'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTraining, updateTraining } from '@/actions/training'
import { cn } from '@/lib/utils'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

const formSchema = z.object({
  name: z.string().min(1, 'Training name is required'),
  training_type: z.enum(trainingTypes),
  training_date: z.coerce.date(),
  training_start_time: z.string(),
  training_end_time: z.string(),
  training_location: z.string().min(1, 'Location is required'),
  description: z.string().nullable(),
  training_instructor: z.number()
})

interface TrainingFormProps {
  training?: Training
}

export function TrainingForm({ training }: TrainingFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: training
      ? {
          name: training.name,
          training_type: training.training_type,
          training_date: new Date(training.training_date),
          training_start_time: format(
            new Date(training.training_start_time),
            'HH:mm'
          ),
          training_end_time: format(
            new Date(training.training_end_time),
            'HH:mm'
          ),
          training_location: training.training_location,
          description: training.description,
          training_instructor: training.training_instructor
        }
      : {
          name: '',
          training_type: 'other',
          training_date: new Date(),
          training_start_time: '09:00',
          training_end_time: '17:00',
          training_location: '',
          description: null,
          training_instructor: 0
        }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      const trainingData = {
        ...values,
        training_start_time: new Date(
          `${format(values.training_date, 'yyyy-MM-dd')}T${
            values.training_start_time
          }`
        ),
        training_end_time: new Date(
          `${format(values.training_date, 'yyyy-MM-dd')}T${
            values.training_end_time
          }`
        )
      }

      if (training) {
        await updateTraining(training.id, trainingData)
        toast.success('Training updated successfully')
      } else {
        await createTraining(trainingData)
        toast.success('Training created successfully')
      }

      form.reset()
    } catch (error) {
      console.error('Error submitting training:', error)
      toast.error(
        training ? 'Failed to update training' : 'Failed to create training'
      )
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-4'>
        <FormField
          control={form.control}
          name='name'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='training_type'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Training Type</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder='Select training type' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {trainingTypes.map(type => (
                    <SelectItem key={type} value={type}>
                      {type
                        .replace('_', ' ')
                        .split(' ')
                        .map(
                          word => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='training_date'
          render={({ field }) => (
            <FormItem className='flex flex-col'>
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant='outline'
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className='ml-auto size-4 opacity-50' />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className='w-auto p-0' align='start'>
                  <Calendar
                    mode='single'
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={date => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='grid grid-cols-2 gap-4'>
          <FormField
            control={form.control}
            name='training_start_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name='training_end_time'
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type='time' {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name='training_location'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='description'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value || ''} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='training_instructor'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Instructor ID</FormLabel>
              <FormControl>
                <Input
                  type='number'
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type='submit' className='w-full'>
          {training ? 'Update Training' : 'Create Training'}
        </Button>
      </form>
    </Form>
  )
}
