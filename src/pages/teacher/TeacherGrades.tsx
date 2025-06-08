
import React, { useState, useEffect, ChangeEvent } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import axios from 'axios';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  Typography,
  Link,
  Button,
  Box,
  CircularProgress,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
} from '@mui/material';

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

type PageState = { [key: string]: number };
type RowsPerPageState = { [key: string]: number };
type FilterState = { [key: string]: string };

export default function TeacherGrades() {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [accessibleSchools, setAccessibleSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageState>({});
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPageState>({});
  const [filter, setFilter] = useState<FilterState>({});
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const handleNavigateToReports = () => {
    navigate("/teacher/reports");
  };

  const fetchUserProfile = async () => {
    if (!authState.user?.id || !authState.isAuthenticated) {
      console.log('No authenticated user, skipping profile fetch');
      setAccessibleSchools([]);
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
        return;
      }

      if (!profiles || profiles.length === 0) {
        console.log('No profile found for user ID:', authState.user.id);
        setAccessibleSchools([]);
        return;
      }

      const profile = profiles[0];
      const schools = profile?.accessible_schools || [];
      setAccessibleSchools(schools);
      console.log('Teacher accessible schools:', schools);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      setAccessibleSchools([]);
    }
  };

  useEffect(() => {
    if (authState.isAuthenticated && authState.user?.id) {
      fetchUserProfile();
    } else {
      setAccessibleSchools([]);
    }
  }, [authState.user?.id, authState.isAuthenticated]);

  useEffect(() => {
    const fetchReports = async () => {
      if (accessibleSchools.length === 0) {
        setLoading(false);
        return;
      }

      try {
        console.log('Sending POST request with accessible schools:', accessibleSchools);
        
        const response = await axios.post('https://ungradedassignmentsendpoint.myeducrm.net/reports', {
          schoolNames: accessibleSchools
        });
        
        const fetchedReports: Report[] = response.data;
        console.log('Received reports:', fetchedReports.length);

        setReports(fetchedReports);

        const initialPage: PageState = {};
        const initialRowsPerPage: RowsPerPageState = {};
        const initialFilter: FilterState = {};

        fetchedReports.forEach((report) => {
          initialPage[report.schoolName] = 0;
          initialRowsPerPage[report.schoolName] = 5;
          initialFilter[report.schoolName] = '';
        });

        setPage(initialPage);
        setRowsPerPage(initialRowsPerPage);
        setFilter(initialFilter);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, [accessibleSchools]);

  const debouncedHandleFilterChange = debounce((schoolName: string, value: string) => {
    setFilter((prev) => ({ ...prev, [schoolName]: value }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);

  const fetchSchoolReport = async (schoolName: string) => {
    if (!accessibleSchools.includes(schoolName)) {
      setError(`You don't have access to ${schoolName}`);
      return;
    }

    try {
      const response = await axios.post('https://ungradedassignmentsendpoint.myeducrm.net/reports', {
        schoolNames: [schoolName]
      });
      
      const updatedReport = response.data[0];
      if (updatedReport) {
        setReports((prev) =>
          prev.map((r) => (r.schoolName === schoolName ? updatedReport : r))
        );
      }
    } catch (err) {
      console.error('Error refreshing report:', err);
      setError(`Failed to refresh report for ${schoolName}`);
    }
  };

  const handleChangePage = (schoolName: string, newPage: number) => {
    setPage((prev) => ({ ...prev, [schoolName]: newPage }));
  };

  const handleChangeRowsPerPage = (schoolName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage((prev) => ({ ...prev, [schoolName]: newRowsPerPage }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  };

  const handleFilterChange = (schoolName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleFilterChange(schoolName, event.target.value);
  };

  const handleSchoolSelect = (schoolName: string) => {
    if (!accessibleSchools.includes(schoolName)) {
      setError(`You don't have access to ${schoolName}`);
      return;
    }
    setSelectedSchool(schoolName);
  };

  const handleBackToList = () => {
    setSelectedSchool(null);
  };

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

  if (accessibleSchools.length === 0) {
    return (
      <MainLayout requiredRole="teacher">
        <Box className="mx-4 my-8 max-w-2xl mx-auto">
          <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6">
            No School Access
          </Typography>
          <Typography variant="body1" className="text-gray-600">
            You don't have access to any schools. Please contact your administrator to assign schools to your profile.
          </Typography>
        </Box>
      </MainLayout>
    );
  }

  if (!selectedSchool) {
    return (
      <MainLayout requiredRole="teacher">
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
              You have access to {accessibleSchools.length} school{accessibleSchools.length !== 1 ? 's' : ''}
            </Typography>
            <List className="bg-white shadow-lg rounded-lg">
              {reports.map((report) => (
                <ListItem key={report.schoolName} className="border-b last:border-b-0">
                  <ListItemButton
                    onClick={() => handleSchoolSelect(report.schoolName)}
                    className="hover:bg-blue-50 transition-colors duration-200 py-4"
                  >
                    <ListItemText
                      primary={report.schoolName}
                      className="text-lg font-medium text-gray-700"
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          </Box>
        </div>
      </MainLayout>
    );
  }

  const report = reports.find((r) => r.schoolName === selectedSchool);
  if (!report) {
    return (
      <MainLayout requiredRole="teacher">
        <Box m={2}>
          <Typography color="error">Report not found or you don't have access to this school</Typography>
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

  const currentPage = page[report.schoolName] || 0;
  const currentRowsPerPage = rowsPerPage[report.schoolName] || 5;
  const currentFilter = filter[report.schoolName] || '';

  const filteredSubmissions = report.submissions.filter((submission) =>
    submission.submissionName.toLowerCase().includes(currentFilter.toLowerCase())
  );

  const paginatedSubmissions = filteredSubmissions.slice(
    currentPage * currentRowsPerPage,
    (currentPage + 1) * currentRowsPerPage
  );

  return (
    <MainLayout requiredRole="teacher">
      <Box m={2}>
        <Typography variant="h4" gutterBottom>
          Grade Management - Submissions Reports
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          onClick={handleBackToList}
          sx={{ mb: 2 }}
        >
          Back to School List
        </Button>
        <Typography variant="h5" gutterBottom>
          {report.schoolName}
        </Typography>
        <Typography variant="body1">
          <strong>Google Sheets:</strong>{' '}
          <Link href={report.googleSheetsLink} target="_blank" rel="noopener noreferrer">
            View Report
          </Link>
        </Typography>
        <Typography variant="body1" gutterBottom>
          <strong>Last Updated:</strong> {new Date(report.updatedAt).toLocaleString()}
        </Typography>
        <TextField
          label="Filter by Submission Name"
          variant="outlined"
          value={currentFilter}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, e)}
          sx={{ mb: 2, width: '300px' }}
        />
        {report.errorMessage ? (
          <Typography color="error" gutterBottom>
            {report.errorMessage}
          </Typography>
        ) : (
          <>
            <TableContainer component={Paper} sx={{ mb: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Course ID</TableCell>
                    <TableCell>Submission Name</TableCell>
                    <TableCell>Student Name</TableCell>
                    <TableCell>Student Username</TableCell>
                    <TableCell>Student Email</TableCell>
                    <TableCell>Date Submitted</TableCell>
                    <TableCell>Link</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedSubmissions.map((submission, index) => (
                    <TableRow key={index}>
                      <TableCell>{submission.courseId}</TableCell>
                      <TableCell>{submission.submissionName}</TableCell>
                      <TableCell>{submission.studentName}</TableCell>
                      <TableCell>{submission.studentUsername}</TableCell>
                      <TableCell>{submission.studentEmail}</TableCell>
                      <TableCell>
                        {new Date(submission.dateSubmitted).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={submission.directLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={filteredSubmissions.length}
              rowsPerPage={currentRowsPerPage}
              page={currentPage}
              onPageChange={(_, newPage) => handleChangePage(report.schoolName, newPage)}
              onRowsPerPageChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChangeRowsPerPage(report.schoolName, e)}
            />
          </>
        )}
        <Button
          variant="contained"
          color="primary"
          onClick={() => fetchSchoolReport(report.schoolName)}
          sx={{ mt: 2 }}
        >
          Refresh Report
        </Button>
      </Box>
    </MainLayout>
  );
}
