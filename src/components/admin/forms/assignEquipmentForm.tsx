'use client';

import type { Equipment } from '@/types/equipment';
import type { DBUser } from '@/types/user';
import { createAssignedEquipment } from '@/actions/assignedEquipment';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

const assignEquipmentSchema = z.object({
  checked_out_at: z.string(),
  condition: z.enum(['new', 'good', 'fair', 'poor']),
  equipment_id: z.number(),
  expected_return_date: z.string().optional(),
  notes: z.string().optional(),
});

type AssignEquipmentFormValues = z.infer<typeof assignEquipmentSchema>

interface AssignEquipmentFormProps {
  user: DBUser
  availableEquipment: Equipment[]
}

export function AssignEquipmentForm({
  availableEquipment,
  user,
}: AssignEquipmentFormProps) {
  const { toast } = useToast();
  const form = useForm<AssignEquipmentFormValues>({
    defaultValues: {
      checked_out_at: new Date().toISOString().split('T')[0],
      expected_return_date: '',
      notes: '',
    },
    resolver: zodResolver(assignEquipmentSchema),
  });

  const onSubmit = async (data: AssignEquipmentFormValues) => {
    try {
      await createAssignedEquipment({
        ...data,
        user_id: user.id,
      });
      toast({
        description: 'Equipment has been assigned successfully.',
        title: 'Equipment assigned',
      });
      form.reset();
    }
    catch {
      toast({
        description: 'Failed to assign equipment. Please try again.',
        title: 'Error',
        variant: 'destructive',
      });
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="equipment_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Equipment</FormLabel>
              <Select
                onValueChange={val =>
                  field.onChange(Number.parseInt(val, 10))}
                defaultValue={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableEquipment.map(item => (
                    <SelectItem
                      key={item.id}
                      value={item.id.toString()}
                    >
                      {item.name}
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
          name="condition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Condition</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="poor">Poor</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checked_out_at"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check Out Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="expected_return_date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Expected Return Date</FormLabel>
              <FormControl>
                <Input
                  type="date"
                  {...field}
                />
              </FormControl>
              <FormMessage />
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
                <Textarea
                  placeholder="Enter any additional notes"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Assign Equipment</Button>
      </form>
    </Form>
  );
}
