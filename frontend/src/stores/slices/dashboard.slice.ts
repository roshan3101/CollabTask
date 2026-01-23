import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { dashboardService, type DashboardAnalytics, type RecentProject } from "@/services/dashboard.service"

interface DashboardState {
  analytics: DashboardAnalytics | null
  recentProjects: RecentProject[]
  isLoading: boolean
  error: string | null
}

const initialState: DashboardState = {
  analytics: null,
  recentProjects: [],
  isLoading: false,
  error: null,
}

export const fetchDashboardAnalytics = createAsyncThunk(
  "dashboard/fetchAnalytics",
  async (_, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getAnalytics()
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch dashboard analytics")
    }
  }
)

export const fetchRecentProjects = createAsyncThunk(
  "dashboard/fetchRecentProjects",
  async (limit: number = 3, { rejectWithValue }) => {
    try {
      const response = await dashboardService.getRecentProjects(limit)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch recent projects")
    }
  }
)

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Analytics
      .addCase(fetchDashboardAnalytics.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchDashboardAnalytics.fulfilled, (state, action) => {
        state.isLoading = false
        state.analytics = action.payload
      })
      .addCase(fetchDashboardAnalytics.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Recent Projects
      .addCase(fetchRecentProjects.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchRecentProjects.fulfilled, (state, action) => {
        state.isLoading = false
        state.recentProjects = action.payload
      })
      .addCase(fetchRecentProjects.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError } = dashboardSlice.actions
export default dashboardSlice.reducer
