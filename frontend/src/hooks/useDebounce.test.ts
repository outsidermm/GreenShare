import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useDebounce from './useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500))
    
    expect(result.current).toBe('initial')
  })

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    expect(result.current).toBe('initial')

    // Change the value
    rerender({ value: 'updated', delay: 500 })

    // Value should still be the old one
    expect(result.current).toBe('initial')

    // Fast-forward time by less than delay
    act(() => {
      vi.advanceTimersByTime(300)
    })

    // Value should still be the old one
    expect(result.current).toBe('initial')

    // Fast-forward time to complete the delay
    act(() => {
      vi.advanceTimersByTime(200)
    })

    // Now the value should be updated
    expect(result.current).toBe('updated')
  })

  it('should reset debounce timer on rapid value changes', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Change value multiple times rapidly
    rerender({ value: 'change1', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    rerender({ value: 'change2', delay: 500 })
    
    act(() => {
      vi.advanceTimersByTime(300)
    })
    
    rerender({ value: 'final', delay: 500 })

    // Value should still be initial
    expect(result.current).toBe('initial')

    // Complete the delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should have the final value
    expect(result.current).toBe('final')
  })

  it('should handle different delay values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 1000 } }
    )

    rerender({ value: 'updated', delay: 1000 })

    // Advance by less than 1000ms
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('initial')

    // Complete the full delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle zero delay', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 0 } }
    )

    rerender({ value: 'updated', delay: 0 })

    // With zero delay, should update immediately after next tick
    act(() => {
      vi.advanceTimersByTime(0)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle changing delay value', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 'initial', delay: 500 } }
    )

    // Change value and delay
    rerender({ value: 'updated', delay: 1000 })

    // Advance by original delay time
    act(() => {
      vi.advanceTimersByTime(500)
    })

    // Should still be initial because delay changed to 1000ms
    expect(result.current).toBe('initial')

    // Advance by additional time to complete new delay
    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe('updated')
  })

  it('should handle non-string values', () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: 42, delay: 500 } }
    )

    expect(result.current).toBe(42)

    rerender({ value: 100, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(100)
  })

  it('should handle object values', () => {
    const initialObj = { name: 'initial' }
    const updatedObj = { name: 'updated' }

    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      { initialProps: { value: initialObj, delay: 500 } }
    )

    expect(result.current).toBe(initialObj)

    rerender({ value: updatedObj, delay: 500 })

    act(() => {
      vi.advanceTimersByTime(500)
    })

    expect(result.current).toBe(updatedObj)
  })

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = vi.spyOn(global, 'clearTimeout')

    const { unmount } = renderHook(() => useDebounce('test', 500))

    unmount()

    expect(clearTimeoutSpy).toHaveBeenCalled()
  })
})