export interface User {
  id: string;
  name?: string;
  email?: string;
  phone?: string | null;
  is_active?: boolean;
  created_at?: string;
  role: string[];
  first_name?: string;
  last_name?: string;

  [key: string]: unknown;
}
