import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { organizationService } from "@/services/organization.service"
import type {
  CreateOrganizationInput,
  Organization,
  OrganizationMember,
} from "@/types/organization"

export interface OrganizationState {
  organizations: Organization[]
  activeOrganizationId: string | null
  activeOrganization: Organization | null
  members: OrganizationMember[]
  isLoading: boolean
  error: string | null
}

const initialState: OrganizationState = {
  organizations: [],
  activeOrganizationId: null,
  activeOrganization: null,
  members: [],
  isLoading: false,
  error: null,
}

export const fetchOrganizations = createAsyncThunk(
  "organizations/list",
  async (_, { rejectWithValue }) => {
    try {
      const response = await organizationService.listOrganizations()
      if (!response.success) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load organizations")
    }
  }
)

export const createOrganization = createAsyncThunk(
  "organizations/create",
  async (payload: CreateOrganizationInput, { rejectWithValue }) => {
    try {
      const response = await organizationService.createOrganization(payload)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to create organization")
    }
  }
)

export const fetchOrganizationDetail = createAsyncThunk(
  "organizations/detail",
  async (orgId: string, { rejectWithValue }) => {
    try {
      const response = await organizationService.getOrganization(orgId)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load organization")
    }
  }
)

export const fetchOrganizationMembers = createAsyncThunk(
  "organizations/members",
  async (
    payload: { orgId: string; includePending?: boolean },
    { rejectWithValue }
  ) => {
    try {
      const response = await organizationService.getOrganizationMembers(
        payload.orgId,
        payload.includePending ?? true
      )
      if (!response.success) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data || []
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to load members")
    }
  }
)

export const updateOrganization = createAsyncThunk(
  "organizations/update",
  async (
    payload: { orgId: string } & Partial<CreateOrganizationInput>,
    { rejectWithValue }
  ) => {
    try {
      const { orgId, ...input } = payload
      const response = await organizationService.updateOrganization(orgId, input)
      if (!response.success || !response.data) {
        return rejectWithValue(response.error || response.message)
      }
      return response.data
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to update organization")
    }
  }
)

export const deleteOrganization = createAsyncThunk(
  "organizations/delete",
  async (orgId: string, { rejectWithValue }) => {
    try {
      const response = await organizationService.deleteOrganization(orgId)
      if (!response.success) {
        return rejectWithValue(response.error || response.message)
      }
      return orgId
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : "Failed to delete organization")
    }
  }
)

const organizationSlice = createSlice({
  name: "organizations",
  initialState,
  reducers: {
    setActiveOrganizationId: (state, action: PayloadAction<string | null>) => {
      state.activeOrganizationId = action.payload
    },
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

      .addCase(createOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        state.organizations.push(action.payload)
        state.activeOrganizationId = action.payload.id
        state.activeOrganization = action.payload
      })
      .addCase(createOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchOrganizationDetail.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrganizationDetail.fulfilled, (state, action) => {
        state.isLoading = false
        state.activeOrganization = action.payload
        state.activeOrganizationId = action.payload.id
      })
      .addCase(fetchOrganizationDetail.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(fetchOrganizationMembers.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchOrganizationMembers.fulfilled, (state, action) => {
        state.isLoading = false
        state.members = action.payload
      })
      .addCase(fetchOrganizationMembers.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(updateOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        const index = state.organizations.findIndex((org) => org.id === action.payload.id)
        if (index !== -1) {
          state.organizations[index] = action.payload
        }
        if (state.activeOrganizationId === action.payload.id) {
          state.activeOrganization = action.payload
        }
      })
      .addCase(updateOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

      .addCase(deleteOrganization.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.isLoading = false
        state.organizations = state.organizations.filter((org) => org.id !== action.payload)
        if (state.activeOrganizationId === action.payload) {
          state.activeOrganizationId = null
          state.activeOrganization = null
        }
      })
      .addCase(deleteOrganization.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setActiveOrganizationId } = organizationSlice.actions
export default organizationSlice.reducer

