'use client'

import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/lib/validation'
import { formatters, sanitizeInput, validateInput } from '@/lib/validation'
import { useEffect, useState } from 'react'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

const DEFAULT_RULES: ValidationRule[] = []

export interface FormTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  name: string
  rules?: ValidationRule[]
  formatter?: 'notes' | 'policyName' | 'policyType'
  defaultValue?: string
  error?: string
  onValueChange?: (value: string) => void
}

export function FormTextarea({
  label,
  name,
  rules = DEFAULT_RULES,
  formatter,
  className,
  defaultValue = '',
  error: externalError,
  onValueChange,
  ...props
}: FormTextareaProps) {
  const [value, setValue] = useState(defaultValue)
  const [error, setError] = useState<string | null>(externalError || null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    if (externalError !== undefined) {
      setError(externalError)
    }
  }, [externalError])

  const validate = (value: string) => {
    if (!isDirty) {
      return
    }
    const validationError = validateInput(value, rules)
    setError(validationError)
    return validationError
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    let newValue = e.target.value

    // First apply formatter if one is specified
    if (formatter && formatters[formatter]) {
      newValue = formatters[formatter](newValue)
    }

    // Then sanitize the input
    newValue = sanitizeInput(newValue)

    setValue(newValue)
    validate(newValue)
    onValueChange?.(newValue)
  }

  useEffect(() => {
    if (defaultValue) {
      setValue(defaultValue)
    }
  }, [defaultValue])

  const handleBlur = () => {
    setIsDirty(true)
    validate(value)
  }

  return (
    <div className='space-y-2'>
      <Label htmlFor={name} className='text-sm font-medium'>
        {label}
      </Label>
      <div className='relative'>
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'min-h-[100px] w-full',
            error && 'border-red-500 focus-visible:ring-red-500',
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          {...props}
        />
        {error && (
          <p
            id={`${name}-error`}
            className='mt-1 text-xs text-red-500'
            role='alert'
          >
            {error}
          </p>
        )}
      </div>
    </div>
  )
}
