import { createSlice, createAsyncThunk, type PayloadAction } from "@reduxjs/toolkit"
import { taskService } from "@/services/task.service"
import type { Task, CreateTaskInput, UpdateTaskInput, PaginatedTasksResponse } from "@/types/task"

interface TaskState {
  tasks: Task[]
  activeTask: Task | null
  pagination: {
    total: number
    page: number
    page_size: number
    total_pages: number
  } | null
  isLoading: boolean
  error: string | null
}

const initialState: TaskState = {
  tasks: [],
  activeTask: null,
  pagination: null,
  isLoading: false,
  error: null,
}

export const fetchTasks = createAsyncThunk(
  "tasks/list",
  async (
    {
      orgId,
      projectId,
      params,
    }: {
      orgId: string
      projectId: string
      params?: {
        page?: number
        page_size?: number
        status?: string
        assignee_id?: string
        sort_by?: string
        sort_order?: string
      }
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.listTasks(orgId, projectId, params)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load tasks")
    }
  }
)

export const fetchTaskDetail = createAsyncThunk(
  "tasks/detail",
  async (
    { orgId, projectId, taskId }: { orgId: string; projectId: string; taskId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.getTask(orgId, projectId, taskId)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load task")
    }
  }
)

export const createTask = createAsyncThunk(
  "tasks/create",
  async (
    {
      orgId,
      projectId,
      payload,
    }: { orgId: string; projectId: string; payload: CreateTaskInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.createTask(orgId, projectId, payload)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create task")
    }
  }
)

export const updateTask = createAsyncThunk(
  "tasks/update",
  async (
    {
      orgId,
      projectId,
      taskId,
      payload,
    }: { orgId: string; projectId: string; taskId: string; payload: UpdateTaskInput },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.updateTask(orgId, projectId, taskId, payload)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update task")
    }
  }
)

export const changeTaskStatus = createAsyncThunk(
  "tasks/changeStatus",
  async (
    {
      orgId,
      projectId,
      taskId,
      status,
      version,
    }: { orgId: string; projectId: string; taskId: string; status: string; version: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.changeTaskStatus(orgId, projectId, taskId, status, version)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to change task status")
    }
  }
)

export const deleteTask = createAsyncThunk(
  "tasks/delete",
  async (
    { orgId, projectId, taskId }: { orgId: string; projectId: string; taskId: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.deleteTask(orgId, projectId, taskId)
      if (!response.success) {
        return rejectWithValue(response.error || response.message)
      }
      return taskId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete task")
    }
  }
)

export const fetchMyTasks = createAsyncThunk(
  "tasks/myTasks",
  async (
    params?: {
      page?: number
      page_size?: number
      status?: string
      sort_by?: string
      sort_order?: string
    },
    { rejectWithValue }
  ) => {
    try {
      const response = await taskService.getMyTasks(params)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load my tasks")
    }
  }
)

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    clearActiveTask: (state) => {
      state.activeTask = null
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          page_size: action.payload.page_size,
          total_pages: action.payload.total_pages,
        }
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchTaskDetail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchTaskDetail.fulfilled, (state, action) => {
        state.isLoading = false
        state.activeTask = action.payload
      })
      .addCase(fetchTaskDetail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(createTask.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks.push(action.payload)
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateTask.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateTask.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = action.payload
        }
      })
      .addCase(updateTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(changeTaskStatus.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(changeTaskStatus.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.tasks.findIndex((t) => t.id === action.payload.id)
        if (index !== -1) {
          state.tasks[index] = action.payload
        }
        if (state.activeTask?.id === action.payload.id) {
          state.activeTask = action.payload
        }
      })
      .addCase(changeTaskStatus.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      .addCase(deleteTask.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
        state.isLoading = false
        state.tasks = state.tasks.filter((t) => t.id !== action.payload)
        if (state.activeTask?.id === action.payload) {
          state.activeTask = null
        }
      })
      .addCase(deleteTask.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchMyTasks.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchMyTasks.fulfilled, (state, action) => {
        state.isLoading = false
        state.tasks = action.payload.items
        state.pagination = {
          total: action.payload.total,
          page: action.payload.page,
          page_size: action.payload.page_size,
          total_pages: action.payload.total_pages,
        }
      })
      .addCase(fetchMyTasks.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearActiveTask } = taskSlice.actions
export default taskSlice.reducer
