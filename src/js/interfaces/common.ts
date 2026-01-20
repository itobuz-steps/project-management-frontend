export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  name: string;
  projectType: string;
  columns: string[];
}

export interface Sprint {
  projectId: string;
  storyPoint: number;
}

export interface Task {
  _id: string;
  projectId: string;
  title: string;
  storyPoint: number;
  description: string;
  type: string;
  key: string;
  status: string;
  priority: string;
  dueDate: string;
  reporter: string;

  parentTask?: string;
  assignee?: string;

  tags: string[];

  attachments?: FileList | File[];
}

export interface ProjectMember {
  _id: string;
  email: string;
}
