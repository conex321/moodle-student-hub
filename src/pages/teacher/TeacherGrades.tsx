
import React, { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { useQuery } from "@tanstack/react-query";
import { moodleApi } from "@/services/moodleApi";
import { 
  Table, 
  TableHeader, 
  TableBody, 
  TableRow, 
  TableHead, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import { Search, PlusCircle, Save, X } from "lucide-react";

interface Grade {
  id: string;
  studentId: number;
  studentName: string;
  courseId: number;
  courseName: string;
  assignment: string;
  grade: number;
  maxGrade: number;
  submitted: string;
  feedback?: string;
}

interface EditableGrade extends Grade {
  isEditing: boolean;
  newGrade: number;
  newFeedback: string;
}

export default function TeacherGrades() {
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [grades, setGrades] = useState<EditableGrade[]>([]);

  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['courses'],
    queryFn: moodleApi.getCourses.bind(moodleApi),
  });

  // Fetch grades - in a real app, this would come from the Moodle API
  useEffect(() => {
    // Mock data for demonstration
    const mockGrades: Grade[] = [
      {
        id: '1',
        studentId: 301,
        studentName: 'John Doe',
        courseId: 101,
        courseName: 'Introduction to Mathematics',
        assignment: 'Math Homework 1',
        grade: 85,
        maxGrade: 100,
        submitted: '2023-05-10T15:30:00',
        feedback: 'Good work on the algebra section.'
      },
      {
        id: '2',
        studentId: 302,
        studentName: 'Jane Smith',
        courseId: 101,
        courseName: 'Introduction to Mathematics',
        assignment: 'Math Homework 1',
        grade: 92,
        maxGrade: 100,
        submitted: '2023-05-09T14:15:00',
        feedback: 'Excellent work overall.'
      },
      {
        id: '3',
        studentId: 303,
        studentName: 'Bob Johnson',
        courseId: 102,
        courseName: 'English Literature',
        assignment: 'English Essay',
        grade: 78,
        maxGrade: 100,
        submitted: '2023-05-11T09:45:00',
        feedback: 'Your essay needs more supporting evidence.'
      },
      {
        id: '4',
        studentId: 301,
        studentName: 'John Doe',
        courseId: 103,
        courseName: 'Introduction to Biology',
        assignment: 'Biology Lab Report',
        grade: 88,
        maxGrade: 100,
        submitted: '2023-05-08T16:20:00',
        feedback: 'Good observations, but work on your conclusions.'
      },
      {
        id: '5',
        studentId: 304,
        studentName: 'Alice Williams',
        courseId: 102,
        courseName: 'English Literature',
        assignment: 'English Essay',
        grade: 95,
        maxGrade: 100,
        submitted: '2023-05-10T11:30:00',
        feedback: 'Outstanding analysis and writing style.'
      }
    ];

    setGrades(mockGrades.map(grade => ({
      ...grade,
      isEditing: false,
      newGrade: grade.grade,
      newFeedback: grade.feedback || ''
    })));
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleCourseChange = (value: string) => {
    setSelectedCourse(value);
  };

  const toggleEditMode = (id: string) => {
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.id === id 
          ? { ...grade, isEditing: !grade.isEditing, newGrade: grade.grade, newFeedback: grade.feedback || '' }
          : grade
      )
    );
  };

  const handleGradeChange = (id: string, value: string) => {
    const numValue = Number(value);
    if (isNaN(numValue)) return;
    
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.id === id ? { ...grade, newGrade: numValue } : grade
      )
    );
  };

  const handleFeedbackChange = (id: string, value: string) => {
    setGrades(prevGrades => 
      prevGrades.map(grade => 
        grade.id === id ? { ...grade, newFeedback: value } : grade
      )
    );
  };

  const saveGrade = (id: string) => {
    setGrades(prevGrades => 
      prevGrades.map(grade => {
        if (grade.id === id) {
          return {
            ...grade,
            grade: grade.newGrade,
            feedback: grade.newFeedback,
            isEditing: false
          };
        }
        return grade;
      })
    );
    
    toast({
      title: "Grade Updated",
      description: "The student's grade has been successfully updated.",
    });
  };

  const filteredGrades = grades.filter(grade => {
    const matchesCourse = selectedCourse === 'all' || grade.courseId.toString() === selectedCourse;
    const matchesSearch = 
      grade.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      grade.assignment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCourse && matchesSearch;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <MainLayout requiredRole="teacher">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Grade Management</h1>
          <Button className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add New Grade
          </Button>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:items-center">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Search students or assignments..."
              className="pl-9"
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>

          <Select value={selectedCourse} onValueChange={handleCourseChange}>
            <SelectTrigger className="w-full md:w-1/3">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Courses</SelectItem>
              {courses?.map(course => (
                <SelectItem key={course.id} value={course.id.toString()}>
                  {course.fullname}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {filteredGrades.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>Assignment</TableHead>
                  <TableHead>Submission Date</TableHead>
                  <TableHead>Grade</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.studentName}</TableCell>
                    <TableCell>{grade.courseName}</TableCell>
                    <TableCell>{grade.assignment}</TableCell>
                    <TableCell>{formatDate(grade.submitted)}</TableCell>
                    <TableCell>
                      {grade.isEditing ? (
                        <Input 
                          type="number"
                          min="0"
                          max={grade.maxGrade}
                          value={grade.newGrade}
                          onChange={(e) => handleGradeChange(grade.id, e.target.value)}
                          className="w-20"
                        />
                      ) : (
                        <span>{grade.grade}/{grade.maxGrade}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {grade.isEditing ? (
                        <Input 
                          type="text"
                          value={grade.newFeedback}
                          onChange={(e) => handleFeedbackChange(grade.id, e.target.value)}
                          className="w-full"
                        />
                      ) : (
                        <span>{grade.feedback}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {grade.isEditing ? (
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => toggleEditMode(grade.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => saveGrade(grade.id)}
                          >
                            <Save className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => toggleEditMode(grade.id)}
                        >
                          Edit
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center p-10 border rounded-md">
            <p className="text-gray-500">
              {searchTerm || selectedCourse !== 'all' 
                ? "No grades match your search criteria." 
                : "No grades available."}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
