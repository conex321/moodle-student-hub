
import { MoodleCredentials, MoodleCourse, MoodleStudent, MoodleGrade } from '@/types/moodle';

class MoodleApi {
  private credentials: MoodleCredentials | null = null;

  constructor() {
    const storedCreds = localStorage.getItem('moodle_credentials');
    if (storedCreds) {
      this.credentials = JSON.parse(storedCreds);
    }
  }

  setCredentials(credentials: MoodleCredentials): void {
    this.credentials = credentials;
    localStorage.setItem('moodle_credentials', JSON.stringify(credentials));
  }
  
  hasCredentials(): boolean {
    return !!this.credentials;
  }

  private async makeRequest<T>(wsfunction: string, params: Record<string, any> = {}): Promise<T> {
    if (!this.credentials) {
      throw new Error('Moodle credentials not set');
    }

    const { url, token } = this.credentials;
    const baseUrl = url.endsWith('/') ? url : `${url}/`;
    const endpoint = `${baseUrl}webservice/rest/server.php`;

    const formData = new FormData();
    formData.append('wstoken', token);
    formData.append('wsfunction', wsfunction);
    formData.append('moodlewsrestformat', 'json');

    // Add any additional parameters
    Object.entries(params).forEach(([key, value]) => {
      formData.append(key, String(value));
    });

    const response = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Moodle API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check if Moodle returned an error
    if (data.exception) {
      throw new Error(`Moodle API error: ${data.message}`);
    }

    return data as T;
  }

  // Get courses the current user can access
  async getCourses(): Promise<MoodleCourse[]> {
    return this.makeRequest<MoodleCourse[]>('core_course_get_courses');
  }

  // Get students enrolled in a specific course
  async getCourseStudents(courseId: number): Promise<MoodleStudent[]> {
    return this.makeRequest<MoodleStudent[]>('core_enrol_get_enrolled_users', {
      courseid: courseId,
    });
  }

  // Get grades for a student in a course
  async getStudentCourseGrades(courseId: number, studentId: number): Promise<MoodleGrade[]> {
    return this.makeRequest<MoodleGrade[]>('gradereport_user_get_grade_items', {
      courseid: courseId,
      userid: studentId,
    });
  }

  // Get all students (simplified version based on the Moodle Export Github repository)
  async getAllStudents(): Promise<MoodleStudent[]> {
    try {
      // First get all courses
      const courses = await this.getCourses();
      
      // Then get all students from each course
      const allStudentsPromises = courses.map(course => 
        this.getCourseStudents(course.id)
      );
      
      const studentsPerCourse = await Promise.all(allStudentsPromises);
      
      // Flatten and deduplicate by student ID
      const uniqueStudents = new Map<number, MoodleStudent>();
      
      studentsPerCourse.flat().forEach(student => {
        uniqueStudents.set(student.id, student);
      });
      
      return Array.from(uniqueStudents.values());
    } catch (error) {
      console.error('Error fetching students:', error);
      throw error;
    }
  }

  // Get student details
  async getStudentDetails(studentId: number): Promise<MoodleStudent> {
    return this.makeRequest<MoodleStudent>('core_user_get_users_by_field', {
      field: 'id',
      values: [studentId],
    });
  }
}

export const moodleApi = new MoodleApi();
