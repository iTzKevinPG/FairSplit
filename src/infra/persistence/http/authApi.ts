import { API_BASE_URL } from "../../config/api"

type RequestCodePayload = {
  email: string
}

type RequestCodeResponse = {
  message: string
}

type VerifyCodePayload = {
  email: string
  code: string
}

type VerifyCodeResponse = {
  token: string
  user: {
    id: string
    email: string
  }
}

export async function requestLoginCodeApi(
  payload: RequestCodePayload,
): Promise<RequestCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/request-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMessage =
      data?.fieldErrors?.email ||
      data?.message ||
      'No se pudo enviar el código, intenta de nuevo.'
    throw new Error(errorMessage)
  }

  return data as RequestCodeResponse
}

export async function verifyLoginCodeApi(
  payload: VerifyCodePayload,
): Promise<VerifyCodeResponse> {
  const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const errorMessage =
      data?.message || 'Código inválido o expirado. Intenta de nuevo.'
    throw new Error(errorMessage)
  }

  return data as VerifyCodeResponse
}
