import siteConfig from '@/config'

type FrappeMethodParameter = string | number | boolean | null | undefined

type FrappeV2Response<T> = {
  data: T
}

type FrappeMethodOptions = {
  baseUrl?: string
}

export const callFrappeMethod = async <T>(
  method: string,
  parameters: Record<string, FrappeMethodParameter> = {},
  options: FrappeMethodOptions = {},
): Promise<T> => {
  const baseUrl = options.baseUrl || siteConfig.apiBaseUrl
  const url = new URL(
    `/api/v2/method/${method}`,
    `${baseUrl.replace(/\/+$/, '')}/`,
  )

  Object.entries(parameters).forEach(([name, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      url.searchParams.set(name, String(value))
    }
  })

  const response = await fetch(url.toString())
  if (!response.ok) {
    throw new Error(`Frappe request failed (${response.status})`)
  }

  const payload = (await response.json()) as Partial<FrappeV2Response<T>>
  if (!Object.prototype.hasOwnProperty.call(payload, 'data')) {
    throw new Error('Invalid Frappe API v2 response')
  }

  return payload.data as T
}
