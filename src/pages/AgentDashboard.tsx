import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import {
  Package,
  Clock,
  CheckCircle,
  MapPin,
  IndianRupee,
  Calendar,
  Smartphone,
  TrendingUp,
  Users,
  Eye,
} from "lucide-react";

interface Order {
  id: string;
  phone_model: string;
  phone_variant: string;
  phone_condition: string;
  price: number;
  status: "pending" | "in-progress" | "completed";
  pickup_date: string;
  customer_name: string;
  full_address: string;
  distance_km?: number;
  latitude: number;
  longitude: number;
  time_slot: string;
}

export default function AgentDashboard() {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useAuth();

  const [view, setView] = useState<"nearby" | "my">("nearby");
  const [orders, setOrders] = useState<Order[]>([]);
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  /* ======================
     UPDATE AGENT LOCATION
  ====================== */
  useEffect(() => {
    if (!isLoggedIn || user?.role !== "agent") return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await fetch(
            `${import.meta.env.VITE_API_URL}/agent/update-location`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${localStorage.getItem("token")}`,
              },
              body: JSON.stringify({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              }),
            }
          );
        } catch (err) {
          console.error("Failed to update agent location", err);
        }
      },
      (err) => console.warn("Location error:", err.message)
    );
  }, [isLoggedIn, user]);

  /* ======================
     FETCH ORDERS
  ====================== */
  const fetchOrders = async () => {
    try {
      const endpoint =
        view === "nearby" ? "/agent/nearby-orders" : "/agent/my-pickups";

      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
    }
  };

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "agent") {
      navigate("/agent/login");
      return;
    }
    fetchOrders();
  }, [view, isLoggedIn, user]);

  /* ======================
     START PICKUP
  ====================== */
  const startPickup = async (orderId: string) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/assign`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();
      if (data.success) {
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        alert(data.message || "Order already taken");
      }
    } catch (err) {
      console.error("Start pickup failed", err);
    }
  };

  /* ======================
     COMPLETE PICKUP
  ====================== */
  const completePickup = async (orderId: string) => {
    try {
      await fetch(
        `${import.meta.env.VITE_API_URL}/orders/${orderId}/complete`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, status: "completed" } : o
        )
      );
    } catch (err) {
      console.error("Complete pickup failed", err);
    }
  };

  /* ======================
     STATS
  ====================== */
  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    completed: orders.filter((o) => o.status === "completed").length,
    earnings:
      view === "my"
        ? orders
            .filter((o) => o.status === "completed")
            .reduce((sum, o) => sum + o.price * 0.05, 0)
        : 0,
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Welcome */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold">
              Welcome back,{" "}
              <span className="text-blue-600">{user?.name}</span>
            </h1>
            <p className="text-gray-500 mt-1">
              Here's what's happening with your pickups.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-3 mb-6">
            <Button
              variant={view === "nearby" ? "default" : "outline"}
              onClick={() => setView("nearby")}
            >
              Nearby Orders
            </Button>
            <Button
              variant={view === "my" ? "default" : "outline"}
              onClick={() => setView("my")}
            >
              My Pickups
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              { label: "Total Orders", value: stats.total, icon: Package },
              { label: "Pending", value: stats.pending, icon: Clock },
              { label: "Completed", value: stats.completed, icon: CheckCircle },
              {
                label: "Earnings",
                value: `₹${stats.earnings}`,
                icon: IndianRupee,
              },
            ].map((s, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow">
                <s.icon size={24} />
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Orders */}
          {orders.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl text-center shadow">
              <Package size={40} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold">No orders</h3>
              <p className="text-gray-500">Orders will appear here.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="bg-white p-6 rounded-2xl shadow mb-4"
              >
                <div className="flex justify-between">
                  <div>
                    <h3 className="font-semibold">{order.phone_model}</h3>
                    <p className="text-sm text-gray-500">
                      {order.phone_variant} • {order.phone_condition}
                    </p>

                    <p className="text-sm mt-2">
                      <Users size={14} className="inline mr-1" />
                      {order.customer_name}
                      <br />
                      <MapPin size={14} className="inline mr-1" />
                      {order.full_address}
                      {order.distance_km && (
                        <span className="ml-2 text-blue-600">
                          • {order.distance_km.toFixed(1)} km
                        </span>
                      )}
                      <br />
                      <Calendar size={14} className="inline mr-1" />
                      {new Date(order.pickup_date).toDateString()}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold">
                      ₹{order.price.toLocaleString()}
                    </p>

                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      onClick={() => setPreviewOrder(order)}
                    >
                      <Eye size={16} />
                    </Button>

                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        onClick={() => startPickup(order.id)}
                      >
                        Start Pickup
                      </Button>
                    )}

                    {order.status === "in-progress" && (
                      <Button
                        size="sm"
                        onClick={() => completePickup(order.id)}
                      >
                        Complete
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* PREVIEW MODAL */}
        {previewOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative">
              <button
                onClick={() => setPreviewOrder(null)}
                className="absolute top-3 right-3 text-gray-500"
              >
                ✕
              </button>

              <h2 className="text-xl font-bold mb-4">Order Preview</h2>

              <div className="space-y-2 text-sm">
                <p>
                  <b>Customer:</b> {previewOrder.customer_name}
                </p>
                <p>
                  <b>Address:</b> {previewOrder.full_address}
                </p>
                <p>
                  <b>Phone:</b> {previewOrder.phone_model} (
                  {previewOrder.phone_variant},{" "}
                  {previewOrder.phone_condition})
                </p>
                <p>
                  <b>Pickup Date:</b>{" "}
                  {new Date(previewOrder.pickup_date).toDateString()}
                </p>
                <p><b>Time Slot:</b> {previewOrder.time_slot}</p>
                <p>
                  <b>Price:</b> ₹{previewOrder.price.toLocaleString()}
                </p>
                <p>
                  <b>Status:</b> {previewOrder.status}
                </p>
              </div>

              <Button
                className="mt-4 w-full"
                onClick={() =>
                  window.open(
                    `https://www.google.com/maps/dir/?api=1&destination=${previewOrder.latitude},${previewOrder.longitude}`,
                    "_blank"
                  )
                }
              >
                🧭 Navigate to Customer
              </Button>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
