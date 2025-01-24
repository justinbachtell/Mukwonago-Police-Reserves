import DOMPurify from 'isomorphic-dompurify'

// Input validation types
export type ValidationRule = {
  test: (value: string) => boolean
  message: string
}

// Common validation rules
export const rules = {
  required: (fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length > 0,
    message: `${fieldName} is required`
  }),
  minLength: (length: number, fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length >= length,
    message: `${fieldName} must be at least ${length} characters`
  }),
  maxLength: (length: number, fieldName: string): ValidationRule => ({
    test: (value: string) => value.trim().length <= length,
    message: `${fieldName} cannot exceed ${length} characters`
  }),
  email: (): ValidationRule => ({
    test: (value: string) => /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value),
    message: 'Please enter a valid email address'
  }),
  phone: (): ValidationRule => ({
    test: (value: string) => /^\(\d{3}\) \d{3}-\d{4}$/.test(value),
    message: 'Please enter a valid phone number in format (XXX) XXX-XXXX'
  }),
  zipCode: (): ValidationRule => ({
    test: (value: string) => /^\d{5}$/.test(value),
    message: 'Please enter a valid 5-digit ZIP code'
  }),
  driversLicense: (): ValidationRule => ({
    test: (value: string) => /^[A-Z0-9]{1,15}$/.test(value.toUpperCase()),
    message:
      "Please enter a valid driver's license number (letters and numbers only)"
  }),
  name: (): ValidationRule => ({
    test: (value: string) => /^[a-z\s\-']{2,50}$/i.test(value),
    message:
      'Please enter a valid name (letters, spaces, hyphens and apostrophes only)'
  }),
  streetAddress: (): ValidationRule => ({
    test: (value: string) => /^[a-z0-9\s\-.,#]{5,100}$/i.test(value),
    message: 'Please enter a valid street address'
  }),
  city: (): ValidationRule => ({
    test: (value: string) => /^[a-z\s\-']{2,50}$/i.test(value),
    message: 'Please enter a valid city name'
  }),
  // Equipment-related validation rules
  notes: (maxLength: number = 500): ValidationRule => ({
    test: (value: string) =>
      value.length <= maxLength && /^[a-z0-9\s.,!?()'\-"]*$/i.test(value),
    message: `Notes must be less than ${maxLength} characters and contain only letters, numbers, and basic punctuation`
  }),
  condition: (): ValidationRule => ({
    test: (value: string) =>
      ['new', 'good', 'fair', 'poor', 'damaged/broken'].includes(
        value.toLowerCase()
      ),
    message: 'Please select a valid condition'
  }),
  equipmentId: (): ValidationRule => ({
    test: (value: string) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        value
      ),
    message: 'Invalid equipment ID format'
  }),
  // Password validation rules
  password: (): ValidationRule => ({
    test: (value: string) => {
      const hasMinLength = value.length >= 8
      const hasUpperCase = /[A-Z]/.test(value)
      const hasLowerCase = /[a-z]/.test(value)
      const hasNumber = /\d/.test(value)
      const hasSpecialChar = /[!@#$%^&*]/.test(value)
      return (
        hasMinLength &&
        hasUpperCase &&
        hasLowerCase &&
        hasNumber &&
        hasSpecialChar
      )
    },
    message:
      'Password must be at least 8 characters and contain uppercase, lowercase, number, and special character'
  }),

  passwordMatch: (compareValue: string): ValidationRule => ({
    test: (value: string) => value === compareValue,
    message: 'Passwords do not match'
  })
}

// Input formatters
export const formatters = {
  phone: (value: string): string => {
    const digits = value.replace(/\D/g, '')
    if (digits.length <= 3) {
      return digits
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  },
  zipCode: (value: string): string => {
    return value.replace(/\D/g, '').slice(0, 5)
  },
  driversLicense: (value: string): string => {
    return value
      .replace(/[^a-z0-9]/gi, '')
      .toUpperCase()
      .slice(0, 15)
  },
  name: (value: string): string => {
    // Allow letters, spaces, hyphens, and apostrophes
    const sanitized = value.replace(/[^a-z\s\-']/gi, '')
    return sanitized.trim().slice(0, 50)
  },
  // Policy-related formatters
  policyName: (value: string): string => {
    // Allow letters, numbers, spaces, and basic punctuation
    const sanitized = value.replace(/[^a-z0-9\s\-.,()]/gi, '')
    return sanitized.trim().slice(0, 100)
  },
  policyType: (value: string): string => {
    // Allow letters, numbers, and spaces
    const sanitized = value.replace(/[^a-z0-9\s\-]/gi, '')
    return sanitized.trim().slice(0, 50)
  },
  policyNumber: (value: string): string => {
    // Allow letters, numbers, hyphens, and dots
    return value
      .replace(/[^a-z0-9\-.]/gi, '')
      .toUpperCase()
      .slice(0, 20)
  },
  // Equipment-related formatters
  notes: (value: string): string => {
    // Allow normal text input with basic punctuation
    const sanitized = value.replace(/[^a-z0-9\s.,!?()'\-"]/gi, '')
    return sanitized.trim().slice(0, 500)
  },
  // Address formatters
  streetAddress: (value: string): string => {
    const sanitized = value.replace(/[^a-z0-9\s\-.,#]/gi, '')
    return sanitized.trim().slice(0, 100)
  },
  city: (value: string): string => {
    const sanitized = value.replace(/[^a-z\s\-']/gi, '')
    return sanitized.trim().slice(0, 50)
  }
}

// Sanitization function
export const sanitizeInput = (value: string): string => {
  // First sanitize with DOMPurify
  const sanitized = DOMPurify.sanitize(value)
  // Preserve spaces between words, only trim leading/trailing spaces
  return sanitized.trim()
}

// Validation function
export const validateInput = (
  value: string,
  rules: ValidationRule[]
): string | null => {
  for (const rule of rules) {
    if (!rule.test(value)) {
      return rule.message
    }
  }
  return null
}
