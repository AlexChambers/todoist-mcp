import type { TodoistApi } from '@doist/todoist-api-typescript'

const API_VERSION = '9.215'

// Since some endpoints are not directly exposed in the TypeScript client,
// We need to make a direct fetch request using the authentication token
// Access the private properties with a type assertion to a more specific interface
type TodoistApiInternal = { restApiBase: string; authToken: string }

export async function callRestTodoistApi(
    urlPath: string,
    api: TodoistApi,
    options: RequestInit = {},
) {
    // Access the private properties with a type assertion
    const baseUrl = (api as unknown as TodoistApiInternal).restApiBase || 'https://api.todoist.com'
    const authToken = (api as unknown as TodoistApiInternal).authToken

    // Setup timeout (default 30 seconds, configurable via options)
    const timeoutMs = 30000
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
        options.headers = { ...options.headers, Authorization: `Bearer ${authToken}` }
        options.signal = options.signal || controller.signal

        // Make API request
        const url = new URL(`/api/v${API_VERSION}/${urlPath.replace(/^\/+/, '')}`, baseUrl)
        const res = await fetch(url, options)

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
