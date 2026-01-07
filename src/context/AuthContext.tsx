import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface User {
  id: string | number;
  name: string;
  email?: string;
  phone?: string;
  role: "user" | "agent" | "customer";
  userType?: 'customer' | 'agent'; // For backend compatibility
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  login: (
    identifier: string, // Can be email or phone
    password: string,
    role: "user" | "agent" | "customer",
    name?: string
  ) => Promise<boolean>;
  signup: (
    name: string,
    phone: string,
    password: string,
    userType: 'customer' | 'agent',
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

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem("currentUser");
    const savedToken = localStorage.getItem("token");
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        if (savedToken) {
          setToken(savedToken);
        }
      } catch (e) {
        console.error("Failed to parse saved user:", e);
        localStorage.removeItem("currentUser");
        localStorage.removeItem("token");
      }
    }
    setIsLoading(false);
  }, []);

  // Helper function to convert role to userType
  const roleToUserType = (role: "user" | "agent" | "customer"): 'customer' | 'agent' => {
    return role === "agent" ? "agent" : "customer";
  };

  // Helper function to convert userType to role
  const userTypeToRole = (userType: 'customer' | 'agent'): "user" | "agent" | "customer" => {
    return userType === "agent" ? "agent" : "customer";
  };

  const login = async (
    identifier: string, // Can be email or phone
    password: string,
    role: "user" | "agent" | "customer",
    name?: string
  ): Promise<boolean> => {
    try {
      // Check if API is available by trying to connect
      const userType = roleToUserType(role);
      
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: identifier,
          password,
          userType
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Backend is available - use real authentication
        const backendUser: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: userTypeToRole(data.data.user.userType),
          userType: data.data.user.userType
        };

        setUser(backendUser);
        setToken(data.data.token);
        localStorage.setItem("currentUser", JSON.stringify(backendUser));
        localStorage.setItem("token", data.data.token);

        console.log("User logged in (backend):", backendUser);
        return true;
      }

      return false;
    } catch (error) {
      console.warn("Backend not available, using mock authentication:", error);
      
      // Fallback to mock authentication (for development without backend)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (identifier && password.length >= 4) {
        const mockUser: User = {
          id: `${role}-${Date.now()}`,
          name: name || identifier.split("@")[0],
          email: identifier.includes("@") ? identifier : undefined,
          phone: !identifier.includes("@") ? identifier : undefined,
          role: role === "customer" ? "user" : role,
          userType: roleToUserType(role)
        };

        setUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));

        console.log("User logged in (mock):", mockUser);
        return true;
      }
      return false;
    }
  };

  const signup = async (
    name: string,
    phone: string,
    password: string,
    userType: 'customer' | 'agent',
    email?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          phone,
          email,
          password,
          userType
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Backend signup successful
        const backendUser: User = {
          id: data.data.user.id,
          name: data.data.user.name,
          email: data.data.user.email,
          phone: data.data.user.phone,
          role: userTypeToRole(data.data.user.userType),
          userType: data.data.user.userType
        };

        setUser(backendUser);
        setToken(data.data.token);
        localStorage.setItem("currentUser", JSON.stringify(backendUser));
        localStorage.setItem("token", data.data.token);

        console.log("User signed up (backend):", backendUser);
        return true;
      }

      return false;
    } catch (error) {
      console.warn("Backend not available, using mock signup:", error);
      
      // Fallback to mock signup
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (name && phone && password.length >= 4) {
        const mockUser: User = {
          id: `${userType}-${Date.now()}`,
          name,
          email,
          phone,
          role: userTypeToRole(userType),
          userType
        };

        setUser(mockUser);
        localStorage.setItem("currentUser", JSON.stringify(mockUser));

        console.log("User signed up (mock):", mockUser);
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
    console.log("User logged out");
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        token,
        isLoggedIn: !!user, 
        login, 
        signup,
        logout,
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}