/**
 * Priority mapping utilities for Todoist priority values
 *
 * Todoist API uses numeric priorities:
 * - 1 = Urgent (highest priority, red flag)
 * - 2 = High (orange flag)
 * - 3 = Medium (blue flag)
 * - 4 = Low (no flag, normal/default)
 */

export type PriorityText = 'Urgent' | 'High' | 'Medium' | 'Low'
export type PriorityNumber = 1 | 2 | 3 | 4

const PRIORITY_MAP: Record<PriorityNumber, PriorityText> = {
    1: 'Urgent',
    2: 'High',
    3: 'Medium',
    4: 'Low',
}

const REVERSE_PRIORITY_MAP: Record<PriorityText, PriorityNumber> = {
    Urgent: 1,
    High: 2,
    Medium: 3,
    Low: 4,
}

/**
 * Convert numeric priority to text equivalent
 */
export function priorityToText(priority: number | undefined): PriorityText | undefined {
    if (!priority || priority < 1 || priority > 4) {
        return undefined
    }
    return PRIORITY_MAP[priority as PriorityNumber]
}

/**
 * Convert text priority to numeric equivalent
 */
export function textToPriority(text: string): PriorityNumber | undefined {
    const normalizedText = text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
    return REVERSE_PRIORITY_MAP[normalizedText as PriorityText]
}

/**
 * Transform a task object to replace numeric priority with text
 */
export function transformTaskPriority<T extends { priority?: number }>(task: T): T {
    if (!task || typeof task !== 'object') {
        return task
    }

    const priorityText = priorityToText(task.priority)

    // Create new object with priority as text
    const transformed = { ...task }
    if (priorityText !== undefined) {
        ;(transformed as any).priority = priorityText
    }

    return transformed
}

/**
 * Transform an array of tasks to replace numeric priorities with text
 */
export function transformTasksPriorities<T extends { priority?: number }>(tasks: T[]): T[] {
    return tasks.map(transformTaskPriority)
}

/**
 * Get the correct priority description for tool schemas
 */
export function getPriorityDescription(): string {
    return 'Task priority from 1 (urgent) to 4 (low)'
}
