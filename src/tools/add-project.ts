import type { TodoistApi } from '@doist/todoist-api-typescript'
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js'
import { z } from 'zod'
import { validateParentProject } from '../utils/verification.js'

export function registerAddProject(server: McpServer, api: TodoistApi) {
    server.tool(
        'add-project',
        'Add a project to Todoist',
        {
            name: z.string(),
            color: z
                .enum([
                    'berry_red',
                    'light_blue',
                    'red',
                    'blue',
                    'orange',
                    'grape',
                    'yellow',
                    'violet',
                    'olive_green',
                    'lavender',
                    'lime_green',
                    'magenta',
                    'green',
                    'salmon',
                    'mint_green',
                    'charcoal',
                    'teal',
                    'grey',
                    'sky_blue',
                ])
                .optional(),
            isFavorite: z.boolean().optional(),
            viewStyle: z.enum(['list', 'board', 'calendar']).optional(),
            parentId: z.string().optional().describe('The ID of a parent project'),
            parentProjectName: z
                .string()
                .optional()
                .describe('Parent project name for verification'),
        },
        async ({ name, color, isFavorite, viewStyle, parentId, parentProjectName }) => {
            // Validate parent project if parentId and parentProjectName are provided
            if (parentId && parentProjectName) {
                await validateParentProject(parentId, parentProjectName, api)
            }

            const project = await api.addProject({ name, color, isFavorite, viewStyle, parentId })
            return {
                content: [{ type: 'text', text: JSON.stringify(project, null, 2) }],
            }
        },
    )
}
