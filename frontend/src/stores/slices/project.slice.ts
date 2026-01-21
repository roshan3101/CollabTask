import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { projectService } from "@/services/project.service"
import type { Project, CreateProjectInput, UpdateProjectInput } from "@/types/project"

interface ProjectState {
    projects: Project[]
    archivedProjects: Project[]
    activeProjectId: string | null
    activeProject: Project | null
    isLoading: boolean
    error: string | null
}

const initialState: ProjectState = {
    projects: [],
    archivedProjects: [],
    activeProjectId: null,
    activeProject: null,
    isLoading: false,
    error: null,
}

export const fetchProjects = createAsyncThunk(
    "projects/list",
    async (orgId: string, { rejectWithValue }) => {
        try {
            const response = await projectService.listProjects(orgId)
            if (!response.success) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data || []
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load projects")
        }
    }
)

export const fetchArchivedProjects = createAsyncThunk(
    "projects/listArchived",
    async (orgId: string, { rejectWithValue }) => {
        try {
            const response = await projectService.listArchivedProjects(orgId)
            if (!response.success) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data || []
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load archived projects")
        }
    }
)

export const fetchProjectDetail = createAsyncThunk(
    "projects/detail",
    async ({ orgId, projectId }: { orgId: string; projectId: string }, { rejectWithValue }) => {
        try {
            const response = await projectService.getProject(orgId, projectId)
            if (!response.success || !response.data) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to load project")
        }
    }
)

export const createProject = createAsyncThunk(
    "projects/create",
    async ({ orgId, payload }: { orgId: string; payload: CreateProjectInput }, { rejectWithValue }) => {
        try {
            const response = await projectService.createProject(orgId, payload)
            if (!response.success || !response.data) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to create project")
        }
    }
)

export const updateProject = createAsyncThunk(
    "projects/update",
    async (
        { orgId, projectId, payload }: { orgId: string; projectId: string; payload: UpdateProjectInput },
        { rejectWithValue }
    ) => {
        try {
            const response = await projectService.updateProject(orgId, projectId, payload)
            if (!response.success || !response.data) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to update project")
        }
    }
)

export const deleteProject = createAsyncThunk(
    "projects/delete",
    async ({ orgId, projectId }: { orgId: string; projectId: string }, { rejectWithValue }) => {
        try {
            const response = await projectService.deleteProject(orgId, projectId)
            if (!response.success) {
                return rejectWithValue(response.error || response.message)
            }
            return projectId
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to delete project")
        }
    }
)

export const restoreProject = createAsyncThunk(
    "projects/restore",
    async ({ orgId, projectId }: { orgId: string; projectId: string }, { rejectWithValue }) => {
        try {
            const response = await projectService.restoreProject(orgId, projectId)
            if (!response.success || !response.data) {
                return rejectWithValue(response.error || response.message)
            }
            return response.data
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to restore project")
        }
    }
)

const projectSlice = createSlice({
    name: "projects",
    initialState,
    reducers: {
        setActiveProjectId: (state, action: PayloadAction<string | null>) => {
            state.activeProjectId = action.payload
        },
        clearActiveProject: (state) => {
            state.activeProjectId = null
            state.activeProject = null
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchProjects.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchProjects.fulfilled, (state, action) => {
                state.isLoading = false
                state.projects = action.payload
            })
            .addCase(fetchProjects.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(fetchArchivedProjects.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchArchivedProjects.fulfilled, (state, action) => {
                state.isLoading = false
                state.archivedProjects = action.payload
            })
            .addCase(fetchArchivedProjects.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(fetchProjectDetail.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchProjectDetail.fulfilled, (state, action) => {
                state.isLoading = false
                state.activeProject = action.payload
                state.activeProjectId = action.payload.id
            })
            .addCase(fetchProjectDetail.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(createProject.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(createProject.fulfilled, (state, action) => {
                state.isLoading = false
                state.projects.push(action.payload)
                state.activeProjectId = action.payload.id
                state.activeProject = action.payload
            })
            .addCase(createProject.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(updateProject.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(updateProject.fulfilled, (state, action) => {
                state.isLoading = false
                const index = state.projects.findIndex((p) => p.id === action.payload.id)
                if (index !== -1) {
                    state.projects[index] = action.payload
                }
                if (state.activeProjectId === action.payload.id) {
                    state.activeProject = action.payload
                }
            })
            .addCase(updateProject.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(deleteProject.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(deleteProject.fulfilled, (state, action) => {
                state.isLoading = false
                state.projects = state.projects.filter((p) => p.id !== action.payload)
                if (state.activeProjectId === action.payload) {
                    state.activeProjectId = null
                    state.activeProject = null
                }
            })
            .addCase(deleteProject.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })

            .addCase(restoreProject.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(restoreProject.fulfilled, (state, action) => {
                state.isLoading = false
                state.archivedProjects = state.archivedProjects.filter((p) => p.id !== action.payload.id)
                state.projects.push(action.payload)
            })
            .addCase(restoreProject.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    },
})

export const { setActiveProjectId, clearActiveProject } = projectSlice.actions
export default projectSlice.reducer

