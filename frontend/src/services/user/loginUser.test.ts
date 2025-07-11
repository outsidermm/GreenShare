import { describe, it, expect, vi, beforeEach } from 'vitest'
import loginUser from './loginUser'

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

const mockFetch = vi.fn()
global.fetch = mockFetch

const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
vi.stubGlobal('localStorage', mockLocalStorage)

describe('loginUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully log in user with valid credentials', async () => {
    const mockResponse = {
      csrf_token: 'new-csrf-token'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await loginUser('test@example.com', 'password123')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/login',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'password123'
        })
      }
    )
    expect(result).toBe('new-csrf-token')
  })

  it('should throw error when credentials are invalid', async () => {
    const errorResponse = { error: 'Invalid credentials' }
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(loginUser('test@example.com', 'wrongpassword')).rejects.toThrow('Invalid credentials')
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    await expect(loginUser('test@example.com', 'password')).rejects.toThrow('Unknown error occurred')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(loginUser('test@example.com', 'password')).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalledWith('Error during login:', expect.any(Error))
  })

  it('should return csrf token from response', async () => {
    const mockResponse = {
      csrf_token: 'test-csrf-token-123'
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await loginUser('user@example.com', 'mypassword')
    
    expect(result).toBe('test-csrf-token-123')
  })
})