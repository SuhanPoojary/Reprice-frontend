import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { ArrowLeft, X, User, Phone, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  GoogleOAuthProvider,
  GoogleLogin,
  type CredentialResponse,
} from "@react-oauth/google";

type LoginProps = {
  variant?: "page" | "modal";
};

export default function Login({ variant = "page" }: LoginProps) {
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup, googleLogin } = useAuth();
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as
    | string
    | undefined;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      let success = false;

      if (authMode === "login") {
        // Login
        success = await login(phone, password);
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
        success = await signup(name, phone, password, email || undefined);
        if (!success) {
          setError("Unable to create account. Phone number may already be registered.");
        }
      }

      if (success) {
        const redirectTo = (location.state as any)?.redirectTo as
          | string
          | undefined;
        const redirectState = (location.state as any)?.redirectState;

        if (redirectTo) {
          navigate(redirectTo, { state: redirectState, replace: true });
        } else {
          navigate("/sell");
        }
      }

    } catch (err) {
      console.error('Auth error:', err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const finishLoginRedirect = () => {
    const redirectTo = (location.state as any)?.redirectTo as string | undefined;
    const redirectState = (location.state as any)?.redirectState;

    if (redirectTo) {
      navigate(redirectTo, { state: redirectState, replace: true });
    } else {
      navigate("/sell");
    }
  };

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    setError("");
    setIsLoading(true);

    try {
      const credential = response.credential;
      if (!credential) {
        setError("Google login failed. Please try again.");
        return;
      }

      const success = await googleLogin(credential);
      if (!success) {
        setError("Google login failed. Please try again.");
        return;
      }

      finishLoginRedirect();
    } catch (err) {
      console.error("Google auth error:", err);
      setError("Google login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again.");
  };

  const close = () => {
    // If opened as an overlay modal, go back to the background page.
    if (variant === "modal") {
      navigate(-1);
      return;
    }
    navigate("/");
  };

  useEffect(() => {
    if (variant !== "modal") return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [variant]);

  const content = (
    <div className="w-full max-w-4xl">
      <div className="overflow-hidden border-0 shadow-2xl rounded-xl bg-white">
        <div className="grid md:grid-cols-2 gap-0 min-h-0">
          {/* Left side - Image */}
          <div className="hidden md:block relative bg-gradient-to-br from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-[url('/images/auth.jpg')] bg-cover bg-center opacity-20"></div>
            <div className="relative h-full flex items-center justify-center p-8">
              <div className="text-center text-white">
                <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <User size={40} className="text-white" />
                </div>
                <h2 className="text-3xl font-bold mb-4">Welcome to MobileTrade</h2>
                <p className="text-lg text-blue-100">
                  Get the best price for your old phone with our hassle-free service
                </p>

                {/* Features */}
                <div className="mt-8 space-y-3 text-left max-w-xs mx-auto">
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-sm">Best market prices</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-sm">Free doorstep pickup</span>
                  </div>
                  <div className="flex items-center gap-3 bg-white/10 rounded-lg p-3">
                    <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">✓</div>
                    <span className="text-sm">Instant payment</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right side - Form */}
          <div className="p-8 bg-white overflow-y-auto max-h-[90vh]">
            <div className="mb-6">
              <div className="text-2xl font-bold text-center">
                {authMode === "login" ? "Welcome Back!" : "Create Account"}
              </div>
              <div className="text-center text-gray-500 mt-2">
                {authMode === "login" ? "Sign in to continue" : "Join us today"}
              </div>
            </div>

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
                  <Label htmlFor="name" className="text-gray-700 font-medium">
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
                <Label htmlFor="phone" className="text-gray-700 font-medium">
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
                  <Label htmlFor="email" className="text-gray-700 font-medium">
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
                  <Label htmlFor="password" className="text-gray-700 font-medium">
                    Password *
                  </Label>
                  {authMode === "login" && (
                    <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">
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
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {authMode === "signup" && (
                <div className="flex items-start gap-2 text-xs text-gray-600">
                  <input type="checkbox" id="terms" className="mt-1 rounded border-gray-300" required />
                  <label htmlFor="terms">
                    I agree to the{" "}
                    <Link to="/terms" className="text-blue-600 hover:underline">
                      Terms and Conditions
                    </Link>{" "}
                    &{" "}
                    <Link to="/privacy" className="text-blue-600 hover:underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 text-base shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/30"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    {authMode === "login" ? "Signing in..." : "Creating account..."}
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
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-4 flex justify-center">
                {googleClientId ? (
                  <GoogleOAuthProvider clientId={googleClientId}>
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={handleGoogleError}
                      useOneTap={false}
                    />
                  </GoogleOAuthProvider>
                ) : (
                  <div className="text-xs text-gray-500 text-center">
                    
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="fixed inset-0 z-50">
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={close}
          aria-hidden="true"
        />
        <div className="relative flex min-h-screen items-center justify-center p-4">
          <div className="w-full max-w-4xl">
            <div className="flex justify-end mb-3">
              <Button
                variant="outline"
                size="icon"
                onClick={close}
                aria-label="Close"
                title="Close"
                className="h-12 w-12 rounded-full bg-white/90 shadow-lg border-slate-200 text-slate-700 hover:bg-white"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            {content}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-grow flex items-center justify-center py-12 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="w-full max-w-4xl px-4">
          <div className="mb-4">
            <Button variant="ghost" asChild>
              <Link to="/">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Link>
            </Button>
          </div>
          {content}
        </div>
      </main>

      <Footer />
    </div>
  );
}