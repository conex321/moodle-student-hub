
import { useEffect, useState } from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { MoodleStudent } from "@/types/moodle";
import { moodleApi } from "@/services/moodleApi";
import { Search, User } from "lucide-react";

export default function TeacherStudents() {
  const [students, setStudents] = useState<MoodleStudent[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<MoodleStudent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const fetchedStudents = await moodleApi.getAllStudents();
        setStudents(fetchedStudents);
        setFilteredStudents(fetchedStudents);
      } catch (error) {
        console.error('Error fetching students:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredStudents(students);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = students.filter(
      (student) =>
        student.fullname.toLowerCase().includes(query) ||
        student.email.toLowerCase().includes(query) ||
        (student.department && student.department.toLowerCase().includes(query))
    );

    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  const formatDate = (timestamp: number) => {
    if (!timestamp) return "Never";
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  return (
    <MainLayout requiredRole="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Students</h1>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <Input
              placeholder="Search students..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Student Directory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
              </div>
            ) : filteredStudents.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>First Access</TableHead>
                      <TableHead>Last Access</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-teal-light flex items-center justify-center">
                              {student.profileimageurl ? (
                                <img 
                                  src={student.profileimageurl} 
                                  alt={student.fullname} 
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              ) : (
                                <User className="w-4 h-4 text-white" />
                              )}
                            </div>
                            {student.fullname}
                          </div>
                        </TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.department || "—"}</TableCell>
                        <TableCell>{formatDate(student.firstaccess)}</TableCell>
                        <TableCell>{formatDate(student.lastaccess)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 text-gray-500">
                No students found.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
