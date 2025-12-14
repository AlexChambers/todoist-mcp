import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { getMaxPaginatedResults } from '../utils/get-max-paginated-results.js'
import { validateProject } from '../utils/verification.js'

const DEFAULT_SECTION_FIELDS = ['id', 'projectId', 'name']

function filterSectionFields(
    section: Record<string, unknown>,
    fields: string[],
): Record<string, unknown> {
    const filtered: Record<string, unknown> = {}
    for (const field of fields) {
        if (field in section) {
            filtered[field] = section[field]
        }
    }
    return filtered
}

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

            const sections = await getMaxPaginatedResults((params) =>
                api.getSections({ projectId, ...params }),
            )
            const filteredSections = sections.map((section) =>
                filterSectionFields(section as Record<string, unknown>, DEFAULT_SECTION_FIELDS),
            )
            return {
                content: filteredSections.map((section) => ({
                    type: 'text',
                    text: JSON.stringify(section, null, 2),
                })),
            }
        },
    )
}
