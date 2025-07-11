import { describe, it, expect, vi, beforeEach } from 'vitest'
import autocompleteAddress from './searchItem'

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('autocompleteAddress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully search items with query', async () => {
    const mockResponse = {
      predictions: ['Chair', 'Table', 'Furniture']
    }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await autocompleteAddress('furniture')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/item_search',
      {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: 'furniture' })
      }
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle short search query', async () => {
    const result = await autocompleteAddress('ab')
    
    // Should return empty predictions for short input
    expect(result).toEqual({ predictions: [] })
    // Should not make API call
    expect(mockFetch).not.toHaveBeenCalled()
  })

  it('should handle special characters in search query', async () => {
    const mockResponse = { predictions: ['table', 'chairs'] }

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await autocompleteAddress('table & chairs')

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/api/item_search',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ input: 'table & chairs' })
      })
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle API call failure gracefully', async () => {
    const errorResponse = { error: 'Search service unavailable' }
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    const result = await autocompleteAddress('furniture')
    
    // Should return empty predictions on error
    expect(result).toEqual({ predictions: [] })
    expect(console.error).toHaveBeenCalled()
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    const result = await autocompleteAddress('furniture')
    expect(result).toEqual({ predictions: [] })
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    const result = await autocompleteAddress('furniture')
    
    expect(result).toEqual({ predictions: [] })
    expect(console.error).toHaveBeenCalledWith('Error fetching item search suggestions:', expect.any(Error))
  })

  it('should handle empty predictions response', async () => {
    const mockResponse = { predictions: [] }
    
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await autocompleteAddress('nonexistent')
    expect(result).toEqual({ predictions: [] })
  })

  it('should handle empty input string', async () => {
    const result = await autocompleteAddress('')
    
    expect(result).toEqual({ predictions: [] })
    expect(mockFetch).not.toHaveBeenCalled()
  })
})