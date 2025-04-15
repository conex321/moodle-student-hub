import axios from 'axios';
import { MoodleCourse, MoodleAssignment } from '@/types/moodle';

const MOODLE_URL_KEY = 'moodle_url';
const MOODLE_TOKEN_KEY = 'moodle_token';

// Add this mock data for the test environment
const MOCK_COURSES = [
  {
    id: 101,
    fullname: "Introduction to Mathematics",
    shortname: "MATH101",
    summary: "Fundamental concepts of mathematics including algebra, calculus, and geometry.",
    startdate: Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60, // 30 days ago
    enddate: Math.floor(Date.now() / 1000) + 60 * 24 * 60 * 60,   // 60 days in future
    progress: 65
  },
  {
    id: 102,
    fullname: "English Literature",
    shortname: "ENG201",
    summary: "Analysis of classic and contemporary literary works.",
    startdate: Math.floor(Date.now() / 1000) - 15 * 24 * 60 * 60, // 15 days ago
    enddate: Math.floor(Date.now() / 1000) + 75 * 24 * 60 * 60,   // 75 days in future
    progress: 42
  },
  {
    id: 103,
    fullname: "Introduction to Biology",
    shortname: "BIO101",
    summary: "Study of living organisms and their interactions with ecosystems.",
    startdate: Math.floor(Date.now() / 1000) - 5 * 24 * 60 * 60,  // 5 days ago
    enddate: Math.floor(Date.now() / 1000) + 85 * 24 * 60 * 60,   // 85 days in future
    progress: 23
  },
  {
    id: 104,
    fullname: "World History",
    shortname: "HIST101",
    summary: "Overview of major historical events and civilizations.",
    startdate: Math.floor(Date.now() / 1000) - 10 * 24 * 60 * 60, // 10 days ago
    enddate: Math.floor(Date.now() / 1000) + 80 * 24 * 60 * 60,   // 80 days in future
    progress: 18
  },
  {
    id: 105,
    fullname: "Introduction to Computer Science",
    shortname: "CS101",
    summary: "Basics of programming, algorithms, and computer systems.",
    startdate: Math.floor(Date.now() / 1000) - 2 * 24 * 60 * 60,  // 2 days ago
    enddate: Math.floor(Date.now() / 1000) + 88 * 24 * 60 * 60,   // 88 days in future
    progress: 5
  }
];

const MOCK_ASSIGNMENTS = [
  {
    id: 201,
    name: "Math Homework 1",
    duedate: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60, // 7 days from now
    courseId: 101,
    description: "Complete problems 1-20 in Chapter 3"
  },
  {
    id: 202,
    name: "English Essay",
    duedate: Math.floor(Date.now() / 1000) + 3 * 24 * 60 * 60, // 3 days from now
    courseId: 102,
    description: "Write a 5-page analysis of Shakespeare's Hamlet"
  },
  {
    id: 203,
    name: "Biology Lab Report",
    duedate: Math.floor(Date.now() / 1000) + 5 * 24 * 60 * 60, // 5 days from now
    courseId: 103,
    description: "Document your findings from the ecosystem observation"
  },
  {
    id: 204,
    name: "History Research Paper",
    duedate: Math.floor(Date.now() / 1000) + 14 * 24 * 60 * 60, // 14 days from now
    courseId: 104,
    description: "Research and write about a significant historical event"
  }
];

interface CoreCourseGetCoursesParams {
  options?: {
    ids?: number[];
  };
}

class MoodleApiService {
  private moodleUrl: string | null = null;
  private moodleToken: string | null = null;

  constructor() {
    this.moodleUrl = localStorage.getItem(MOODLE_URL_KEY);
    this.moodleToken = localStorage.getItem(MOODLE_TOKEN_KEY);
  }

  hasCredentials(): boolean {
    return !!(this.moodleUrl && this.moodleToken);
  }

  setCredentials(url: string, token: string): void {
    this.moodleUrl = url;
    this.moodleToken = token;
    localStorage.setItem(MOODLE_URL_KEY, url);
    localStorage.setItem(MOODLE_TOKEN_KEY, token);
  }

  async coreCourseGetCourses(params?: CoreCourseGetCoursesParams): Promise<MoodleCourse[]> {
    if (!this.moodleUrl || !this.moodleToken) {
      throw new Error('Moodle URL and token are not set.');
    }

    const url = `${this.moodleUrl}/webservice/rest/server.php`;
    const data = new URLSearchParams({
      wstoken: this.moodleToken,
      wsfunction: 'core_course_get_courses',
      moodlewsrestformat: 'json',
      ...params?.options?.ids && { 'options[ids]': params.options.ids.join(',') }
    });

    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  }

  async modAssignGetAssignments(courseIds: number[] = []): Promise<{ courses: { assignments: MoodleAssignment[] }[] }> {
     if (!this.moodleUrl || !this.moodleToken) {
      throw new Error('Moodle URL and token are not set.');
    }

    const url = `${this.moodleUrl}/webservice/rest/server.php`;
    const data = new URLSearchParams({
      wstoken: this.moodleToken,
      wsfunction: 'mod_assign_get_assignments',
      moodlewsrestformat: 'json',
    });

    courseIds.forEach((courseId, index) => {
      data.append(`courseids[${index}]`, courseId.toString());
    });

    try {
      const response = await axios.post(url, data);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching assignments:', error);
      throw error;
    }
  }

  isTestEnvironment() {
    const user = localStorage.getItem('moodle_hub_user');
    if (user) {
      const userData = JSON.parse(user);
      return userData.email === 'teacher@test.com' || userData.email === 'student@test.com';
    }
    return false;
  }

  async getCourses() {
    if (this.isTestEnvironment()) {
      return Promise.resolve(MOCK_COURSES);
    }
    
    try {
      const courses = await this.coreCourseGetCourses();
      return courses;
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  async getAssignments(courseId?: number) {
    if (this.isTestEnvironment()) {
      if (courseId) {
        return Promise.resolve(MOCK_ASSIGNMENTS.filter(a => a.courseId === courseId));
      }
      return Promise.resolve(MOCK_ASSIGNMENTS);
    }
    
    try {
      let courseIds: number[] = [];
      if (courseId) {
        courseIds = [courseId];
      } else {
        const courses = await this.getCourses();
        courseIds = courses.map(course => course.id);
      }
      const assignmentsData = await this.modAssignGetAssignments(courseIds);
      
      let assignments: MoodleAssignment[] = [];
      assignmentsData.courses.forEach(course => {
        if (course.assignments) {
          assignments = assignments.concat(course.assignments);
        }
      });
      
      return assignments;
    } catch (error) {
      console.error('Error fetching assignments:', error);
      return [];
    }
  }
}

export const moodleApi = new MoodleApiService();
