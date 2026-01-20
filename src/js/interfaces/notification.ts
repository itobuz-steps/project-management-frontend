export interface Notification {
  _id: string;
  userId: string;
  taskId?: string;
  projectId?: string;
  title: string;
  message: string;
  profileImage?: string | null;
  unread: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface NotificationResponse {
  success: boolean;
  result: Notification[];
  pagination: Pagination;
}

export interface GetNotificationParams {
  page: number;
  limit: number;
}
