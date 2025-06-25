
import axios from "axios";

export interface SchoolStatistics {
  totalSchools: number;
  schoolNames: string[];
  totalSubmissions: number;
  averageSubmissionsPerSchool: number;
  submissionsBySchool: {
    submissionCount: number;
    schoolName: string;
  }[];
}

export interface StatisticsResponse {
  success: boolean;
  data: SchoolStatistics;
}

export const statisticsApi = {
  getSchoolStatistics: async (): Promise<SchoolStatistics> => {
    try {
      const response = await axios.get<StatisticsResponse>("http://localhost:4005/statistics");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching school statistics:", error);
      throw error;
    }
  }
};
