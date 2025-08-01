import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { validateProject } from '../utils/verification.js'

export function registerGetProjectComments(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-project-comments',
        'Get comments from a project in Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project matches expectations
            await validateProject(projectId, projectName, api)

            const comments = await getMaxPaginatedResults((params) =>
                api.getComments({ projectId, ...params }),
            )
            return {
                content: comments.map((comment) => ({
                    type: 'text',
                    text: JSON.stringify(comment, null, 2),
                })),
            }
        },
    )
}
