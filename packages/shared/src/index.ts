export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;

  auth_provider: "EMAL" | "GOOGLE" | "FACEBOOK";
  auth_id: string;
  email_verified: boolean;

  createdAt: Date;
  updatedAt: Date;
}
