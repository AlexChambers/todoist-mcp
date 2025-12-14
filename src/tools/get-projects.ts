import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'

const DEFAULT_PROJECT_FIELDS = ['id', 'name', 'parentId']

function filterProjectFields(
    project: Record<string, unknown>,
    fields: string[],
): Record<string, unknown> {
    const filtered: Record<string, unknown> = {}
    for (const field of fields) {
        if (field in project) {
            filtered[field] = project[field]
        }
    }
    return filtered
}

export function registerGetProjects(server: McpServer, api: TodoistApi) {
    server.tool('get-projects', 'Get all projects from Todoist', {}, async () => {
        const projects = await getMaxPaginatedResults((params) => api.getProjects(params))
        const filteredProjects = projects.map((project) =>
            filterProjectFields(project as Record<string, unknown>, DEFAULT_PROJECT_FIELDS),
        )
        return {
            content: filteredProjects.map((project) => ({
                type: 'text',
                text: JSON.stringify(project, null, 2),
            })),
        }
    })
}
