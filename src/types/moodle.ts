
export interface MoodleCredentials {
  url: string;
  token: string;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
  displayname: string;
  summary: string;
  summaryformat: number;
  startdate: number;
  enddate: number;
  progress?: number; // Added progress property as optional
}

export interface MoodleStudent {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  fullname: string;
  email: string;
  department: string;
  firstaccess: number;
  lastaccess: number;
  profileimageurl: string;
}

export interface MoodleGrade {
  id: number;
  itemname: string;
  itemmodule: string;
  iteminstance: number;
  itemtype: string;
  graderaw: number;
  grademax: number;
  grademin: number;
  gradedatesubmitted: number;
  gradedategraded: number;
  feedback: string;
}

export interface MoodleAssignment {
  id: number;
  name: string;
  duedate: number;
  courseId?: number; // For mock data
  description?: string; // For mock data
}
