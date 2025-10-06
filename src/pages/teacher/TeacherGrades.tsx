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
  const [reportsLoading, setReportsLoading] = useState<boolean>(true);
  const [reportsLoadSuccess, setReportsLoadSuccess] = useState<boolean>(false);
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
        setReportsLoading(true);
        setReportsLoadSuccess(false);
        
        const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');
        
        // Only proceed if status is 200
        if (response.status === 200) {
          const fetchedReports: Report[] = response.data;
          console.log('Received reports with status 200:', fetchedReports.length);

          // Filter out any null/undefined reports and sort submissions by date (oldest first)
          const validReports = (fetchedReports || []).filter((report): report is Report => 
            report != null && 
            typeof report === 'object' && 
            'schoolName' in report &&
            'submissions' in report
          );
          
          const reportsWithSortedSubmissions = validReports.map(report => ({
            ...report,
            submissions: (report.submissions || []).sort((a, b) => 
              new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
            )
          }));

          setReports(reportsWithSortedSubmissions);
          setReportsLoadSuccess(true);
          setReportsLoading(false);
        } else {
          console.error('Reports request returned non-200 status:', response.status);
          setError(`Failed to load reports (Status: ${response.status})`);
          setReportsLoadSuccess(false);
          setReportsLoading(false);
        }
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports. Please try again later.');
        setReportsLoadSuccess(false);
        setReportsLoading(false);
      }
    };

    fetchReports();
  }, []);

  const handleSchoolSelect = (schoolName: string) => {
    // Only allow selection if reports loaded successfully
    if (!reportsLoadSuccess) {
      console.log('Cannot select school - reports not loaded successfully');
      return;
    }
    console.log('Selecting school:', schoolName);
    setSubmissionsLoading(true);
    setSelectedSchool(schoolName);
    // Reset loading after a short delay to show the data
    setTimeout(() => setSubmissionsLoading(false), 100);
  };

  const handleBackToList = () => {
    console.log('Returning to school list, resetting submissionsLoading');
    setSelectedSchool(null);
    setSubmissionsLoading(false);
  };

  async function fetchSchoolReport(schoolName: string) {
    try {
      console.log('Starting report refresh for:', schoolName, 'Setting submissionsLoading to true');
      setSubmissionsLoading(true);
      const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');
      
      console.log('Received API response for:', schoolName);
      const allReports = response.data || [];
      const updatedReport = allReports.find((r: Report) => r && r.schoolName === schoolName);
      if (updatedReport) {
        // Sort submissions by date (oldest first)
        const sortedReport = {
          ...updatedReport,
          submissions: (updatedReport.submissions || []).sort((a, b) => 
            new Date(a.dateSubmitted).getTime() - new Date(b.dateSubmitted).getTime()
          )
        };
        
        setReports((prev) =>
          prev.map((r) => (r && r.schoolName === schoolName ? sortedReport : r))
        );
      } else {
        console.log('No updated report found for:', schoolName);
      }
    } catch (err) {
      console.error('Error refreshing report:', err);
      setError(`Failed to refresh report for ${schoolName}`);
    } finally {
      console.log('Ending submissionsLoading for:', schoolName);
      setSubmissionsLoading(false);
    }
  }

  if (loading || reportsLoading) {
    console.log('Main loading state active (waiting for profile and reports)');
    return (
      <MainLayout requiredRole="teacher">
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
          <CircularProgress size={60} thickness={4} />
        </Box>
      </MainLayout>
    );
  }

  if (error) {
    console.log('Error state:', error);
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
      console.log('No report found for:', selectedSchool);
      return (
        <MainLayout requiredRole="teacher">
          <Box m={2}>
            <CircularProgress size={60} thickness={4} />
              
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
        <SchoolSubmissions
          report={report}
          onBack={handleBackToList}
          onRefresh={() => fetchSchoolReport(selectedSchool)}
          loading={submissionsLoading}
        />
      </MainLayout>
    );
  }

  console.log('Rendering school selection, accessibleSchools:', accessibleSchools);
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
          <Box className="mx-4 my-8 max-w-2xl mx-auto">
            <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6">
              Select a School
            </Typography>
            <Typography variant="body2" className="text-gray-600 mb-4">
              Available schools: {accessibleSchools.length}
            </Typography>
            {reportsLoading ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <CircularProgress size={40} thickness={4} />
              </Box>
            ) : !reportsLoadSuccess ? (
              <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
                <Typography color="error">
                  Unable to load reports. Please refresh the page to try again.
                </Typography>
              </Box>
            ) : (
              <List className="bg-white shadow-lg rounded-lg">
                {accessibleSchools.map((schoolName) => (
                  <ListItem key={schoolName} className="border-b last:border-b-0">
                    <ListItemButton
                      onClick={() => handleSchoolSelect(schoolName)}
                      disabled={!reportsLoadSuccess}
                      className="hover:bg-blue-50 transition-colors duration-200 py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ListItemText
                        primary={schoolName}
                        className="text-lg font-medium text-gray-700"
                      />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            )}
          </Box>
        </div>
      )}
    </MainLayout>
  );
}
