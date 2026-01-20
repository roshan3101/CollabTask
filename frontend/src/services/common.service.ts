import { CommonResponse, ListProjectType } from "@/types/common";
import { apiClient } from "./apiClient"

class CommonService {

    async list_projects() : Promise<CommonResponse<ListProjectType>>{
        try{
            const data = await apiClient.get<CommonResponse<ListProjectType>>('/common')
            return data;
        } catch(error) {
            return {
                success: false,
                message: "Fetching failed",
                error: error instanceof Error ? error.message : "Unknown error"
            }
        }
    }
}


export const commonService = new CommonService()