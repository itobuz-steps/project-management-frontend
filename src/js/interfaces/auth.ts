export interface SignupPayload {
  name: string;
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  profileImage?: string;
  onlineStatus?: string;
}

export interface ProjectMembers {
  result: User[];
  message?: string;
  success: boolean;
  // profileImage: string;
  // name: string;
  // onlineStatus: 'online' | 'offline';
}
