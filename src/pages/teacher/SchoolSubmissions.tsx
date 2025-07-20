import React, { useState, ChangeEvent } from 'react';
import { debounce } from 'lodash';
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
  TextField,
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

interface SchoolSubmissionsProps {
  report: Report;
  onBack: () => void;
  onRefresh: () => void;
}

export default function SchoolSubmissions({ report, onBack, onRefresh }: SchoolSubmissionsProps) {
  const [page, setPage] = useState<PageState>({ [report.schoolName]: 0 });
  const [rowsPerPage, setRowsPerPage] = useState<RowsPerPageState>({ [report.schoolName]: 5 });
  const [filter, setFilter] = useState<FilterState>({ [report.schoolName]: { submissionName: '', courseId: '' } });
  const [dateFilter, setDateFilter] = useState<DateFilterState>({ [report.schoolName]: {} });

  const debouncedHandleFilterChange = debounce((schoolName: string, field: 'submissionName' | 'courseId', value: string) => {
    setFilter((prev) => ({
      ...prev,
      [schoolName]: { ...prev[schoolName], [field]: value }
    }));
    setPage((prev) => ({ ...prev, [schoolName]: 0 }));
  }, 300);

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
    <Box m={2}>
      <Typography variant="h4" gutterBottom>
        Grade Management - Submissions Reports
      </Typography>
      <Button
        variant="outlined"
        color="primary"
        onClick={onBack}
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
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
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
        </Box>
        
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
        onClick={onRefresh}
        sx={{ mt: 2 }}
      >
        Refresh Report
      </Button>
    </Box>
  );
}