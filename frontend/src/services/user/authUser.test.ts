import { describe, it, expect, vi, beforeEach } from 'vitest'
import authUser from './authUser'

// Mock the environment variable
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

describe('authUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully authenticate user with valid CSRF token', async () => {
    const mockResponse = {
      message: 'User authenticated',
      user: { id: 1, email: 'test@example.com' }
    }

    mockLocalStorage.getItem.mockReturnValue('valid-csrf-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await authUser()

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('csrfToken')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/validate',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': 'valid-csrf-token'
        }
      }
    )
    expect(result).toEqual(mockResponse)
  })

  it('should throw error when no CSRF token found', async () => {
    mockLocalStorage.getItem.mockReturnValue(null)

    await expect(authUser()).rejects.toThrow('No CSRF token found')
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should throw error when API response is not ok', async () => {
    const errorResponse = { error: 'Invalid token' }
    
    mockLocalStorage.getItem.mockReturnValue('invalid-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(authUser()).rejects.toThrow('Invalid token')
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockLocalStorage.getItem.mockReturnValue('invalid-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    await expect(authUser()).rejects.toThrow('Unknown error occurred')
  })

  it('should handle network errors', async () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token')
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(authUser()).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalledWith('Error during token validation:', expect.any(Error))
  })
})