import { describe, it, expect, vi, beforeEach } from 'vitest'
import logoutUser from './logoutUser'

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

describe('logoutUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully log out user with valid CSRF token', async () => {
    const mockResponse = {
      message: 'Logout successful'
    }

    mockLocalStorage.getItem.mockReturnValue('valid-csrf-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await logoutUser()

    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('csrfToken')
    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/auth/logout',
      {
        method: 'DELETE',
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

    await expect(logoutUser()).rejects.toThrow('No CSRF token found')
    expect(mockFetch).not.toHaveBeenCalled()
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
  })

  it('should throw error when logout API call fails', async () => {
    const errorResponse = { error: 'Invalid session' }
    
    mockLocalStorage.getItem.mockReturnValue('invalid-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(logoutUser()).rejects.toThrow('Invalid session')
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token')
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    await expect(logoutUser()).rejects.toThrow('Unknown error occurred')
  })

  it('should handle network errors', async () => {
    mockLocalStorage.getItem.mockReturnValue('valid-token')
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(logoutUser()).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalledWith('Error during token validation:', expect.any(Error))
    expect(mockLocalStorage.removeItem).not.toHaveBeenCalled()
  })

  it('should handle API call success with no explicit message', async () => {
    const mockResponse = {}

    mockLocalStorage.getItem.mockReturnValue('valid-csrf-token')
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await logoutUser()

    expect(result).toEqual(mockResponse)
  })
})