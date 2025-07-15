import type { TodoistApi } from '@doist/todoist-api-typescript'

// Make API version configurable via environment variable with fallback
const API_VERSION = process.env.TODOIST_API_VERSION ?? '9.215'

// Since some endpoints are not directly exposed in the TypeScript client,
// We need to make a direct fetch request using the authentication token

export async function callRestTodoistApi(
    urlPath: string,
    api: TodoistApi,
    options: RequestInit = {},
) {
    // Access API properties with fallbacks for robustness
    const apiInternal = api as any
    const baseUrl = apiInternal.restApiBase ?? 'https://api.todoist.com'
    const authToken = apiInternal.authToken

    // Validate that we have required properties
    if (!authToken) {
        throw new Error(
            'Cannot access Todoist API token - ensure TodoistApi is properly initialized',
        )
    }

    // Setup timeout (default 30 seconds, configurable via options)
    const timeoutMs = 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        // Create new options object to avoid mutating the passed-in one
        const requestOptions: RequestInit = {
            ...options,
            headers: { ...options.headers, Authorization: `Bearer ${authToken}` },
            signal: options.signal || controller.signal,
        }

        // Make API request
        const url = new URL(`/api/v${API_VERSION}/${urlPath.replace(/^\/+/, '')}`, baseUrl)
        const res = await fetch(url, requestOptions)

        clearTimeout(timeoutId)

        if (!res.ok) {
            const errorText = await res.text()
            throw new Error(`Todoist API error: ${res.status} ${res.statusText}`)
        }

        return res
    } catch (error) {
        clearTimeout(timeoutId)

        if (error instanceof Error && error.name === 'AbortError') {
            throw new Error(`Todoist API request timeout after ${timeoutMs}ms`)
        }

        throw error
    }
}
