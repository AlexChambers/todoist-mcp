import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateSection } from '../utils/verification.js'

export function registerDeleteSection(server: McpServer, api: TodoistApi) {
    server.tool(
        'delete-section',
        'Delete a section from a project in Todoist',
        {
            sectionId: z.string(),
            sectionName: z.string().describe('Section name for verification'),
            projectName: z.string().describe('Project name for verification'),
        },
        async ({ sectionId, sectionName, projectName }) => {
            // Validate section and project match expectations
            const { section, project } = await validateSection(
                sectionId,
                sectionName,
                projectName,
                api,
            )

            const success = await api.deleteSection(sectionId)
            return {
                content: [
                    {
                        type: 'text',
                        text: success
                            ? `Section "${section.name}" deleted from project "${project.name}"`
                            : `Failed to delete section "${section.name}" from project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
