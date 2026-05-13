export interface Worker {
  _id?: string;

  userId: {
    _id?: string;
    userName: string;
    email: string;
    phone?: string;
  };

  role: 'Delivery';

  salary: number;

  shift: 'Morning' | 'Evening';

  status: 'Active' | 'On Leave' | 'Terminated';

  rating?: number;

  hireDate?: Date;

  deliveryDetails?: {
    vehicleType?: 'Motorcycle' | 'Bicycle';
    plateNumber?: string;
    isOnline?: boolean;
  };
}
