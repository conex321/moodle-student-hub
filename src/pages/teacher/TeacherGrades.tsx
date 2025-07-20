import React, { useState, useEffect, ChangeEvent } from 'react';
import { MainLayout } from "@/components/layout/main-layout";
import { useNavigate } from "react-router-dom";
import { debounce } from 'lodash';
import axios from 'axios';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
type FilterState = { [key: string]: { submissionName: string; courseId: string } };
type DateFilterState = { [key: string]: { startDate?: Date; endDate?: Date } };

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
  const [dateFilter, setDateFilter] = useState<DateFilterState>({});
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

        const initialPage: PageState = {};
        const initialRowsPerPage: RowsPerPageState = {};
        const initialFilter: FilterState = {};
        const initialDateFilter: DateFilterState = {};

        fetchedReports.forEach((report) => {
          initialPage[report.schoolName] = 0;
          initialRowsPerPage[report.schoolName] = 5;
          initialFilter[report.schoolName] = { submissionName: '', courseId: '' };
          initialDateFilter[report.schoolName] = {};
        });

        setPage(initialPage);
        setRowsPerPage(initialRowsPerPage);
        setFilter(initialFilter);
        setDateFilter(initialDateFilter);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError('Failed to fetch reports');
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const debouncedHandleFilterChange = debounce((schoolName: string, field: 'submissionName' | 'courseId', value: string) => {
    setFilter((prev) => ({
      ...prev,
      [schoolName]: { ...prev[schoolName], [field]: value }
    }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);

  const fetchSchoolReport = async (schoolName: string) => {
    try {
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

  const handleFilterChange = (schoolName: string, field: 'submissionName' | 'courseId', event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleFilterChange(schoolName, field, event.target.value);
  };

  const handleDateFilterChange = (schoolName: string, type: 'startDate' | 'endDate', date?: Date) => {
    setDateFilter((prev) => ({
      ...prev,
      [schoolName]: {
        ...prev[schoolName],
        [type]: date
      }
    }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  };

  const clearDateFilter = (schoolName: string) => {
    setDateFilter((prev) => ({
      ...prev,
      [schoolName]: {}
    }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  };

  const handleSchoolSelect = (schoolName: string) => {
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

  if (!selectedSchool) {
    return (
      <MainLayout requiredRole="teacher">
        {accessibleSchools.length === 0 && !loading ? (
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
              {accessibleSchools.length > 0 ? (
                <>
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
                </>
              ) : (
                <Box display="flex" justifyContent="center" alignItems="center">
                  <CircularProgress />
                </Box>
              )}
            </Box>
          </div>
        )}
      </MainLayout>
    );
  }

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

  const currentPage = page[report.schoolName] || 0;
  const currentRowsPerPage = rowsPerPage[report.schoolName] || 5;
  const currentFilter = filter[report.schoolName] || { submissionName: '', courseId: '' };
  const currentDateFilter = dateFilter[report.schoolName] || {};

  // Filter submissions by name, course ID, and date range
  const filteredSubmissions = report.submissions.filter((submission) => {
    const nameMatch = submission.submissionName.toLowerCase().includes(currentFilter.submissionName.toLowerCase() || '');
    const courseIdMatch = submission.courseId.toLowerCase().includes(currentFilter.courseId.toLowerCase() || '');
    
    const submissionDate = new Date(submission.dateSubmitted);
    const startDateMatch = !currentDateFilter.startDate || submissionDate >= currentDateFilter.startDate;
    const endDateMatch = !currentDateFilter.endDate || submissionDate <= currentDateFilter.endDate;
    
    return nameMatch && courseIdMatch && startDateMatch && endDateMatch;
  });

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
        
        {/* Filters Section */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            label="Filter by Submission Name"
            variant="outlined"
            value={currentFilter.submissionName || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, 'submissionName', e)}
            sx={{ minWidth: '200px', maxWidth: '300px' }}
          />
          <TextField
            label="Filter by Course ID"
            variant="outlined"
            value={currentFilter.courseId || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleFilterChange(report.schoolName, 'courseId', e)}
            sx={{ minWidth: '200px', maxWidth: '300px' }}
          />
          
          {/* Start Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outlined"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !currentDateFilter.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDateFilter.startDate ? format(currentDateFilter.startDate, "PPP") : "Start Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDateFilter.startDate}
                onSelect={(date) => handleDateFilterChange(report.schoolName, 'startDate', date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* End Date Filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outlined"
                className={cn(
                  "w-[200px] justify-start text-left font-normal",
                  !currentDateFilter.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {currentDateFilter.endDate ? format(currentDateFilter.endDate, "PPP") : "End Date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={currentDateFilter.endDate}
                onSelect={(date) => handleDateFilterChange(report.schoolName, 'endDate', date)}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          
          {/* Clear Date Filters Button */}
          {(currentDateFilter.startDate || currentDateFilter.endDate) && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => clearDateFilter(report.schoolName)}
            >
              Clear Date Filters
            </Button>
          )}
        </Box>
        
        {report.errorMessage ? (
          <Typography color="error" gutterBottom>
            {report.errorMessage}
          </Typography>
        ) : (
          <>
            <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
              Showing {filteredSubmissions.length} submissions (sorted by oldest first)
            </Typography>
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
