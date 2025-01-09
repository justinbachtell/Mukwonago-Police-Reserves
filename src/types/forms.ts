/**
 * Type definitions for form handling and validation
 * These types are used across the application to manage form state,
 * validation, and API responses in a consistent manner
 */

// Generic type for API responses with optional data payload
export interface SaveResult<T = any> {
  success: boolean
  message?: string
  data?: T
}

// Represents a single form field validation error
export interface FormError {
  field: string
  message: string
}

// Represents the current state of a form
export interface FormState {
  isSubmitting: boolean
  isSuccess: boolean
  errors?: FormError[]
}

// Result of form validation operations
export interface ValidationResult {
  isValid: boolean
  errors: FormError[]
}

// Generic type for individual form field state
export interface FormField<T = string> {
  value: T
  error?: string
  touched?: boolean
  required?: boolean
}
