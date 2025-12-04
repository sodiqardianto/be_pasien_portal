// Hospital-specific types
export interface HospitalResponse {
  id: string;
  name: string;
  description: string;
  image?: string | null;
  phone: string;
  address: string;
  latitude: number;
  longitude: number;
  email: string;
  website?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
