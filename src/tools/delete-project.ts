import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject } from '../utils/verification.js'

export function registerDeleteProject(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-project',
        'Delete a project in Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project matches expectations
            const { project } = await validateProject(projectId, projectName, api)

            const success = await api.deleteProject(projectId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Project "${project.name}" deleted`
                            : `Failed to delete project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
