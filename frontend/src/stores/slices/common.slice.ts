import { createSlice, createAsyncThunk } from "@reduxjs/toolkit"
import { commonService } from "@/services/common.service"
import { ListProjectType } from "@/types/common"

interface CommonState {
    isLoading: boolean
    error: string | null
    organizations: ListProjectType[]
}

const initialState: CommonState = {
    isLoading: false,
    error: null,
    organizations: []
}

export const fetchOrganizations = createAsyncThunk(
    "common/fetchOrganizations",
    async (_, { rejectWithValue }) => {
        try {
            const response = await commonService.list_projects()
            if (!response.success) {
                return rejectWithValue(response.error || response.message)
            }
            const data = response.data
            if (!data) {
                return []
            }
            return (Array.isArray(data) ? data : [data]) as ListProjectType[]
        } catch (error) {
            return rejectWithValue(error instanceof Error ? error.message : "Failed to fetch organizations")
        }
    }
)

const commonSlice = createSlice({
    name: "common",
    initialState,
    reducers: {
        clearError: (state) => {
            state.error = null
        },
        clearOrganizations: (state) => {
            state.organizations = []
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchOrganizations.pending, (state) => {
                state.isLoading = true
                state.error = null
            })
            .addCase(fetchOrganizations.fulfilled, (state, action) => {
                state.isLoading = false
                state.organizations = action.payload
            })
            .addCase(fetchOrganizations.rejected, (state, action) => {
                state.isLoading = false
                state.error = action.payload as string
            })
    }
})

export const { clearError, clearOrganizations } = commonSlice.actions
export default commonSlice.reducer

