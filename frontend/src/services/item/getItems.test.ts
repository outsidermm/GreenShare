import { describe, it, expect, vi, beforeEach } from 'vitest'
import getItems from './getItems'

// Mock environment variable
process.env.NEXT_PUBLIC_API_URL = 'http://localhost:8000'

const mockFetch = vi.fn()
global.fetch = mockFetch

describe('getItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
    console.log = vi.fn()
  })

  it('should successfully fetch items with no filters', async () => {
    const mockResponse = [
      { id: 1, title: 'Chair', description: 'Nice chair', category: 'furniture' },
      { id: 2, title: 'Table', description: 'Wooden table', category: 'furniture' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({})

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?',
      {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    expect(result).toEqual(mockResponse)
  })

  it('should fetch items with category filter', async () => {
    const mockResponse = [
      { id: 1, title: 'Chair', category: 'furniture' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({ category: 'furniture' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?category=furniture',
      expect.any(Object)
    )
    expect(result).toEqual(mockResponse)
  })

  it('should fetch items with multiple filters', async () => {
    const mockResponse = [
      { id: 1, title: 'New Chair', condition: 'new', category: 'furniture' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({ condition: 'new', category: 'furniture', type: 'gift' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?category=furniture&condition=new&type=gift',
      expect.any(Object)
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle only condition filter', async () => {
    const mockResponse = []

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({ condition: 'used' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?condition=used',
      expect.any(Object)
    )
    expect(result).toEqual(mockResponse)
  })

  it('should handle title filter', async () => {
    const mockResponse = []

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({ title: 'chair' })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?title=chair',
      expect.any(Object)
    )
    expect(result).toEqual(mockResponse)
  })

  it('should throw error when API call fails', async () => {
    const errorResponse = { error: 'Items service unavailable' }
    
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve(errorResponse)
    })

    await expect(getItems({})).rejects.toThrow('Items service unavailable')
  })

  it('should handle unknown error when API response is not ok and no error message', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({})
    })

    await expect(getItems({})).rejects.toThrow('Unknown error occurred')
  })

  it('should handle network errors', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'))

    await expect(getItems({})).rejects.toThrow('Network error')
    expect(console.error).toHaveBeenCalledWith('Error fetching item:', expect.any(Error))
  })

  it('should handle item_id filter', async () => {
    const mockResponse = [
      { id: 123, title: 'Specific Item' }
    ]

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    })

    const result = await getItems({ item_id: 123 })

    expect(mockFetch).toHaveBeenCalledWith(
      'http://localhost:8000/item?id=123',
      expect.any(Object)
    )
    expect(result).toEqual(mockResponse)
  })
})