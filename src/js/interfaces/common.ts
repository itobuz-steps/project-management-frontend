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
  members?: unknown[];
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

  projectId:
    | {
        _id: string;
        name?: string;
      }
    | string;

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
  assignee?: string | null;
  subTask?: string[];

  tags: string[];

  attachments?: FileList | File[];

  createdAt?: string;
  updatedAt?: string;
}

export interface ProjectMember {
  _id: string;
  name: string;
  profileImage?: string;
  onlineStatus: OnlineStatus;
  email: string;
}

export type OnlineStatus = 'online' | 'offline';

export interface ApiResponse<T> {
  result: T;
}
