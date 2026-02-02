import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

import { API_URL } from "@/api/config";
// hello
interface Order {
  id: number;
  order_number: string;
  phone_model: string;
  price: number;
  status: string;
  created_at: string;
  agent_name?: string;
  agent_phone?: string;
}

export default function MyOrders() {
  const navigate = useNavigate();
  const { token, isLoading } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isLoading || !token) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [token, isLoading]);

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-2xl font-bold mb-6">My Orders</h1>

          {orders.length === 0 ? (
            <div className="bg-white p-6 rounded-xl shadow text-center">
              <p className="text-gray-600 mb-4">
                You haven’t placed any orders yet.
              </p>
              <Button onClick={() => navigate("/")}>
                Sell a Phone
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white p-5 rounded-xl shadow hover:shadow-md transition cursor-pointer"
                  onClick={() => navigate(`/order/${order.id}`)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order #{order.order_number}
                      </p>
                      <p className="font-semibold">
                        {order.phone_model}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.created_at).toLocaleDateString("en-IN")}
                      </p>

                      {order.agent_phone && (
                        <div className="mt-2 text-sm text-gray-600">
                          <span className="text-gray-500">Pickup Agent:</span>{" "}
                          {order.agent_name ? (
                            <span className="font-medium">{order.agent_name} · </span>
                          ) : null}
                          <a
                            href={`tel:${order.agent_phone}`}
                            className="font-semibold text-blue-700 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {order.agent_phone}
                          </a>
                        </div>
                      )}
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-green-600">
                        ₹{order.price.toLocaleString()}
                      </p>
                      <p className="text-sm capitalize text-gray-600">
                        {order.status}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
