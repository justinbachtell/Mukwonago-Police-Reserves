'use client';

import { returnEquipment } from '@/actions/assignedEquipment';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { FormTextarea } from '@/components/ui/form-textarea'
import { useToast } from '@/hooks/use-toast'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { rules } from '@/lib/validation'

const returnEquipmentSchema = z.object({
  condition: z.enum(['new', 'good', 'fair', 'poor', 'damaged/broken']),
  notes: z.string().optional(),
});

type ReturnEquipmentFormValues = z.infer<typeof returnEquipmentSchema>

interface ReturnEquipmentFormProps {
  assignmentId: number
  currentCondition: 'new' | 'good' | 'fair' | 'poor' | 'damaged/broken'
}

export function ReturnEquipmentForm({ assignmentId, currentCondition }: ReturnEquipmentFormProps) {
  const { toast } = useToast();
  const form = useForm<ReturnEquipmentFormValues>({
    defaultValues: {
      condition: currentCondition,
      notes: '',
    },
    resolver: zodResolver(returnEquipmentSchema),
  });

  const onSubmit = async (data: ReturnEquipmentFormValues) => {
    try {
      await returnEquipment(assignmentId, data.condition, data.notes);
      toast({
        description: 'Equipment has been returned successfully.',
        title: 'Equipment returned',
      });
      window.location.reload();
    }
    catch (error) {
      console.error('Error returning equipment:', error);
      toast({
        description: 'Failed to return equipment. Please try again.',
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant='outline' size='sm'>
          Return
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Return Equipment</DialogTitle>
          <DialogDescription>
            Please provide the condition of the equipment and any notes about
            its return.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-6'>
            <FormField
              control={form.control}
              name='condition'
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condition</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder='Select condition' />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value='new'>New</SelectItem>
                      <SelectItem value='good'>Good</SelectItem>
                      <SelectItem value='fair'>Fair</SelectItem>
                      <SelectItem value='poor'>Poor</SelectItem>
                      <SelectItem value='damaged/broken'>
                        Damaged/Broken
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='notes'
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormTextarea
                      {...field}
                      label='Notes'
                      placeholder='Enter any notes about the return'
                      rules={[rules.notes()]}
                      onValueChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type='submit'>Return Equipment</Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
