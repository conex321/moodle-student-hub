import React, { useState, useEffect } from 'react';
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
  TextField
} from '@mui/material';

// Static school name for teacher (replace with your state logic later)
const TEACHER_SCHOOL = 'school-x';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState({}); // Track page per school
  const [rowsPerPage, setRowsPerPage] = useState({}); // Track rows per page per school
  const [filter, setFilter] = useState({}); // Track filter per school

  // Assume userRole is obtained from state/context (e.g., 'admin' or 'teacher')
  const userRole = 'teacher'; // Replace with actual role from state/auth context

  // Fetch reports based on user role
  useEffect(() => {
    const fetchReports = async () => {
      try {
        let response;
        if (userRole === 'admin') {
          // Admins fetch all reports
          response = await axios.get('http://34.16.51.59:4005/reports');
        } else {
          // Teachers fetch only their school's report
          response = await axios.get(`http://34.16.51.59:4005/reports/${TEACHER_SCHOOL}`);
        }

        const data = userRole === 'admin' ? response.data : [response.data]; // Normalize to array for consistency
        setReports(data);

        // Initialize pagination and filter state for each school
        const initialPage = {};
        const initialRowsPerPage = {};
        const initialFilter = {};
        data.forEach((report) => {
          initialPage[report.schoolName] = 0;
          initialRowsPerPage[report.schoolName] = 5; // Default to 5 rows per page
          initialFilter[report.schoolName] = ''; // Default to empty filter
        });
        setPage(initialPage);
        setRowsPerPage(initialRowsPerPage);
        setFilter(initialFilter);
        setLoading(false);
      } catch (err) {
        setError(userRole === 'admin' ? 'Failed to fetch reports' : `Failed to fetch report for ${TEACHER_SCHOOL}`);
        setLoading(false);
      }
    };
    fetchReports();
  }, []);
  const debouncedHandleFilterChange = debounce((schoolName, value) => {
    setFilter((prev) => ({ ...prev, [schoolName]: value }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);
  // Fetch a specific school's report
  const fetchSchoolReport = async (schoolName) => {
    try {
      const response = await axios.get(`http://34.16.51.59:4005/reports/${schoolName}`);
      setReports((prev) =>
        prev.map((r) => (r.schoolName === schoolName ? response.data : r))
      );
    } catch (err) {
      setError(`Failed to fetch report for ${schoolName}`);
    }
  };

  // Handle page change for a specific school
  const handleChangePage = (schoolName, newPage) => {
    setPage((prev) => ({ ...prev, [schoolName]: newPage }));
  };

  // Handle rows per page change for a specific school
  const handleChangeRowsPerPage = (schoolName, event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage((prev) => ({ ...prev, [schoolName]: newRowsPerPage }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 })); // Reset to first page
  };

  // Handle filter change for a specific school
  const handleFilterChange = (schoolName, event) => {
    debouncedHandleFilterChange(schoolName, event.target.value);
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

  return (
    <Box m={2}>
      <Typography variant="h4" gutterBottom>
        Submissions Reports
      </Typography>
      {reports.map((report) => {
        const currentPage = page[report.schoolName] || 0;
        const currentRowsPerPage = rowsPerPage[report.schoolName] || 5;
        const currentFilter = filter[report.schoolName] || '';

        // Filter submissions by submissionName
        const filteredSubmissions = report.submissions.filter((submission) =>
          submission.submissionName.toLowerCase().includes(currentFilter.toLowerCase())
        );

        // Paginate filtered submissions
        const paginatedSubmissions = filteredSubmissions.slice(
          currentPage * currentRowsPerPage,
          (currentPage + 1) * currentRowsPerPage
        );

        return (
          <Box key={report.schoolName} mb={4}>
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
              <strong>Last Updated:</strong>{' '}
              {new Date(report.updatedAt).toLocaleString()}
            </Typography>
            <TextField
              label="Filter by Submission Name"
              variant="outlined"
              value={currentFilter}
              onChange={(e) => handleFilterChange(report.schoolName, e)}
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
                  count={filteredSubmissions.length} // Use filtered submissions count
                  rowsPerPage={currentRowsPerPage}
                  page={currentPage}
                  onPageChange={(e, newPage) => handleChangePage(report.schoolName, newPage)}
                  onRowsPerPageChange={(e) => handleChangeRowsPerPage(report.schoolName, e)}
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
      })}
    </Box>
  );
};

export default Reports;