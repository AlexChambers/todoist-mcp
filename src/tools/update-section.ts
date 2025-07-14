import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateSection } from '../utils/verification.js'

export function registerUpdateSection(server: McpServer, api: TodoistApi) {
    server.tool(
        'update-section',
        'Update a section in Todoist',
        {
            sectionId: z.string(),
            currentSectionName: z.string().describe('Current section name for verification'),
            projectName: z.string().describe('Project name for verification'),
            newName: z.string().describe('New name for the section'),
        },
        async ({ sectionId, currentSectionName, projectName, newName }) => {
            // Validate section and project match expectations
            const { section, project } = await validateSection(
                sectionId,
                currentSectionName,
                projectName,
                api,
            )

            const updatedSection = await api.updateSection(sectionId, { name: newName })
            return {
                content: [
                    {
                        type: 'text',
                        text: `Section "${section.name}" renamed to "${newName}" in project "${project.name}"`,
                    },
                ],
            }
        },
    )
}
