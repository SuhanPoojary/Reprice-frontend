import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Check,
  ArrowLeft,
  CheckCircle,
  MapPin,
  CreditCard,
  Package,
  Sparkles,
  Shield,
  Clock,
} from "lucide-react";

import { useAuth } from "@/context/AuthContext"; 

import { API_URL } from "@/api/config";

// Location is optional; serviceability is determined by PIN code.



export default function Checkout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, isLoggedIn, logout } = useAuth(); 
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingServiceability, setIsCheckingServiceability] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitErrorTitle, setSubmitErrorTitle] = useState<string | null>(null);

  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  const getErrorMessage = (err: unknown) => {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    try {
      return JSON.stringify(err);
    } catch {
      return String(err);
    }
  };

  const asString = (v: unknown, fallback = "") => (typeof v === "string" ? v : v == null ? fallback : String(v));
  const asNumber = (v: unknown): number | undefined => {
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };


  const [form, setForm] = useState({
    house: "",
    street: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    pickupDate: "",
  });

  const composedAddress = [
    form.house,
    form.street,
    form.landmark,
  ]
    .map((x) => String(x || "").trim())
    .filter(Boolean)
    .join(", ");

  // After placing an order, redirect back to Sell Phone page.
  // Must not be conditional (React hooks rule).
  useEffect(() => {
    if (step !== 3) return;

    const t = window.setTimeout(() => {
      navigate("/sell", { replace: true });
    }, 1500);

    return () => {
      window.clearTimeout(t);
    };
  }, [step, navigate]);

  // Use phoneData from location.state if available, else fallback
  const locationState = location.state as { phoneData?: Record<string, unknown> } | null;
  const passedPhoneData = locationState?.phoneData;

  const phoneData = passedPhoneData
    ? {
        id: asString(passedPhoneData.id, ""),
        name: asString(passedPhoneData.name, ""),
        brand: asString(passedPhoneData.brand, ""),
        variant: asString(passedPhoneData.variant, "N/A") || "N/A",
        condition: asString(passedPhoneData.condition, "Good") || "Good",
        price: asNumber(passedPhoneData.price) ?? asNumber(passedPhoneData.maxPrice) ?? 0,
        image:
          asString(passedPhoneData.image, "").trim() !== ""
            ? asString(passedPhoneData.image, "")
            : `https://placehold.co/200x200?text=${encodeURIComponent(asString(passedPhoneData.name, "Phone"))}`,
      }
    : {
      // fallback ONLY if navigation state is missing
      id: "iphone-13-pro",
      name: "iPhone 13 Pro",
      brand: "Apple",
      variant: "256GB",
      condition: "Good",
      price: 40000,
      image: "/assets/phones/iphone-13-pro.png",
    };

  const handleProceedToSell = () => {
    if (isLoggedIn) return;
    navigate("/login", {
      state: {
        redirectTo: "/checkout",
        redirectState: location.state,
        backgroundLocation: location,
      },
    });
  };

  // Logged-out users should only see the price/quote summary in Checkout.
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Header />

        <main className="flex-grow py-10">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
                  <h1 className="text-2xl font-bold text-white">
                    Your Price Quote
                  </h1>
                  <p className="text-blue-100 text-sm mt-1">
                    Login is only required to schedule pickup and place the order.
                  </p>
                </div>

                <div className="p-6">
                  <div className="flex flex-col sm:flex-row gap-5 items-start">
                    <img
                      src={phoneData.image}
                      alt={phoneData.name}
                      className="w-28 h-28 object-contain rounded-xl bg-slate-50 border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = `https://placehold.co/200x200?text=${encodeURIComponent(
                          phoneData.name
                        )}`;
                      }}
                    />
                    <div className="flex-1">
                      <div className="text-lg font-bold text-gray-900">
                        {phoneData.name}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {phoneData.brand} • {phoneData.variant} • {phoneData.condition}
                      </div>

                      <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                        <div className="text-sm text-emerald-700 font-medium">AI Quote</div>
                        <div className="text-3xl font-extrabold text-emerald-700 mt-1">
                          ₹XXX.XX
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-end">
                    <Link to="/sell">
                      <Button variant="outline">Change Phone</Button>
                    </Link>
                    <Button onClick={handleProceedToSell}>
                      Proceed to Sell
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const handleSubmitAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitErrorTitle(null);
    setIsCheckingServiceability(true);

    try {
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await fetch(
        `${API_URL}/orders/serviceability?pincode=${encodeURIComponent(form.pincode || "")}`,
        {
          method: "GET",
          headers,
        }
      );

      const data = await res.json().catch(() => ({}));

      // This endpoint should be PUBLIC. If we get 401/403 here, the backend is likely
      // routing /orders/serviceability to a protected handler (e.g., /orders/:id) or
      // is otherwise misconfigured.
      if (res.status === 401 || res.status === 403) {
        const backendMsg = String(data?.message || "");
        throw new Error(
          backendMsg && backendMsg.length > 0
            ? `Serviceability check is not accessible on the backend: ${backendMsg}`
            : "Serviceability check is not accessible on the backend. Please redeploy the backend and try again."
        );
      }

      // We want the user to know serviceability BEFORE moving to Payment.
      // So if the endpoint is missing (404) or backend is failing (5xx/503), we block step-advance.
      if (res.status === 404) {
        throw new Error(
          "Serviceability check endpoint is not available on the backend yet. Please redeploy the backend (or point VITE_API_URL to the updated server) and try again."
        );
      }

      if (res.status === 503 || res.status >= 500) {
        throw new Error(
          "Serviceability check is temporarily unavailable. Please try again in a moment."
        );
      }

      if (!res.ok || !data?.success) {
        const msg = String(data?.message || "Order not serviceable. Change your pincode.");
        throw new Error(msg);
      }

      setStep(2);
      window.scrollTo(0, 0);
    } catch (err: unknown) {
      const rawMsg = getErrorMessage(err);
      const isNetworkError =
        (err instanceof Error && err.name === "TypeError") ||
        /failed\s+to\s+fetch/i.test(rawMsg) ||
        /network\s*error/i.test(rawMsg) ||
        /err_connection_refused/i.test(rawMsg);

      const isServiceabilityInfra =
        /serviceability\s+check/i.test(rawMsg) || /redeploy\s+the\s+backend/i.test(rawMsg);

      const title = isNetworkError
        ? "Backend not reachable"
        : isServiceabilityInfra
          ? "Serviceability check failed"
          : "Order not serviceable";
      const msg = isNetworkError
        ? "Can’t reach the backend API. Please start the backend or set VITE_API_URL to the correct server, then reload the page."
        : rawMsg || "Order not serviceable. Change your pincode.";

      setSubmitErrorTitle(title);
      setSubmitError(msg);
      toast.error(title, { description: msg });
    } finally {
      setIsCheckingServiceability(false);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: composedAddress,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          latitude: gpsCoords?.lat ?? null,
          longitude: gpsCoords?.lng ?? null,
          phone: phoneData,
          pickupDate: form.pickupDate,
          timeSlot,  
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        let message = String(data?.message || "Order failed. Please try again.");

        if (res.status === 422 && (data?.code === "NOT_SERVICEABLE" || /not\s+servic/i.test(message))) {
          message = "Order not serviceable. Change your pincode.";
        }

        if (res.status === 400 && data?.code === "INVALID_PINCODE") {
          message = "Please enter a valid 6-digit PIN code.";
        }

        throw new Error(message);
      }
      if (data.order && data.order.id) {
        localStorage.setItem('lastOrderId', data.order.id);
      }
      toast.success("Order placed successfully", {
        description: "Redirecting you to Sell Phone…",
      });
      navigate("/sell", { replace: true });
    } catch (err: unknown) {
      console.error("Checkout error:", err);

      const msg = getErrorMessage(err) || "Order failed";
      setSubmitError(msg);
      toast.error("Couldn’t place the order", { description: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUseLiveLocation = () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      const msg = "Live location is not supported on this browser.";
      setGpsStatus(msg);
      toast.error("Live location unavailable", { description: msg });
      return;
    }

    setIsLocating(true);
    setGpsStatus("Requesting location permission…");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = Number(pos?.coords?.latitude);
        const lng = Number(pos?.coords?.longitude);

        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          const msg = "Couldn’t read a valid location from the device.";
          setGpsCoords(null);
          setGpsStatus(msg);
          toast.error("Location capture failed", { description: msg });
          setIsLocating(false);
          return;
        }

        setGpsCoords({ lat, lng });
        setGpsStatus("Live location captured. Filling address…");

        (async () => {
          try {
            if (!token) {
              setGpsStatus("Live location captured. Please log in again.");
              return;
            }

            const res = await fetch(
              `${API_URL}/orders/reverse-geocode?lat=${encodeURIComponent(String(lat))}&lon=${encodeURIComponent(String(lng))}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            const data = await res.json().catch(() => ({}));
            if (!res.ok || !data?.success) {
              const msg = String(data?.message || "Couldn’t fill address from live location.");
              setGpsStatus(`Live location captured. ${msg}`);
              return;
            }

            const addr = data?.address || {};
            setForm((prev) => ({
              ...prev,
              street: String(addr.street || prev.street || ""),
              city: String(addr.city || prev.city || ""),
              state: String(addr.state || prev.state || ""),
              pincode: String(addr.pincode || prev.pincode || ""),
            }));

            setGpsStatus("Live location captured. Address filled.");
            toast.success("Address filled from location", {
              description: "Street, city, state, and PIN were updated.",
            });
          } catch (e: unknown) {
            setGpsStatus("Live location captured. Couldn’t fill address from location.");
          } finally {
            setIsLocating(false);
          }
        })();
      },
      (err) => {
        const code = Number(err?.code ?? 0);
        const msg =
          code === 1
            ? "Permission denied. Please allow location access and try again."
            : code === 2
              ? "Location unavailable. Try again with GPS enabled."
              : code === 3
                ? "Location request timed out. Please try again."
                : "Couldn’t get your live location. Please try again.";

        setGpsCoords(null);
        setGpsStatus(msg);
        toast.error("Location capture failed", { description: msg });
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };


  const stepIcons = [
    { icon: MapPin, label: "Pickup Details" },
    { icon: CreditCard, label: "Payment" },
    { icon: Package, label: "Confirmation" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />

      <main className="flex-grow py-8">
        <div className="container mx-auto px-4">
          {/* Enhanced Steps Indicator */}
          <div className="mb-10">
            <div className="max-w-2xl mx-auto">
              <div className="relative flex items-center justify-between">
                {/* Progress Line Background */}
                <div className="absolute left-0 right-0 top-6 h-1 bg-gray-200 rounded-full -z-10"></div>
                {/* Progress Line Active */}
                <div
                  className="absolute left-0 top-6 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500 -z-10"
                  style={{
                    width: step === 1 ? "0%" : step === 2 ? "50%" : "100%",
                  }}
                ></div>

                {stepIcons.map((stepItem, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg ${
                        step > index + 1
                          ? "bg-gradient-to-r from-green-400 to-emerald-500 text-white scale-100"
                          : step === index + 1
                          ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-110 ring-4 ring-blue-200"
                          : "bg-white text-gray-400 border-2 border-gray-200"
                      }`}
                    >
                      {step > index + 1 ? (
                        <Check size={22} strokeWidth={3} />
                      ) : (
                        <stepItem.icon size={20} />
                      )}
                    </div>
                    <p
                      className={`text-sm mt-3 font-medium transition-colors ${
                        step >= index + 1 ? "text-gray-900" : "text-gray-400"
                      }`}
                    >
                      {stepItem.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                {/* Step 1: Pickup Details */}
                {step === 1 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <MapPin size={22} />
                        Pickup Details
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        Where should we pick up your device?
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmitAddress}
                      className="p-6 space-y-5"
                    >
                      {submitError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                          <div className="font-semibold">{submitErrorTitle || "Order not serviceable"}</div>
                          <div className="text-sm mt-1">{submitError}</div>
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="first-name"
                            className="text-gray-700 font-medium"
                          >
                            First Name
                          </Label>
                          <Input
                            id="first-name"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="John"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="last-name"
                            className="text-gray-700 font-medium"
                          >
                            Last Name
                          </Label>
                          <Input
                            id="last-name"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Doe"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="phone"
                            className="text-gray-700 font-medium"
                          >
                            Phone Number
                          </Label>
                          <Input
                            id="phone"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="+91 98765 43210"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="email"
                            className="text-gray-700 font-medium"
                          >
                            Email Address
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                          <Label className="text-gray-700 font-medium">Live Location</Label>
                          <Button
                            type="button"
                            variant="outline"
                            className="h-11 w-full"
                            onClick={handleUseLiveLocation}
                            disabled={isLocating}
                          >
                            {isLocating ? "Getting location…" : "Use Live Location"}
                          </Button>
                      </div>
                      <div className="text-sm text-gray-600">
                        {gpsCoords ? (
                          <span>
                            {gpsStatus ? `${gpsStatus} ` : ""}({gpsCoords.lat.toFixed(6)}, {gpsCoords.lng.toFixed(6)})
                          </span>
                        ) : gpsStatus ? (
                          <span>{gpsStatus}</span>
                        ) : (
                          <span>Optional: capture your exact pickup coordinates.</span>
                        )}
                      </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                        <div className="space-y-2">
                          <Label
                            htmlFor="house"
                            className="text-gray-700 font-medium"
                          >
                            House / Flat No.
                          </Label>
                          <Input
                            id="house"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="A-5"
                            value={form.house}
                            onChange={(e) => setForm({ ...form, house: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="street"
                            className="text-gray-700 font-medium"
                          >
                            Street
                          </Label>
                          <Input
                            id="street"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Eduljee Road, Charai"
                            value={form.street}
                            onChange={(e) => setForm({ ...form, street: e.target.value })}
                          />
                        </div>

                        <div className="space-y-2">
                        <Label
                          htmlFor="landmark"
                          className="text-gray-700 font-medium"
                        >
                          Landmark
                        </Label>
                        <Input
                          id="landmark"
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Near Ganesh Bhavan"
                          value={form.landmark}
                          onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                        />
                      </div>
                      </div>                      

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="city"
                            className="text-gray-700 font-medium"
                          >
                            City
                          </Label>
                          <Input
                            id="city"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="Mumbai"
                            value={form.city}
                            onChange={(e) => setForm({ ...form, city: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="state"
                            className="text-gray-700 font-medium"
                          >
                            State
                          </Label>
                          <Select value={form.state} onValueChange={(v) => setForm({ ...form, state: v })}>
                            <SelectTrigger
                              id="state"
                              className="h-11 border-gray-200"
                            >
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Maharashtra">
                                Maharashtra
                              </SelectItem>
                              <SelectItem value="Delhi">Delhi</SelectItem>
                              <SelectItem value="Karnataka">
                                Karnataka
                              </SelectItem>
                              <SelectItem value="Tamil Nadu">
                                Tamil Nadu
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pincode"
                            className="text-gray-700 font-medium"
                          >
                            PIN Code
                          </Label>
                          <Input
                            id="pincode"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            placeholder="400001"
                            value={form.pincode}
                            onChange={(e) => {
                              setForm({ ...form, pincode: e.target.value });
                              if (submitError) {
                                setSubmitError(null);
                                setSubmitErrorTitle(null);
                              }
                            }}
                          />
                        </div>
                      </div>


                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="pickup-date"
                            className="text-gray-700 font-medium"
                          >
                            Preferred Pickup Date
                          </Label>
                          <Input
                            id="pickup-date"
                            type="date"
                            required
                            className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                            onChange={(e) => setForm({ ...form, pickupDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="pickup-time"
                            className="text-gray-700 font-medium"
                          >
                            Preferred Time Slot
                          </Label>
                          <Select 
                            value={timeSlot}           // ✅ Add value prop
                            onValueChange={setTimeSlot}
                          >
                            <SelectTrigger
                              id="pickup-time"
                              className="h-11 border-gray-200"
                            >
                              <SelectValue placeholder="Select time slot" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="9-12">
                                9:00 AM - 12:00 PM
                              </SelectItem>
                              <SelectItem value="12-3">
                                12:00 PM - 3:00 PM
                              </SelectItem>
                              <SelectItem value="3-6">
                                3:00 PM - 6:00 PM
                              </SelectItem>
                              <SelectItem value="6-9">
                                6:00 PM - 9:00 PM
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="pt-4 space-y-3">
                        <Button
                          type="submit"
                          disabled={isCheckingServiceability}
                          className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                        >
                          Continue to Payment
                          <ArrowLeft size={18} className="ml-2 rotate-180" />
                        </Button>
                        <div className="text-center">
                          <Link
                            to="/login"
                            className="text-sm text-gray-500 hover:text-blue-600 inline-flex items-center transition-colors"
                          >
                            <ArrowLeft size={14} className="mr-1" />
                            Back to Devices
                          </Link>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 2: Payment Method */}
                {step === 2 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                      <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <CreditCard size={22} />
                        Payment Method
                      </h2>
                      <p className="text-blue-100 text-sm mt-1">
                        How would you like to receive your payment?
                      </p>
                    </div>

                    <form
                      onSubmit={handleSubmitPayment}
                      className="p-6 space-y-6"
                    >
                      {submitError && (
                        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-rose-800">
                          <div className="font-semibold">Order not placed</div>
                          <div className="text-sm mt-1">{submitError}</div>
                        </div>
                      )}

                      <RadioGroup
                        value={paymentMethod}
                        onValueChange={setPaymentMethod}
                        className="space-y-4"
                      >
                        <div
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            paymentMethod === "upi"
                              ? "border-blue-500 bg-blue-50/50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="upi"
                              id="upi"
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor="upi"
                              className="flex-1 ml-3 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900">
                                UPI
                              </div>
                              <div className="text-sm text-gray-500">
                                Instant transfer to your UPI ID
                              </div>
                            </Label>
                            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Fastest
                            </div>
                          </div>

                          {paymentMethod === "upi" && (
                            <div className="mt-4 pl-8 animate-in slide-in-from-top-2 duration-200">
                              <Label
                                htmlFor="upi-id"
                                className="text-sm font-medium"
                              >
                                UPI ID
                              </Label>
                              <Input
                                id="upi-id"
                                placeholder="yourname@paytm"
                                className="mt-1.5 h-11"
                                required={paymentMethod === "upi"}
                              />
                            </div>
                          )}
                        </div>

                        <div
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            paymentMethod === "bank"
                              ? "border-blue-500 bg-blue-50/50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="bank"
                              id="bank"
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor="bank"
                              className="flex-1 ml-3 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900">
                                Bank Transfer
                              </div>
                              <div className="text-sm text-gray-500">
                                Direct transfer to your bank account (1-2 days)
                              </div>
                            </Label>
                          </div>

                          {paymentMethod === "bank" && (
                            <div className="mt-4 pl-8 space-y-3 animate-in slide-in-from-top-2 duration-200">
                              <div>
                                <Label
                                  htmlFor="account-number"
                                  className="text-sm font-medium"
                                >
                                  Account Number
                                </Label>
                                <Input
                                  id="account-number"
                                  className="mt-1.5 h-11"
                                  required={paymentMethod === "bank"}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="ifsc-code"
                                  className="text-sm font-medium"
                                >
                                  IFSC Code
                                </Label>
                                <Input
                                  id="ifsc-code"
                                  className="mt-1.5 h-11"
                                  required={paymentMethod === "bank"}
                                />
                              </div>
                              <div>
                                <Label
                                  htmlFor="account-name"
                                  className="text-sm font-medium"
                                >
                                  Account Holder Name
                                </Label>
                                <Input
                                  id="account-name"
                                  className="mt-1.5 h-11"
                                  required={paymentMethod === "bank"}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            paymentMethod === "wallet"
                              ? "border-blue-500 bg-blue-50/50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="wallet"
                              id="wallet"
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor="wallet"
                              className="flex-1 ml-3 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900">
                                E-Wallet
                              </div>
                              <div className="text-sm text-gray-500">
                                Transfer to PayTM, PhonePe, or Amazon Pay
                              </div>
                            </Label>
                          </div>

                          {paymentMethod === "wallet" && (
                            <div className="mt-4 pl-8 space-y-3 animate-in slide-in-from-top-2 duration-200">
                              <div>
                                <Label
                                  htmlFor="wallet-type"
                                  className="text-sm font-medium"
                                >
                                  Select Wallet
                                </Label>
                                <Select>
                                  <SelectTrigger
                                    id="wallet-type"
                                    className="mt-1.5 h-11"
                                  >
                                    <SelectValue placeholder="Choose wallet" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="paytm">PayTM</SelectItem>
                                    <SelectItem value="phonepe">
                                      PhonePe
                                    </SelectItem>
                                    <SelectItem value="amazon">
                                      Amazon Pay
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div>
                                <Label
                                  htmlFor="wallet-number"
                                  className="text-sm font-medium"
                                >
                                  Mobile Number
                                </Label>
                                <Input
                                  id="wallet-number"
                                  className="mt-1.5 h-11"
                                  required={paymentMethod === "wallet"}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div
                          className={`border-2 rounded-xl p-4 transition-all cursor-pointer ${
                            paymentMethod === "cash"
                              ? "border-blue-500 bg-blue-50/50 shadow-md"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <div className="flex items-center">
                            <RadioGroupItem
                              value="cash"
                              id="cash"
                              className="text-blue-600"
                            />
                            <Label
                              htmlFor="cash"
                              className="flex-1 ml-3 cursor-pointer"
                            >
                              <div className="font-semibold text-gray-900">
                                Cash on Pickup
                              </div>
                              <div className="text-sm text-gray-500">
                                Pay in cash after device verification
                              </div>
                            </Label>

                            <div className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                              Popular
                            </div>
                          </div>

                          {paymentMethod === "cash" && (
                            <div className="mt-4 pl-8 text-sm text-gray-600 animate-in slide-in-from-top-2 duration-200">
                              💡 Our executive will verify your device and pay
                              you in cash instantly.
                            </div>
                          )}
                        </div>
                      </RadioGroup>

                      <div className="pt-4 space-y-3">
                        <Button
                          type="submit"
                          className="w-full h-12 text-base bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-lg shadow-green-500/30"
                          disabled={isSubmitting}
                        >
                          {isSubmitting ? (
                            <div className="flex items-center gap-2">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Processing...
                            </div>
                          ) : (
                            <>
                              <CheckCircle size={18} className="mr-2" />
                              Complete Sale
                            </>
                          )}
                        </Button>
                        <div className="text-center">
                          <Button
                            variant="ghost"
                            type="button"
                            onClick={() => setStep(1)}
                            className="text-sm text-gray-500 hover:text-blue-600"
                          >
                            <ArrowLeft size={14} className="mr-1" />
                            Back to Pickup Details
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {step === 3 && (
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-8 text-center">
                      <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in duration-300">
                        <CheckCircle className="h-10 w-10 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">
                        Sale Confirmed!
                      </h2>
                      <p className="text-green-100 mt-2">
                        Your device pickup has been scheduled
                      </p>
                    </div>

                    <div className="p-6">
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 mb-6 text-center border border-blue-100">
                        <p className="text-sm text-gray-600">Order Reference</p>
                        <p className="text-2xl font-bold text-blue-600 mt-1">
                          MOB-78945612
                        </p>
                      </div>

                      <div className="space-y-4 mb-8">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Sparkles size={20} className="text-yellow-500" />
                          Next Steps
                        </h3>
                        <div className="space-y-3">
                          {[
                            {
                              icon: Shield,
                              text: "Back up your data and perform a factory reset on your device",
                            },
                            {
                              icon: Package,
                              text: "Have your ID proof ready for verification during pickup",
                            },
                            {
                              icon: Clock,
                              text: "Our executive will verify the device condition and process your payment",
                            },
                          ].map((item, index) => (
                            <div
                              key={index}
                              className="flex items-start p-3 bg-gray-50 rounded-lg"
                            >
                              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 flex-shrink-0 text-sm font-bold">
                                {index + 1}
                              </span>
                              <span className="text-gray-600">{item.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          onClick={() => navigate("/sell")}
                          className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Sell Another Phone
                        </Button>
                        <Button
  variant="outline"
  className="flex-1 h-11 border-2"
  onClick={() => {
    const orderId = localStorage.getItem('lastOrderId');
    if (orderId) {
      navigate(`/order/${orderId}`);
      return;
    }

    const msg = 'Order ID not found. Please open it from My Orders.';
    setSubmitError(msg);
    toast.error(msg);
  }}
>
  View Order Details
</Button>
                      </div>

                      <div className="mt-3 text-center text-xs text-gray-500">
                        Redirecting you to Sell Phone page in a few seconds...
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div>
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sticky top-6">
                  <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                    <Package size={20} className="text-blue-600" />
                    Sale Summary
                  </h3>

                  <div className="border-b pb-4 mb-4">
                    <div className="flex items-center mb-4 p-3 bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl">
                      <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center mr-3 shadow-sm">
                        <img
  src={phoneData.image}
  alt={phoneData.name}
  className="max-h-14 object-contain"
  onError={(e) => {
    (e.target as HTMLImageElement).src =
      `https://placehold.co/200x200?text=${encodeURIComponent(phoneData.name)}`;
  }}
/>

                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {phoneData.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {phoneData.variant} • {phoneData.condition}
                        </p>
                      </div>
                    </div>

                    <Accordion type="single" collapsible className="w-full">
                      <AccordionItem value="details" className="border-none">
                        <AccordionTrigger className="text-sm text-blue-600 hover:text-blue-700 py-2">
                          View device details
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 text-sm bg-gray-50 rounded-lg p-3">
                            <p className="flex justify-between">
                              <span className="text-gray-500">Model:</span>
                              <span className="font-medium">
                                {phoneData.name}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Storage:</span>
                              <span className="font-medium">
                                {phoneData.variant}
                              </span>
                            </p>
                            <p className="flex justify-between">
                              <span className="text-gray-500">Condition:</span>
                              <span className="font-medium">
                                {phoneData.condition}
                              </span>
                            </p>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Base Price:</span>
                      <span className="font-medium">
                        ₹{phoneData.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Pickup Fee:</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Processing Fee:</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total Amount:</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                        ₹{phoneData.price.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <Shield size={12} />
                      Final amount subject to physical verification
                    </p>
                  </div>

                  {/* Trust Badges */}
                  <div className="mt-6 pt-4 border-t">
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-green-50 rounded-lg p-2">
                        <Shield
                          size={18}
                          className="mx-auto text-green-600 mb-1"
                        />
                        <p className="text-xs text-green-700 font-medium">
                          Secure Payment
                        </p>
                      </div>
                      <div className="bg-blue-50 rounded-lg p-2">
                        <Clock
                          size={18}
                          className="mx-auto text-blue-600 mb-1"
                        />
                        <p className="text-xs text-blue-700 font-medium">
                          Instant Transfer
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}