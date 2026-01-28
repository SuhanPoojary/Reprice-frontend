
import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

import { API_URL } from "@/api/config";

interface User {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  role: "customer";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (phone: string, password: string, name?: string) => Promise<boolean>;
  googleLogin: (credential: string) => Promise<boolean>;
  signup: (
    name: string,
    phone: string,
    password: string,
    email?: string
  ) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("token");

    if (savedToken) {
      setToken(savedToken);
    }

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
      }
    }

    setIsLoading(false);
  }, []);

  const login = async (
    phone: string,
    password: string,
    name?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone,
          password,
          userType: "customer",
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const backendUser: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: "customer",
        };

        setUser(backendUser);
        setToken(data.data.token);
        localStorage.setItem("currentUser", JSON.stringify(backendUser));
        localStorage.setItem("token", data.data.token);

        return true;
      }

      return false;
    } catch (error) {
      console.warn("Backend not available, using mock authentication:", error);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (phone && password.length >= 4) {
        const mockUser: User = {
          id: `customer-${Date.now()}`,
          name: name || "Customer",
          phone,
          role: "customer",
        };

        const mockToken = `mock-token-${Date.now()}`; // ✅ ADDED

        setUser(mockUser);
        setToken(mockToken); // ✅ ADDED
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        localStorage.setItem("token", mockToken); // ✅ ADDED

        return true;
      }

      return false;
    }
  };

  const googleLogin = async (credential: string): Promise<boolean> => {
    try {
      const endpoint = `${API_URL}/auth/google`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credential,
          idToken: credential,
          userType: "customer",
        }),
      });

      const data = await response.json().catch(() => null);

      if (data?.success && data?.data) {
        const backendUser: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: "customer",
        };

        setUser(backendUser);
        setToken(data.data.token);
        localStorage.setItem("currentUser", JSON.stringify(backendUser));
        localStorage.setItem("token", data.data.token);

        return true;
      }

      // If the endpoint exists but auth failed, do not try others.
      if (response.ok) {
        return false;
      }

      if (response.status === 404) {
        console.warn(
          "Google login endpoint not found on backend. Expected:",
          endpoint
        );
      }

      return false;
    } catch (error) {
      console.warn("Backend not available, using mock Google authentication:", error);

      await new Promise((resolve) => setTimeout(resolve, 700));

      if (credential && credential.length > 20) {
        const mockUser: User = {
          id: `customer-google-${Date.now()}`,
          name: "Customer",
          role: "customer",
        };

        const mockToken = `mock-google-token-${Date.now()}`;

        setUser(mockUser);
        setToken(mockToken);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        localStorage.setItem("token", mockToken);

        return true;
      }

      return false;
    }
  };

  const signup = async (
    name: string,
    phone: string,
    password: string,
    email?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          userType: "customer",
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        const backendUser: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: "customer",
        };

        setUser(backendUser);
        setToken(data.data.token);
        localStorage.setItem("currentUser", JSON.stringify(backendUser));
        localStorage.setItem("token", data.data.token);

        return true;
      }

      return false;
    } catch (error) {
      console.warn("Backend not available, using mock signup:", error);

      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (name && phone && password.length >= 4) {
        const mockUser: User = {
          id: `customer-${Date.now()}`,
          name,
          email,
          phone,
          role: "customer",
        };

        const mockToken = `mock-token-${Date.now()}`; // ✅ ADDED

        setUser(mockUser);
        setToken(mockToken); // ✅ ADDED
        localStorage.setItem("currentUser", JSON.stringify(mockUser));
        localStorage.setItem("token", mockToken); // ✅ ADDED

        return true;
      }

      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("currentUser");
    localStorage.removeItem("token");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn: !!token,
        login,
        googleLogin,
        signup,
        logout,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
