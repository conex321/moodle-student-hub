
import React, { useState, useEffect, ChangeEvent } from 'react';
import { debounce } from 'lodash';
import axios from 'axios';
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

const TEACHER_SCHOOL = 'school-x';

const Reports: React.FC = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<PageState>({});
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPageState>({});
  const [filter, setFilter] = useState<FilterState>({});
  const [selectedSchool, setSelectedSchool] = useState<string | null>(null);

  const userRole = 'teacher'; // Replace with actual role from context/auth

  useEffect(() => {
    const fetchReports = async () => {
      try {
        let response;
        if (userRole === 'teacher') { // Fixed comparison
          response = await axios.get('https://34.16.51.59/reports');
        } else {
          response = await axios.get(`https://34.16.51.59/reports/${TEACHER_SCHOOL}`);
        }

        const data: Report[] = userRole === 'teacher' ? response.data : [response.data]; // Fixed comparison
        setReports(data);

        const initialPage: PageState = {};
        const initialRowsPerPage: RowsPerPageState = {};
        const initialFilter: FilterState = {};

        data.forEach((report) => {
          initialPage[report.schoolName] = 0;
          initialRowsPerPage[report.schoolName] = 5;
          initialFilter[report.schoolName] = '';
        });

        setPage(initialPage);
        setRowsPerPage(initialRowsPerPage);
        setFilter(initialFilter);
        setLoading(false);
      } catch (err) {
        setError(
          userRole === 'teacher' // Fixed comparison
            ? 'Failed to fetch reports'
            : `Failed to fetch report for ${TEACHER_SCHOOL}`
        );
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const debouncedHandleFilterChange = debounce((schoolName: string, value: string) => {
    setFilter((prev) => ({ ...prev, [schoolName]: value }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);

  const fetchSchoolReport = async (schoolName: string) => {
    try {
      const response = await axios.get<Report>(
        `https://34.16.51.59/reports/${schoolName}`
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

  const handleFilterChange = (schoolName: string, event: React.ChangeEvent<HTMLInputElement>) => {
    debouncedHandleFilterChange(schoolName, event.target.value);
  };

  const handleSchoolSelect = (schoolName: string) => {
    setSelectedSchool(schoolName);
  };

  const handleBackToList = () => {
    setSelectedSchool(null);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box m={2}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (userRole === 'teacher' && !selectedSchool) {
    return (
      <Box className="mx-4 my-8 max-w-2xl mx-auto">
        <Typography variant="h4" className="text-3xl font-bold text-gray-800 mb-6">
          Select a School
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
    );
  }

  const report = reports.find((r) => r.schoolName === (userRole === 'teacher' ? selectedSchool : TEACHER_SCHOOL));
  if (!report) {
    return (
      <Box m={2}>
        <Typography color="error">Report not found</Typography>
      </Box>
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
  );
};

export default Reports;
