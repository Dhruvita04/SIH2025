import { useNavigate } from 'react-router-dom';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';

interface Order {
  id: string;
  orderNumber: number;
  date: string;
  status: string;
  orderTotal: number;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

interface OrdersTableProps {
  orders: Order[];
}

const statusColors = {
  PLACED: "bg-yellow-100 text-yellow-800",
  SHIPPED: "bg-blue-100 text-blue-800",
  IN_TRANSIT: "bg-purple-100 text-purple-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-red-100 text-red-800",
  RETURNED: "bg-orange-100 text-orange-800",
  REFUNDED: "bg-gray-100 text-gray-800",
};

export function OrdersTable({ orders }: OrdersTableProps) {
  const navigate = useNavigate();

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Order #</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Customer</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            console.log(order),
            <TableRow key={order.id}>
              <TableCell>#{order.orderNumber}</TableCell>
              <TableCell>{typeof order.createdAt === 'string' ? format(new Date(order.createdAt), 'dd MMM yyyy') : 'N/A'}</TableCell>
              <TableCell>
                <div>
                  <div className="font-medium">{order.user.name}</div>
                  <div className="text-sm text-gray-500">{order.user.email}</div>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={statusColors[order.status as keyof typeof statusColors]}>
                  {order.status}
                </Badge>
              </TableCell>
              <TableCell>₹{order.orderTotal.toFixed(2)}</TableCell>
              <TableCell>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigate(`/admin/orders/view/${order.id}`)
                  }}
                >
                  View Details
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 