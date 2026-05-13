export interface Complaints {
  _id: string;

  id: number;

  name: string;

  email: string;

  subject: string;

  service: string;

  message: string;

  status: 'pending' | 'in process' | 'resolved' | 'rejected';

  adminResponse?: string;

  createdAt: string;
}
