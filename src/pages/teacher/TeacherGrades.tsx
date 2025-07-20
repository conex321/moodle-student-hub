import React, { useState, useEffect } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Box,
  Button,
  CircularProgress,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
} from '@mui/material';
import SchoolSubmissions from './SchoolSubmissions';

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

export default function TeacherGrades() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [accessibleSchools, setAccessibleSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submissionsLoading, setSubmissionsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const handleNavigateToReports = () => {
    navigate("/teacher/reports");
  };

  const fetchUserProfile = async () => {
    if (!authState.user?.id || !authState.isAuthenticated) {
      console.log('No authenticated user, skipping profile fetch');
      setAccessibleSchools([]);
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching profile for user ID:', authState.user.id);

      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('accessible_schools')
        .eq('id', authState.user.id);

      console.log('Supabase profiles response:', { profiles, error });

      if (error) {
        console.error('Supabase error:', error);
        setAccessibleSchools([]);
        setError('Failed to fetch user profile');
        setLoading(false);
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profile found for user ID:', authState.user.id);
        setAccessibleSchools([]);
        setLoading(false);
        return;
      }

      const profile = profiles[0];
      const schools = profile?.accessible_schools || [];
      setAccessibleSchools(schools);
      console.log('Teacher accessible schools:', schools);
      setLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setAccessibleSchools([]);
      setError('Unexpected error fetching profile');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id) {
      fetchUserProfile();
    } else {
      setAccessibleSchools([]);
      setLoading(false);
    }
  }, [authState.user?.id, authState.isAuthenticated]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        console.log('Fetching all reports from endpoint');
        
        const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');
        
        const fetchedReports: Report[] = response.data;
        console.log('Received reports:', fetchedReports.length);

        // Sort submissions by date (oldest first) for each report
        const reportsWithSortedSubmissions = fetchedReports.map(report => ({
          ...report,
          submissions: report.submissions.sort((a, b) => 
            new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
          )
        }));

        setReports(reportsWithSortedSubmissions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSchoolSelect = (schoolName: string) => {
    setSubmissionsLoading(true);
    setSelectedSchool(schoolName);
    // Simulate loading delay for SchoolSubmissions
    setTimeout(() => {
      setSubmissionsLoading(false);
    }, 300);
  };

  const handleBackToList = () => {
    setSelectedSchool(null);
    setSubmissionsLoading(false);
  };

  async function fetchSchoolReport(schoolName: string) {
    try {
      setSubmissionsLoading(true);
      const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');
      
      const updatedReport = response.data.find((r: Report) => r.schoolName === schoolName);
      if (updatedReport) {
        // Sort submissions by date (oldest first)
        const sortedReport = {
          ...updatedReport,
          submissions: updatedReport.submissions.sort((a, b) => 
            new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
          )
        };
        
        setReports((prev) =>
          prev.map((r) => (r.schoolName === schoolName ? sortedReport : r))
        );
      }
    } catch (err) {
      console.error('Error refreshing report:', err);
      setError(`Failed to refresh report for ${schoolName}`);
    } finally {
      setSubmissionsLoading(false);
    }
  }

  if (loading) {
    return (
      <MainLayout requiredRole="teacher">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout requiredRole="teacher">
        <Box m={2}>
          <Typography color="error">{error}</Typography>
        </Box>
      </MainLayout>
    );
  }

  if (selectedSchool) {
    const report = reports.find((r) => r.schoolName === selectedSchool);
    if (!report) {
      return (
        <MainLayout requiredRole="teacher">
          <Box m={2}>
            <Typography color="error">Report not found</Typography>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleBackToList}
              sx={{ mt: 2 }}
            >
              Back to School List
            </Button>
          </Box>
        </MainLayout>
      );
    }
    return (
      <MainLayout requiredRole="teacher">
        {submissionsLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
            <CircularProgress />
          </Box>
        ) : (
          <SchoolSubmissions
            report={report}
            onBack={handleBackToList}
            onRefresh={() => fetchSchoolReport(selectedSchool)}
          />
        )}
      </MainLayout>
    );
  }

  return (
    <MainLayout requiredRole="teacher">
      {accessibleSchools.length === 0 ? (
        <Box m={2}>
          <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6">
            Select a School
          </Typography>
          <Typography color="error">No schools available</Typography>
        </Box>
      ) : (
        <div>
          <Button
            variant="contained"
            color="primary"
            onClick={handleNavigateToReports}
            className="mt-4"
          >
            View Student Reports
          </Button>
          <h1 className="text-3xl font-bold mb-6">Grade Management</h1>
          
          <Box className="mx-4 my-8 max-w-2xl mx-auto">
            <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6">
              Select a School
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Available schools: {accessibleSchools.length}
            </Typography>
            <List className="bg-white shadow-lg rounded-lg">
              {accessibleSchools.map((schoolName) => (
                <ListItem key={schoolName} className="border-b last:border-b-0">
                  <ListItemButton
                    onClick={() => handleSchoolSelect(schoolName)}
                    className="hover:bg-blue-50 transition-colors duration-200 py-4"
                  >
                    <ListItemText
                      primary={schoolName}
                      className="text-lg font-medium text-gray-700"
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </div>
      )}
    </MainLayout>
  );
}