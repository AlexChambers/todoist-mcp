import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateSection } from '../utils/verification.js'

export function registerGetSection(server: McpServer, api: TodoistApi) {
    server.tool(
        'get-section',
        'Get section details in Todoist',
        {
            sectionId: z.string(),
            sectionName: z.string().describe('Section name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ sectionId, sectionName, projectName }) => {
            // Validate section and project match expectations
            await validateSection(sectionId, sectionName, projectName, api)

            const section = await api.getSection(sectionId)
            return {
                content: [{ type: 'text', text: JSON.stringify(section, null, 2) }],
            }
        },
    )
}
