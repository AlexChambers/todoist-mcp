import type {
    Comment,
    Label,
    PersonalProject,
    Section,
    Task,
    TodoistApi,
    WorkspaceProject,
} from '@doist/todoist-api-typescript'

type Project = PersonalProject | WorkspaceProject

export interface TaskValidationResult {
    task: Task
    project: Project
}

export interface ProjectValidationResult {
    project: Project
}

export interface SectionValidationResult {
    section: Section
    project: Project
}

export interface CommentValidationResult {
    comment: Comment
    task?: Task
    project: Project
}

export interface LabelValidationResult {
    label: Label
}

/**
 * Validates that a task matches the expected name and project before performing operations
 */
export async function validateTask(
    taskId: string,
    expectedTaskName: string,
    expectedProjectName: string,
    api: TodoistApi,
): Promise<TaskValidationResult> {
    const task = await api.getTask(taskId)
    const project = await api.getProject(task.projectId)

    if (expectedTaskName !== task.content) {
        throw new Error(
            `Task name mismatch. Expected: "${expectedTaskName}", Actual: "${task.content}"`,
        )
    }

    if (expectedProjectName !== project.name) {
        throw new Error(
            `Project name mismatch. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
        )
    }

    return { task, project }
}

/**
 * Validates that a project matches the expected name before performing operations
 */
export async function validateProject(
    projectId: string,
    expectedProjectName: string,
    api: TodoistApi,
): Promise<ProjectValidationResult> {
    const project = await api.getProject(projectId)

    if (expectedProjectName !== project.name) {
        throw new Error(
            `Project name mismatch. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
        )
    }

    return { project }
}

/**
 * Validates that a section matches the expected name and project before performing operations
 */
export async function validateSection(
    sectionId: string,
    expectedSectionName: string,
    expectedProjectName: string,
    api: TodoistApi,
): Promise<SectionValidationResult> {
    const section = await api.getSection(sectionId)
    const project = await api.getProject(section.projectId)

    if (expectedSectionName !== section.name) {
        throw new Error(
            `Section name mismatch. Expected: "${expectedSectionName}", Actual: "${section.name}"`,
        )
    }

    if (expectedProjectName !== project.name) {
        throw new Error(
            `Project name mismatch. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
        )
    }

    return { section, project }
}

/**
 * Validates that a comment matches the expected content and context before performing operations
 */
export async function validateComment(
    commentId: string,
    expectedCommentContent: string,
    api: TodoistApi,
    expectedTaskName?: string,
    expectedProjectName?: string,
): Promise<CommentValidationResult> {
    const comment = await api.getComment(commentId)

    // Validate comment content (first 50 characters)
    const commentPreview = comment.content.substring(0, 50)
    if (expectedCommentContent !== commentPreview) {
        throw new Error(
            `Comment content mismatch. Expected: "${expectedCommentContent}", Actual: "${commentPreview}"`,
        )
    }

    // Comments can be on tasks or projects
    if (comment.taskId && expectedTaskName && expectedProjectName) {
        // Comment is on a task
        const task = await api.getTask(comment.taskId)
        const project = await api.getProject(task.projectId)

        if (expectedTaskName !== task.content) {
            throw new Error(
                `Task name mismatch for comment. Expected: "${expectedTaskName}", Actual: "${task.content}"`,
            )
        }

        if (expectedProjectName !== project.name) {
            throw new Error(
                `Project name mismatch for comment. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
            )
        }

        return { comment, task, project }
    } else if (comment.projectId && expectedProjectName) {
        // Comment is on a project
        const project = await api.getProject(comment.projectId)

        if (expectedProjectName !== project.name) {
            throw new Error(
                `Project name mismatch for comment. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
            )
        }

        return { comment, project }
    } else {
        throw new Error(
            'Invalid comment validation parameters: must provide either (taskName + projectName) or just projectName',
        )
    }
}

/**
 * Validates that a label matches the expected name before performing operations
 */
export async function validateLabel(
    labelId: string,
    expectedLabelName: string,
    api: TodoistApi,
): Promise<LabelValidationResult> {
    const label = await api.getLabel(labelId)

    if (expectedLabelName !== label.name) {
        throw new Error(
            `Label name mismatch. Expected: "${expectedLabelName}", Actual: "${label.name}"`,
        )
    }

    return { label }
}

/**
 * Validates that a parent task matches the expected name and project before performing operations
 */
export async function validateParentTask(
    parentTaskId: string,
    expectedParentTaskName: string,
    expectedProjectName: string,
    api: TodoistApi,
): Promise<TaskValidationResult> {
    const parentTask = await api.getTask(parentTaskId)
    const project = await api.getProject(parentTask.projectId)

    if (expectedParentTaskName !== parentTask.content) {
        throw new Error(
            `Parent task name mismatch. Expected: "${expectedParentTaskName}", Actual: "${parentTask.content}"`,
        )
    }

    if (expectedProjectName !== project.name) {
        throw new Error(
            `Project name mismatch for parent task. Expected: "${expectedProjectName}", Actual: "${project.name}"`,
        )
    }

    return { task: parentTask, project }
}

/**
 * Validates that a parent project matches the expected name before performing operations
 */
export async function validateParentProject(
    parentProjectId: string,
    expectedParentProjectName: string,
    api: TodoistApi,
): Promise<ProjectValidationResult> {
    const parentProject = await api.getProject(parentProjectId)

    if (expectedParentProjectName !== parentProject.name) {
        throw new Error(
            `Parent project name mismatch. Expected: "${expectedParentProjectName}", Actual: "${parentProject.name}"`,
        )
    }

    return { project: parentProject }
}
