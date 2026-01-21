export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface Project {
  _id?: string;
  name: string;
  projectType: string;
  columns: string[];
  currentSprint?: string | null;
}

export interface Sprint {
  _id?: string;
  projectId?: string;
  storyPoint?: number;
  key?: string;
  tasks: string[];
  isCompleted: boolean;
  dueDate: string;
}

export interface CreateSprint {
  projectId: string;
  storyPoint: number;
}

export interface AddTasks {
  tasks: string[];
}

export interface Task {
  _id?: string;
  projectId: string;
  title: string;
  storyPoint: number;
  description: string;
  type: string;
  key?: string;
  status: string;
  priority: string;
  dueDate: string;
  reporter?: string;

  parentTask?: string;
  assignee?: string;
  subTask?: string[];

  tags: string[];

  attachments?: FileList | File[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  _id: string;
  email: string;
}

export interface ApiResponse<T> {
  result: T;
}
