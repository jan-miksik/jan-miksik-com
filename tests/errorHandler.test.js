import { describe, it, expect, vi } from 'vitest'
import { normalizeError, logError } from '../src/lib/errorHandler'

describe('normalizeError', () => {
  it('returns the same Error instance if input is already an Error', () => {
    const original = new Error('test')
    const result = normalizeError(original)
    expect(result).toBe(original)
  })

  it('converts a string to an Error with the same message', () => {
    const result = normalizeError('oops')
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('oops')
  })

  it('converts non-string values to Error using String()', () => {
    const result = normalizeError(123)
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toBe('123')
  })
})

describe('logError', () => {
  it('logs the error with context and additional info', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    
    const result = logError('TestContext', 'failure', 'Additional info')
    
    expect(consoleSpy).toHaveBeenCalledOnce()
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toContain('failure')
    expect(result.message).toContain('TestContext')
    expect(result.message).toContain('Additional info')
    
    consoleSpy.mockRestore()
  })

  it('returns a normalized Error object', () => {
    const result = logError('TestContext', 'failure', 'Additional info')
    expect(result).toBeInstanceOf(Error)
    expect(result.message).toContain('failure')
  })
})


