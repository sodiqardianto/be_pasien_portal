import { Role } from '@prisma/client';

// Auth-specific types
export interface UserResponse {
  id: string;
  email: string;
  name: string;
  dob?: string | null;
  phoneNumber?: string | null;
  role: Role;
  createdAt: Date;
}
