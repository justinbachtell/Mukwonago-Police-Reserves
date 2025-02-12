'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import type { ValidationRule } from '@/lib/validation'
import { formatters, validateInput } from '@/lib/validation'
import { useEffect, useState } from 'react'

const DEFAULT_RULES: ValidationRule[] = []

export interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  name: string
  rules?: ValidationRule[]
  formatter?:
    | 'phone'
    | 'zipCode'
    | 'driversLicense'
    | 'policyName'
    | 'policyNumber'
    | 'policyType'
    | 'notes'
    | 'streetAddress'
    | 'city'
    | 'name'
  onValueChange?: (value: string) => void
  error?: string
  value?: string
}

export function FormInput({
  label,
  name,
  rules = DEFAULT_RULES,
  formatter,
  onValueChange,
  error: externalError,
  value: propValue = '',
  ...props
}: FormInputProps) {
  const [value, setValue] = useState(propValue)
  const [error, setError] = useState<string | null>(externalError || null)
  const [isDirty, setIsDirty] = useState(false)

  useEffect(() => {
    setValue(propValue)
  }, [propValue])

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Only apply formatters for specific types that need formatting
    if (
      formatter &&
      ['phone', 'zipCode', 'driversLicense'].includes(formatter)
    ) {
      newValue = formatters[formatter](newValue)
    }

    setValue(newValue)
    validate(newValue)
    onValueChange?.(newValue)
  }

  useEffect(() => {
    if (props.defaultValue) {
      setValue(props.defaultValue.toString())
    }
  }, [props.defaultValue])

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
        <Input
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            'w-full',
            error && 'border-red-500 focus-visible:ring-red-500',
            props.className
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
