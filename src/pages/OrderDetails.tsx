import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  CreditCard,
  CheckCircle,
  Truck,
  AlertCircle,
  ArrowLeft,
  Download,
  Share2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { downloadOrderPdf, shareOrderPdf } from "@/lib/orderPdf";

const API_URL = "https://reprice-backend-a5mp.onrender.com/api";

interface OrderDetails {
  id: string;
  order_number: string;
  phone_model: string;
  phone_variant: string;
  phone_condition: string;
  price: number;
  status: string;
  pickup_date: string;
  time_slot: string;
  payment_method: string;
  created_at: string;
  full_address: string;
  city: string;
  state: string;
  pincode: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  agent_name?: string;
  agent_phone?: string;
}

export default function OrderDetails() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [pdfBusy, setPdfBusy] = useState<"download" | "share" | null>(null);

  useEffect(() => {
    fetchOrderDetails();
  }, [orderId]);

  const fetchOrderDetails = async () => {
    try {
      const res = await fetch(`${API_URL}/orders/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setOrder(data.order);
      } else {
        alert("Order not found");
        navigate("/");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      alert("Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in-progress":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-5 h-5" />;
      case "in-progress":
        return <Truck className="w-5 h-5" />;
      case "completed":
        return <CheckCircle className="w-5 h-5" />;
      case "cancelled":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pickup Scheduled";
      case "in-progress":
        return "Pickup on the Way";
      case "completed":
        return "Pickup Completed";
      case "cancelled":
        return "Order Cancelled";
      default:
        return status;
    }
  };

  const handleDownloadPdf = async () => {
    if (!order || pdfBusy) return;
    setPdfBusy("download");
    try {
      await downloadOrderPdf(order);
    } catch (err) {
      console.error("Failed to generate PDF:", err);
      alert("Failed to generate PDF");
    } finally {
      setPdfBusy(null);
    }
  };

  const handleSharePdf = async () => {
    if (!order || pdfBusy) return;
    setPdfBusy("share");
    try {
      await shareOrderPdf(order);
    } catch (err) {
      console.error("Failed to share PDF:", err);
      alert("Failed to share PDF");
    } finally {
      setPdfBusy(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Back Button */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>

          {/* Order Header */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Order Number</p>
                  <h1 className="text-2xl font-bold text-white">
                    {order.order_number || `ORD-${order.id}`}
                  </h1>
                  <p className="text-blue-100 text-sm mt-2">
                    Placed on{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={handleSharePdf}
                    disabled={pdfBusy !== null}
                  >
                    <Share2 size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    onClick={handleDownloadPdf}
                    disabled={pdfBusy !== null}
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="px-6 py-4 border-b">
              <div
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-medium border ${getStatusColor(
                  order.status
                )}`}
              >
                {getStatusIcon(order.status)}
                {getStatusText(order.status)}
              </div>
            </div>

            {/* Progress Timeline */}
            <div className="px-6 py-6">
              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200 rounded-full -z-10"></div>
                <div
                  className="absolute left-0 top-6 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 -z-10"
                  style={{
                    width:
                      order.status === "pending"
                        ? "0%"
                        : order.status === "in-progress"
                        ? "50%"
                        : "100%",
                  }}
                ></div>

                {["Order Placed", "Pickup Started", "Completed"].map(
                  (step, index) => (
                    <div key={index} className="flex flex-col items-center">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
                          (index === 0 && order.status === "pending") ||
                          (index === 1 && order.status === "in-progress") ||
                          (index === 2 && order.status === "completed")
                            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110"
                            : index === 0 ||
                              (index === 1 &&
                                ["in-progress", "completed"].includes(
                                  order.status
                                )) ||
                              (index === 2 && order.status === "completed")
                            ? "bg-green-500 text-white"
                            : "bg-white border-2 border-gray-200 text-gray-400"
                        }`}
                      >
                        {index === 0 ? (
                          <Package size={20} />
                        ) : index === 1 ? (
                          <Truck size={20} />
                        ) : (
                          <CheckCircle size={20} />
                        )}
                      </div>
                      <p className="text-xs mt-2 text-gray-600 text-center">
                        {step}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Device Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Package className="text-blue-600" size={20} />
                Device Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Model:</span>
                  <span className="font-semibold">{order.phone_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Variant:</span>
                  <span className="font-semibold">{order.phone_variant}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Condition:</span>
                  <span className="font-semibold">{order.phone_condition}</span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Estimated Price:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{order.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Pickup Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Calendar className="text-blue-600" size={20} />
                Pickup Schedule
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-600 text-sm">Date</p>
                    <p className="font-semibold">
                      {new Date(order.pickup_date).toLocaleDateString("en-IN", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-600 text-sm">Time Slot</p>
                    <p className="font-semibold">
                      {order.time_slot || "Not specified"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-gray-400 mt-1" size={18} />
                  <div>
                    <p className="text-gray-600 text-sm">Address</p>
                    <p className="font-semibold">
                      {order.full_address}
                      <br />
                      {order.city}, {order.state} - {order.pincode}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <User className="text-blue-600" size={20} />
                Your Details
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <User className="text-gray-400" size={18} />
                  <div>
                    <p className="text-gray-600 text-sm">Name</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="text-gray-400" size={18} />
                  <div>
                    <p className="text-gray-600 text-sm">Phone</p>
                    <p className="font-semibold">{order.customer_phone}</p>
                  </div>
                </div>
                {order.customer_email && (
                  <div className="flex items-center gap-3">
                    <Mail className="text-gray-400" size={18} />
                    <div>
                      <p className="text-gray-600 text-sm">Email</p>
                      <p className="font-semibold">{order.customer_email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Pickup Agent */}
            {(order.agent_name || order.agent_phone) && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Truck className="text-blue-600" size={20} />
                  Pickup Agent
                </h2>
                <div className="space-y-3">
                  {order.agent_name && (
                    <div className="flex items-center gap-3">
                      <User className="text-gray-400" size={18} />
                      <div>
                        <p className="text-gray-600 text-sm">Name</p>
                        <p className="font-semibold">{order.agent_name}</p>
                      </div>
                    </div>
                  )}
                  {order.agent_phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-400" size={18} />
                      <div>
                        <p className="text-gray-600 text-sm">Phone</p>
                        <a
                          href={`tel:${order.agent_phone}`}
                          className="font-semibold text-blue-700 hover:underline"
                        >
                          {order.agent_phone}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <CreditCard className="text-blue-600" size={20} />
                Payment Details
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-semibold uppercase">
                    {order.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-semibold text-yellow-600">
                    {order.status === "completed" ? "Paid" : "Pending"}
                  </span>
                </div>
                <div className="flex justify-between pt-3 border-t">
                  <span className="text-gray-600">Amount:</span>
                  <span className="text-xl font-bold text-green-600">
                    ₹{order.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Help Section */}
          <div className="bg-white rounded-2xl shadow-lg p-6 mt-6">
            <h3 className="font-bold mb-3">Need Help?</h3>
            <p className="text-gray-600 mb-4">
              If you have any questions about your order, our support team is
              here to help.
            </p>
            <div className="flex gap-3">
              <Button variant="outline">Contact Support</Button>
              <Button variant="outline">Cancel Order</Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}