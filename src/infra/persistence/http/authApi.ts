import { API_BASE_URL } from "../../config/api"
import { withLoading } from "./withLoading"

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
  return withLoading(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/request-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        normalizeAuthError(data, 'No se pudo enviar el código, intenta de nuevo.'),
      )
    }

    return data as RequestCodeResponse
  })
}

export async function verifyLoginCodeApi(
  payload: VerifyCodePayload,
): Promise<VerifyCodeResponse> {
  return withLoading(async () => {
    const response = await fetch(`${API_BASE_URL}/auth/verify-code`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(
        normalizeAuthError(data, 'Código inválido o expirado. Intenta de nuevo.'),
      )
    }

    return data as VerifyCodeResponse
  })
}

function normalizeAuthError(data: unknown, fallback: string): string {
  const payload = (data ?? {}) as Record<string, unknown>
  const fieldErrors = (payload.fieldErrors ?? {}) as Record<string, string | undefined>
  const rawMessage = typeof payload.message === 'string' ? payload.message : undefined
  const emailError = fieldErrors.email

  const knownEmailErrors = ['email must be an email', 'Email is required', 'email must be an Email']
  if (emailError || (rawMessage && knownEmailErrors.some((m) => rawMessage.includes(m)))) {
    return 'Ingresa un correo válido.'
  }

  if (rawMessage) return rawMessage
  return fallback
}
