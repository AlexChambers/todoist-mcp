import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateProject } from '../utils/verification.js'

export function registerGetSections(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-sections',
        'Get all sections from a project in Todoist',
        {
            projectId: z.string(),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ projectId, projectName }) => {
            // Validate project before getting sections
            await validateProject(projectId, projectName, api)

            let response = await api.getSections({ projectId })
            const sections = response.results
            while (response.nextCursor) {
                response = await api.getSections({ projectId, cursor: response.nextCursor })
                sections.push(...response.results)
            }
            return {
                content: sections.map((section) => ({
                    type: 'text',
                    text: JSON.stringify(section, null, 2),
                })),
            }
        },
    )
}
