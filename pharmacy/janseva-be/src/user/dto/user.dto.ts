export class UserProfileDto {
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  phone: string;
  profileImageUrl?: string;
}

export class OrderDto {
  id: string;
  orderId: string;
  date: string;
  status: string;
  orderTotal: number;
}

export class UserDto {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  isVerified: boolean;
  role: string;
  createdAt: string;
  updatedAt: string;

  profile?: UserProfileDto;

  orders?: OrderDto[];

  orderSummary?: {
    totalOrders: number;
    totalSpent: number;
    lastOrderDate?: string;
  };
}