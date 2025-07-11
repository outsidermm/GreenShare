import { describe, it, expect } from 'vitest'
import { extractErrorMessage } from './extractErrorMsg'

describe('extractErrorMessage', () => {
  it('should extract message after first colon', () => {
    expect(extractErrorMessage('Error: Something went wrong')).toBe('Something went wrong')
  })

  it('should handle multiple colons correctly', () => {
    expect(extractErrorMessage('Error: Database: Connection failed')).toBe('Database: Connection failed')
  })

  it('should return original message if no colon', () => {
    expect(extractErrorMessage('Something went wrong')).toBe('Something went wrong')
  })

  it('should trim whitespace', () => {
    expect(extractErrorMessage('Error:   Something went wrong   ')).toBe('Something went wrong')
  })

  it('should handle empty string', () => {
    expect(extractErrorMessage('')).toBe('')
  })

  it('should handle string with only colon', () => {
    expect(extractErrorMessage(':')).toBe('')
  })

  it('should handle colon at the end', () => {
    expect(extractErrorMessage('Error:')).toBe('')
  })

  it('should handle multiple consecutive colons', () => {
    expect(extractErrorMessage('Error:: Something went wrong')).toBe(': Something went wrong')
  })
})