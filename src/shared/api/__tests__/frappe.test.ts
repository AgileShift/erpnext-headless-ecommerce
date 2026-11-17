import { beforeEach, describe, expect, it, vi } from 'vitest'
import { callFrappeMethod } from '@/shared/api/frappe'

beforeEach(() => {
  vi.restoreAllMocks()
})

describe('Frappe API v2 client', () => {
  it('calls the v2 method route, encodes parameters and returns data', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ data: [{ name: 'Red & Blue' }] }),
    } as Response)

    const result = await callFrappeMethod<{ name: string }[]>(
      'example.api.get_values',
      { attribute: 'Red & Blue', empty: '' },
      { baseUrl: 'https://erp.example.com/' },
    )

    expect(result).toEqual([{ name: 'Red & Blue' }])
    expect(fetchMock).toHaveBeenCalledWith(
      'https://erp.example.com/api/v2/method/example.api.get_values?attribute=Red+%26+Blue',
    )
  })

  it('rejects HTTP errors and responses without the v2 data property', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce({ ok: false, status: 503 } as Response)
      .mockResolvedValueOnce({ ok: true, status: 200, json: async () => ({ message: [] }) } as Response)

    await expect(
      callFrappeMethod('example.api.get_values', {}, { baseUrl: 'https://erp.example.com' }),
    ).rejects.toThrow('Frappe request failed (503)')
    await expect(
      callFrappeMethod('example.api.get_values', {}, { baseUrl: 'https://erp.example.com' }),
    ).rejects.toThrow('Invalid Frappe API v2 response')
  })
})
