import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
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

const API_URL = import.meta.env.VITE_API_URL;

const getCurrentLocation = (): Promise<{
  latitude: number;
  longitude: number;
}> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;

        // Accept only accurate readings (<30 meters)
        if (accuracy <= 30) {
          navigator.geolocation.clearWatch(watchId);
          resolve({ latitude, longitude });
        }
      },
      (error) => {
        navigator.geolocation.clearWatch(watchId);
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 30000,
        maximumAge: 0,
      }
    );
  });
};


export default function Checkout() {
  const navigate = useNavigate();
  const { token } = useAuth(); 
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeSlot, setTimeSlot] = useState("");


  const [form, setForm] = useState({
    address: "",
    city: "",
    state: "",
    pincode: "",
    pickupDate: "",
  });

  const phoneData = {
    id: "iphone-13-pro",
    name: "iPhone 13 Pro",
    variant: "256GB",
    condition: "Good",
    price: 40000,
  };

  const handleSubmitAddress = (e: React.FormEvent) => {
    e.preventDefault();
    setStep(2);
    window.scrollTo(0, 0);
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // ✅ GET REAL LOCATION
      const { latitude, longitude } = await getCurrentLocation();

      const res = await fetch(`${API_URL}/orders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          latitude,
          longitude,
          phone: phoneData,
          pickupDate: form.pickupDate,
          timeSlot,  
          paymentMethod,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        throw new Error("Order failed");
      }

      setStep(3);
      window.scrollTo(0, 0);
    } catch (err) {
    console.error("Checkout error:", err);
    alert(
      "Location access is required to place the order.\nPlease allow location and try again."
    );
  } finally {
    setIsSubmitting(false);
  }
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

                      <div className="space-y-2">
                        <Label
                          htmlFor="address"
                          className="text-gray-700 font-medium"
                        >
                          Full Address
                        </Label>
                        <Textarea
                          id="address"
                          required
                          className="min-h-[80px] border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                          placeholder="House/Flat No., Street, Landmark..."
                          onChange={(e) => setForm({ ...form, address: e.target.value })}
                        />
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
                          <Select>
                            <SelectTrigger
                              id="state"
                              className="h-11 border-gray-200"
                            >
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="maharashtra">
                                Maharashtra
                              </SelectItem>
                              <SelectItem value="delhi">Delhi</SelectItem>
                              <SelectItem value="karnataka">
                                Karnataka
                              </SelectItem>
                              <SelectItem value="tamil-nadu">
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
                            onChange={(e) => setForm({ ...form, pincode: e.target.value })}
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
                          <Select onValueChange={setTimeSlot}>
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
                          className="w-full h-12 text-base bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/30"
                        >
                          Continue to Payment
                          <ArrowLeft size={18} className="ml-2 rotate-180" />
                        </Button>
                        <div className="text-center">
                          <Link
                            to="/sell-phone"
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
                          onClick={() => navigate("/")}
                          className="flex-1 h-11 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        >
                          Back to Home
                        </Button>
                        <Button
                          variant="outline"
                          className="flex-1 h-11 border-2"
                        >
                          View Order Details
                        </Button>
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
                          src={`https://placehold.co/200x200?text=${phoneData.name}`}
                          alt={phoneData.name}
                          className="max-h-14"
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
