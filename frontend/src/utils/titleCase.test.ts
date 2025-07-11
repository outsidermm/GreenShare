import { describe, it, expect } from 'vitest'
import { toTitleCase } from './titleCase'

describe('toTitleCase', () => {
  it('should convert lowercase string to title case', () => {
    expect(toTitleCase('hello world')).toBe('Hello World')
  })

  it('should convert uppercase string to title case', () => {
    expect(toTitleCase('HELLO WORLD')).toBe('Hello World')
  })

  it('should handle mixed case string', () => {
    expect(toTitleCase('hELLo WoRLD')).toBe('Hello World')
  })

  it('should handle single word', () => {
    expect(toTitleCase('hello')).toBe('Hello')
  })

  it('should handle empty string', () => {
    expect(toTitleCase('')).toBe('')
  })

  it('should handle string with extra spaces', () => {
    expect(toTitleCase('  hello   world  ')).toBe(' Hello World ')
  })

  it('should handle numbers and special characters', () => {
    expect(toTitleCase('hello-world 123')).toBe('Hello World 123')
  })
})