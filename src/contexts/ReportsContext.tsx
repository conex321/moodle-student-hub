import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

type Submission = {
  courseId: string;
  submissionName: string;
  studentName: string;
  studentUsername: string;
  studentEmail: string;
  dateSubmitted: string;
  directLink: string;
};

type Report = {
  schoolName: string;
  googleSheetsLink: string;
  updatedAt: string;
  errorMessage?: string;
  submissions: Submission[];
};

interface ReportsContextType {
  reports: Report[];
  loading: boolean;
  error: string | null;
  loadSuccess: boolean;
  refreshReports: () => Promise<void>;
}

const ReportsContext = createContext<ReportsContextType | undefined>(undefined);

export const useReports = () => {
  const context = useContext(ReportsContext);
  if (!context) {
    throw new Error('useReports must be used within ReportsProvider');
  }
  return context;
};

export const ReportsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { authState } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadSuccess, setLoadSuccess] = useState<boolean>(false);

  const fetchReports = async () => {
    try {
      console.log('ReportsContext: Fetching reports from API');
      setLoading(true);
      setError(null);
      setLoadSuccess(false);

      const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');

      if (response.status === 200) {
        const fetchedReports: Report[] = response.data;
        console.log('ReportsContext: Received reports with status 200:', fetchedReports.length);

        const validReports = (fetchedReports || []).filter(
          (report): report is Report =>
            report != null &&
            typeof report === 'object' &&
            'schoolName' in report &&
            'submissions' in report
        );

        const reportsWithSortedSubmissions = validReports.map(report => ({
          ...report,
          submissions: (report.submissions || []).sort(
            (a, b) =>
              new Date(a.dateSubmitted).getTime() -
              new Date(b.dateSubmitted).getTime()
          ),
        }));

        setReports(reportsWithSortedSubmissions);
        setLoadSuccess(true);
        console.log('ReportsContext: Reports loaded successfully');
      } else {
        console.error('ReportsContext: Non-200 status:', response.status);
        setError(`Failed to load reports (Status: ${response.status})`);
        setLoadSuccess(false);
      }
    } catch (err) {
      console.error('ReportsContext: Error fetching reports:', err);
      setError('Failed to fetch reports. Please try again later.');
      setLoadSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  const refreshReports = async () => {
    await fetchReports();
  };

  // Fetch reports when a teacher logs in
  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.role === 'teacher' && !authState.isLoading) {
      console.log('ReportsContext: Teacher authenticated, loading reports');
      fetchReports();
    } else if (!authState.isAuthenticated && !authState.isLoading) {
      // Clear reports when user logs out
      console.log('ReportsContext: User logged out, clearing reports');
      setReports([]);
      setLoadSuccess(false);
      setError(null);
    }
  }, [authState.isAuthenticated, authState.user?.role, authState.isLoading]);

  return (
    <ReportsContext.Provider 
      value={{ 
        reports, 
        loading, 
        error, 
        loadSuccess, 
        refreshReports 
      }}
    >
      {children}
    </ReportsContext.Provider>
  );
};
