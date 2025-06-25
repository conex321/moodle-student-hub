import React, { useState, useEffect, ChangeEvent } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
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
type FilterState = { 
  [key: string]: { 
    submissionName: string; 
    startDate: string; 
    endDate: string 
  } 
};

const Reports: React.FC = () => {
  const { authState } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [accessibleSchools, setAccessibleSchools] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageState>({});
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPageState>({});
  const [filter, setFilter] = useState<FilterState>({});
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const userRole = 'teacher'; // Replace with actual role from context/auth

  const fetchUserProfile = async () => {
    if (!authState.user?.id || !authState.isAuthenticated) {
      console.log('No authenticated user, skipping profile fetch');
      setAccessibleSchools([]);
      return;
    }

    try {
      console.log('Fetching profile for user ID:', authState.user.id);

      // Query Supabase for the user's profile
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
    // Fetch user profile first to get accessible schools
    if (authState.isAuthenticated && authState.user?.id) {
      fetchUserProfile();
    } else {
      setAccessibleSchools([]);
    }
  }, [authState.user?.id, authState.isAuthenticated]);

  useEffect(() => {
    const fetchReports = async () => {
      // Don't fetch reports until we have the accessible schools
      if (accessibleSchools.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('https://ungradedassignmentsendpoint.myeducrm.net/reports');
        const allReports: Report[] = response.data;
        
        // Filter reports to only include schools the teacher has access to
        const filteredReports = allReports.filter(report => 
          accessibleSchools.includes(report.schoolName)
        );

        console.log('All reports:', allReports.length);
        console.log('Filtered reports for teacher:', filteredReports.length);
        console.log('Accessible schools:', accessibleSchools);

        setReports(filteredReports);

        const initialPage: PageState = {};
        const initialRowsPerPage: RowsPerPageState = {};
        const initialFilter: FilterState = {};

        filteredReports.forEach((report) => {
          initialPage[report.schoolName] = 0;
          initialRowsPerPage[report.schoolName] = 5;
          initialFilter[report.schoolName] = { submissionName: '', startDate: '', endDate: '' };
        });

        setPage(initialPage);
        setRowsPerPage(initialRowsPerPage);
        setFilter(initialFilter);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, [accessibleSchools]);

  const debouncedHandleFilterChange = debounce((schoolName: string, field: 'submissionName' | 'startDate' | 'endDate', value: string) => {
    setFilter((prev) => ({
      ...prev,
      [schoolName]: { ...prev[schoolName], [field]: value }
    }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);

  const fetchSchoolReport = async (schoolName: string) => {
    // Check if teacher has access to this school
    if (!accessibleSchools.includes(schoolName)) {
      setError(`You don't have access to ${schoolName}`);
      return;
    }

    try {
      const response = await axios.get<Report>(
        `https://ungradedassignmentsendpoint.myeducrm.net/reports/${schoolName}`
      );
      setReports((prev) =>
        prev.map((r) => (r.schoolName === schoolName ? response.data : r))
      );
    } catch (err) {
      setError(`Failed to fetch report for ${schoolName}`);
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

  const handleFilterChange = (schoolName: string, field: 'submissionName' | 'startDate' | 'endDate', event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleFilterChange(schoolName, field, event.target.value);
  };

  const handleSchoolSelect = (schoolName: string) => {
    // Double-check access before allowing selection
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

  // If no accessible schools, show appropriate message
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

  if (userRole === 'teacher' && !selectedSchool) {
    return (
      <MainLayout requiredRole="teacher">
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
  const currentFilter = filter[report.schoolName] || { submissionName: '', startDate: '', endDate: '' };

  const filteredSubmissions = report.submissions.filter((submission) => {
    const matchesName = submission.submissionName.toLowerCase().includes(currentFilter.submissionName.toLowerCase());
    const submissionDate = new Date(submission.dateSubmitted);
    const startDate = currentFilter.startDate ? new Date(currentFilter.startDate) : null;
    const endDate = currentFilter.endDate ? new Date(currentFilter.endDate) : null;

    const matchesStartDate = !startDate || submissionDate >= startDate;
    const matchesEndDate = !endDate || submissionDate <= endDate;

    return matchesName && matchesStartDate && matchesEndDate;
  });

  const paginatedSubmissions = filteredSubmissions.slice(
    currentPage * currentRowsPerPage,
    (currentPage + 1) * currentRowsPerPage
  );

  return (
    <MainLayout requiredRole="teacher">
      <Box m={2}>
        <Typography variant="h4" gutterBottom>
          Submissions Reports
        </Typography>
        {userRole === 'teacher' && (
          <Button
            variant="outlined"
            color="primary"
            onClick={handleBackToList}
            sx={{ mb: 2 }}
          >
            Back to School List
          </Button>
        )}
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
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            label="Filter by Submission Name"
            variant="outlined"
            value={currentFilter.submissionName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, 'submissionName', e)}
            sx={{ width: '300px' }}
          />
          <TextField
            label="Start Date"
            type="date"
            variant="outlined"
            value={currentFilter.startDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, 'startDate', e)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
          <TextField
            label="End Date"
            type="date"
            variant="outlined"
            value={currentFilter.endDate}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, 'endDate', e)}
            InputLabelProps={{ shrink: true }}
            sx={{ width: '200px' }}
          />
        </Box>
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
};

export default Reports;