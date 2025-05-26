
import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Search, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface Teacher {
  id: string;
  email: string;
  full_name: string;
  accessible_schools: string[] | null;
}

export default function TeacherSchoolAccess() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [newSchool, setNewSchool] = useState("");
  const [accessibleSchools, setAccessibleSchools] = useState<string[]>([]);
  
  // Fetch teachers on component mount
  useEffect(() => {
    async function fetchTeachers() {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('profiles')
          .select('id, email, full_name, accessible_schools')
          .eq('role', 'teacher');
          
        if (error) throw error;
        
        setTeachers(data || []);
        setFilteredTeachers(data || []);
      } catch (error) {
        console.error('Error fetching teachers:', error);
        toast({
          variant: "destructive",
          title: "Failed to load teachers",
          description: error instanceof Error ? error.message : "Unknown error occurred",
        });
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchTeachers();
  }, [toast]);
  
  // Filter teachers based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTeachers(teachers);
      return;
    }
    
    const filtered = teachers.filter(teacher => 
      teacher.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      teacher.email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    setFilteredTeachers(filtered);
  }, [searchQuery, teachers]);
  
  const selectTeacher = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setAccessibleSchools(teacher.accessible_schools || []);
    setNewSchool(""); // Clear the new school input when selecting a teacher
  };
  
  const addSchool = () => {
    const trimmedSchoolName = newSchool.trim();
    
    if (!trimmedSchoolName) {
      toast({
        variant: "destructive",
        title: "School name required",
        description: "Please enter a school name to add",
      });
      return;
    }
    
    if (accessibleSchools.includes(trimmedSchoolName)) {
      toast({
        variant: "destructive",
        title: "School already added",
        description: `${trimmedSchoolName} is already in the list of accessible schools`,
      });
      return;
    }
    
    setAccessibleSchools([...accessibleSchools, trimmedSchoolName]);
    setNewSchool("");
    
    toast({
      title: "School added",
      description: `${trimmedSchoolName} has been added to the list. Don't forget to save changes.`,
    });
  };
  
  const removeSchool = (school: string) => {
    setAccessibleSchools(accessibleSchools.filter(s => s !== school));
    
    toast({
      title: "School removed",
      description: `${school} has been removed from the list. Don't forget to save changes.`,
    });
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSchool();
    }
  };
  
  const saveChanges = async () => {
    if (!selectedTeacher) return;
    
    try {
      setIsSaving(true);
      const { error } = await supabase
        .from('profiles')
        .update({ accessible_schools: accessibleSchools })
        .eq('id', selectedTeacher.id);
      
      if (error) throw error;
      
      // Update the teachers list with new accessible_schools
      setTeachers(teachers.map(teacher => 
        teacher.id === selectedTeacher.id 
          ? { ...teacher, accessible_schools: accessibleSchools } 
          : teacher
      ));
      
      // Update the selected teacher as well
      setSelectedTeacher({ ...selectedTeacher, accessible_schools: accessibleSchools });
      
      toast({
        title: "Changes saved",
        description: `Updated accessible schools for ${selectedTeacher.full_name}`,
      });
    } catch (error) {
      console.error('Error updating teacher:', error);
      toast({
        variant: "destructive",
        title: "Failed to save changes",
        description: error instanceof Error ? error.message : "Unknown error occurred",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Teacher School Access</h1>
          <p className="text-muted-foreground mt-2">Manage which schools teachers can access</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Select Teacher</CardTitle>
              <CardDescription>Choose a teacher to manage their school access</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search teachers..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                
                <div className="border rounded-md max-h-[500px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2">Loading teachers...</span>
                    </div>
                  ) : filteredTeachers.length === 0 ? (
                    <div className="p-4 text-center text-muted-foreground">
                      No teachers found
                    </div>
                  ) : (
                    <Table>
                      <TableBody>
                        {filteredTeachers.map((teacher) => (
                          <TableRow 
                            key={teacher.id}
                            className={`cursor-pointer ${selectedTeacher?.id === teacher.id ? 'bg-muted' : ''}`}
                            onClick={() => selectTeacher(teacher)}
                          >
                            <TableCell className="py-2">
                              <div className="font-medium">{teacher.full_name || 'Unnamed'}</div>
                              <div className="text-sm text-muted-foreground">{teacher.email}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {teacher.accessible_schools?.length || 0} schools
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                {selectedTeacher ? `Manage Schools for ${selectedTeacher.full_name || selectedTeacher.email}` : "Select a Teacher"}
              </CardTitle>
              <CardDescription>
                {selectedTeacher 
                  ? "Add or remove schools this teacher can access" 
                  : "Please select a teacher from the list on the left"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTeacher ? (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <Label htmlFor="add-school">Add New School</Label>
                    <div className="flex gap-2">
                      <Input
                        id="add-school"
                        placeholder="Enter school name"
                        value={newSchool}
                        onChange={(e) => setNewSchool(e.target.value)}
                        onKeyPress={handleKeyPress}
                      />
                      <Button onClick={addSchool} className="shrink-0">
                        <Plus className="h-4 w-4 mr-2" />
                        Add
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-2">Current Accessible Schools ({accessibleSchools.length})</h3>
                    {accessibleSchools.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No schools added yet</p>
                    ) : (
                      <div className="border rounded-md overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>School Name</TableHead>
                              <TableHead className="w-[100px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {accessibleSchools.map((school, index) => (
                              <TableRow key={index}>
                                <TableCell>{school}</TableCell>
                                <TableCell>
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => removeSchool(school)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button onClick={saveChanges} disabled={isSaving}>
                      {isSaving ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4 mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Search className="h-10 w-10 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium">No teacher selected</h3>
                  <p className="text-muted-foreground">
                    Select a teacher from the list to manage their school access
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
