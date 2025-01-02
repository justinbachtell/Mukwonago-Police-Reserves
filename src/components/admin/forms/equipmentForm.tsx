/* eslint-disable unused-imports/no-unused-vars */
'use client';

import { createEquipment } from '@/actions/equipment';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { toISOString } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const equipmentFormSchema = z.object({
  description: z.string().optional(),
  is_obsolete: z.boolean().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  notes: z.string().optional(),
  purchase_date: z.date().optional(),
  serial_number: z.string().optional(),
});

type EquipmentFormValues = z.infer<typeof equipmentFormSchema>

export function EquipmentForm() {
  const { toast } = useToast();
  const form = useForm<EquipmentFormValues>({
    defaultValues: {
      description: '',
      is_obsolete: false,
      name: '',
      notes: '',
      purchase_date: new Date(),
      serial_number: '',
    },
    resolver: zodResolver(equipmentFormSchema),
  });

  const onSubmit = async (data: EquipmentFormValues) => {
    try {
      await createEquipment(data);
      toast({
        description: 'New equipment has been added successfully.',
        title: 'Equipment created',
      });
      form.reset({
        ...form.getValues(),
        description: '',
        is_obsolete: false,
        name: '',
        notes: '',
        purchase_date: new Date(),
        serial_number: '',
      });
    }
    catch (error) {
      toast({
        description: 'Failed to create equipment. Please try again.',
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter equipment name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter equipment description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="serial_number"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Serial Number</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Enter serial number" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="purchase_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Purchase Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  value={field.value ? toISOString(field.value).split('T')[0] : ''}
                  onChange={e => field.onChange(e.target.valueAsDate)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="is_obsolete"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Obsolete</FormLabel>
                <FormDescription>
                  Mark this equipment as obsolete if it is no longer in use
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea {...field} placeholder="Enter any additional notes" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Equipment</Button>
      </form>
    </Form>
  );
}
