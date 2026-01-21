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
}
