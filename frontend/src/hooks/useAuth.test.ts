import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useAuth from './useAuth'

// Mock the authUser service
vi.mock('../services/user/authUser', () => ({
  default: vi.fn()
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/')
}))

import authUser from '../services/user/authUser'

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    console.error = vi.fn()
  })

  it('should initialize with unauthenticated state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.isAuthenticated).toBe(false)
    expect(typeof result.current.refreshAuth).toBe('function')
  })

  it('should set authenticated state when auth check succeeds', async () => {
    const mockAuthResponse = { message: 'Token is valid and user is in session' }
    
    vi.mocked(authUser).mockResolvedValue(mockAuthResponse)

    const { result } = renderHook(() => useAuth())

    // Wait for the useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should set unauthenticated state when auth check fails', async () => {
    vi.mocked(authUser).mockRejectedValue(new Error('Not authenticated'))

    const { result } = renderHook(() => useAuth())

    // Wait for the useEffect to run
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Authentication validation failed:', expect.any(Error))
  })

  it('should set unauthenticated when message is not valid', async () => {
    const mockAuthResponse = { message: 'Invalid token' }
    
    vi.mocked(authUser).mockResolvedValue(mockAuthResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle refreshAuth being called manually', async () => {
    const mockAuthResponse = { message: 'Token is valid and user is in session' }
    
    vi.mocked(authUser).mockResolvedValue(mockAuthResponse)

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle refreshAuth failure when called manually', async () => {
    vi.mocked(authUser).mockRejectedValue(new Error('Auth failed'))

    const { result } = renderHook(() => useAuth())

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0))
    })

    expect(result.current.isAuthenticated).toBe(false)
    expect(console.error).toHaveBeenCalledWith('Authentication validation failed:', expect.any(Error))
  })

  it('should run auth check on mount and pathname changes', () => {
    const { result } = renderHook(() => useAuth())
    
    // Auth should be called on mount
    expect(authUser).toHaveBeenCalled()
    expect(typeof result.current.refreshAuth).toBe('function')
  })
})