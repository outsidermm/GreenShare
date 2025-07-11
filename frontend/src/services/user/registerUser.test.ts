import { describe, it, expect, vi, beforeEach } from 'vitest'
import registerUser from './registerUser'

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('registerUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully register user with valid data', async () => {
    const mockResponse = {
      csrf_token: 'new-user-csrf-token'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await registerUser({
      email: 'newuser@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/register',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'newuser@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        })
      }
    )
    expect(result).toBe('new-user-csrf-token')
  })

  it('should handle registration API failure', async () => {
    const errorResponse = { error: 'Email already exists' }
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(registerUser({
      email: 'existing@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })).rejects.toThrow('Email already exists')
  })

  it('should handle validation failure', async () => {
    const errorResponse = { error: 'Invalid email format' }
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(registerUser({
      email: 'invalid-email',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })).rejects.toThrow('Invalid email format')
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    await expect(registerUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })).rejects.toThrow('Unknown error occurred')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(registerUser({
      email: 'test@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe'
    })).rejects.toThrow('Network error')
    
    expect(console.error).toHaveBeenCalledWith('Error during registration:', expect.any(Error))
  })
})