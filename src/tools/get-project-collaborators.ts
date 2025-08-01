import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { validateProject } from '../utils/verification.js'

export function registerGetProjectCollaborators(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-project-collaborators',
        'Get all collaborators from a project in Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project matches expectations
            await validateProject(projectId, projectName, api)

            const collaborators = await getMaxPaginatedResults((params) =>
                api.getProjectCollaborators(projectId, params),
            )
            return {
                content: collaborators.map((collaborator) => ({
                    type: 'text',
                    text: JSON.stringify(collaborator, null, 2),
                })),
            }
        },
    )
}
