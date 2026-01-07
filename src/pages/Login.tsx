import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { User, Users, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Login() {
  const [isOpen, setIsOpen] = useState(true);
  const [userType, setUserType] = useState<"customer" | "agent">("customer");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login, signup } = useAuth();

  const handleClose = () => {
    setIsOpen(false);
    navigate("/");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;

      if (authMode === "login") {
        // Login
        success = await login(phone, password, userType);
        if (!success) {
          setError("Invalid phone number or password. Please try again.");
        }
      } else {
        // Signup
        if (!name.trim()) {
          setError("Please enter your name.");
          setIsLoading(false);
          return;
        }
        success = await signup(name, phone, password, userType, email || undefined);
        if (!success) {
          setError("Unable to create account. Phone number may already be registered.");
        }
      }

      if (success) {
  if (userType === "agent") {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const token = localStorage.getItem("token");

        await fetch(
          `${import.meta.env.VITE_API_URL}/agent/update-location`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              latitude: pos.coords.latitude,
              longitude: pos.coords.longitude,
            }),
          }
        );

        navigate("/agent/dashboard");
      },
      () => {
        alert("Location permission is required to receive orders");
      }
    );
  } else {
    navigate("/sell-phone");
  }
}

    } catch (err) {
      console.error('Auth error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Dialog open={isOpen} onOpenChange={handleClose}>
          <DialogContent className="max-w-4xl w-[95vw] max-h-[90vh] p-0 gap-0 overflow-hidden border-0 shadow-2xl">
            <div className="grid md:grid-cols-2 gap-0 h-full overflow-y-auto">
              {/* Left side - Image */}
              <div className="hidden md:block relative bg-gradient-to-br from-blue-600 to-indigo-700">
                <div className="absolute inset-0 bg-[url('/images/auth.jpg')] bg-cover bg-center opacity-20"></div>
                <div className="relative h-full flex items-center justify-center p-8">
                  <div className="text-center text-white">
                    <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                      {userType === "agent" ? (
                        <Users size={40} className="text-white" />
                      ) : (
                        <User size={40} className="text-white" />
                      )}
                    </div>
                    <h2 className="text-3xl font-bold mb-4">
                      {userType === "agent"
                        ? "Agent Portal"
                        : "Welcome to CashNow"}
                    </h2>
                    <p className="text-lg text-blue-100">
                      {userType === "agent"
                        ? "Manage pickups and process payments efficiently"
                        : "Get the best price for your old phone with our hassle-free service"}
                    </p>

                    {/* Features */}
                    <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                      {userType === "agent" ? (
                        <>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">
                              Manage device pickups
                            </span>
                          </div>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">Track your earnings</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">
                              Process instant payments
                            </span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">Best market prices</span>
                          </div>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">
                              Free doorstep pickup
                            </span>
                          </div>
                          <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                              ✓
                            </div>
                            <span className="text-sm">Instant payment</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right side - Form */}
              <div className="p-8 bg-white">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl font-bold text-center">
                    {authMode === "login" ? "Welcome Back!" : "Create Account"}
                  </DialogTitle>
                  <p className="text-center text-gray-500 mt-2">
                    {authMode === "login"
                      ? "Sign in to continue"
                      : "Join us today"}
                  </p>
                </DialogHeader>

                {/* User Type Tabs */}
                <Tabs
                  value={userType}
                  onValueChange={(v) => setUserType(v as "customer" | "agent")}
                  className="mb-6"
                >
                  <TabsList className="grid w-full grid-cols-2 h-12">
                    <TabsTrigger
                      value="customer"
                      className="flex items-center gap-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                    >
                      <User size={16} />
                      Customer
                    </TabsTrigger>
                    <TabsTrigger
                      value="agent"
                      className="flex items-center gap-2 data-[state=active]:bg-indigo-600 data-[state=active]:text-white"
                    >
                      <Users size={16} />
                      Agent
                    </TabsTrigger>
                  </TabsList>
                </Tabs>

                {/* Login/Signup Toggle */}
                <div className="flex gap-4 mb-6">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("login");
                      setError("");
                    }}
                    className={`flex-1 pb-2 text-center font-medium transition-all border-b-2 ${
                      authMode === "login"
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                  >
                    Login
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setError("");
                    }}
                    className={`flex-1 pb-2 text-center font-medium transition-all border-b-2 ${
                      authMode === "signup"
                        ? "text-blue-600 border-blue-600"
                        : "text-gray-400 border-transparent hover:text-gray-600"
                    }`}
                  >
                    Sign Up
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-gray-700 font-medium"
                      >
                        Full Name *
                      </Label>
                      <Input
                        id="name"
                        placeholder="Enter your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11"
                        required
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label
                      htmlFor="phone"
                      className="text-gray-700 font-medium"
                    >
                      Phone Number *
                    </Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="+91 Enter your Mobile"
                        className="pl-10 h-11"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-gray-700 font-medium"
                      >
                        Email (Optional)
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="your@email.com"
                          className="pl-10 h-11"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label
                        htmlFor="password"
                        className="text-gray-700 font-medium"
                      >
                        Password *
                      </Label>
                      {authMode === "login" && (
                        <Link
                          to="/forgot-password"
                          className="text-xs text-blue-600 hover:underline"
                        >
                          Forgot password?
                        </Link>
                      )}
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        className="pl-10 pr-10 h-11"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}
                      </button>
                    </div>
                  </div>

                  {authMode === "signup" && (
                    <div className="flex items-start gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        id="terms"
                        className="mt-1 rounded border-gray-300"
                        required
                      />
                      <label htmlFor="terms">
                        I agree to the{" "}
                        <Link
                          to="/terms"
                          className="text-blue-600 hover:underline"
                        >
                          Terms and Conditions
                        </Link>{" "}
                        &{" "}
                        <Link
                          to="/privacy"
                          className="text-blue-600 hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </label>
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full h-12 text-base shadow-lg ${
                      userType === "agent"
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-indigo-500/30"
                        : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
                    }`}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {authMode === "login"
                          ? "Signing in..."
                          : "Creating account..."}
                      </div>
                    ) : authMode === "login" ? (
                      "LOGIN"
                    ) : (
                      "CREATE ACCOUNT"
                    )}
                  </Button>
                </form>

                {/* Social Login */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-gray-500">
                        Or continue with
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" type="button" className="h-11">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google
                    </Button>
                    <Button variant="outline" type="button" className="h-11">
                      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                        <path
                          d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
                          fill="#1877F2"
                        />
                      </svg>
                      Facebook
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <Footer />
    </div>
  );
}