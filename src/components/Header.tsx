import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Menu,
  Phone,
  User,
  Users,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  // Add scroll event listener properly with useEffect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled
          ? "bg-background shadow-sm"
          : "bg-background/95 backdrop-blur-sm"
      }`}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Phone className="h-6 w-6 text-primary mr-2" />
              <span className="text-xl font-bold text-primary">CashNow</span>
            </Link>

            <nav className="hidden md:flex items-center space-x-6 ml-10">
              <Link
                to="/sell-phone"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Sell Phone
              </Link>
              <Link
                to="/how-it-works"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/about-us"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Conditional rendering based on login state */}
            {isLoggedIn ? (
              <>
                {/* Show Dashboard link for agents */}
                {user?.role === "agent" && (
                  <Link to="/agent/dashboard" className="hidden md:block">
                    <Button variant="ghost" className="flex items-center gap-2">
                      <LayoutDashboard size={18} />
                      Dashboard
                    </Button>
                  </Link>
                )}

                {/* User info badge */}
                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-full border border-blue-100">
                  <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {user?.name}
                  </span>
                </div>

                {/* Logout button */}
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="hidden md:flex items-center gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut size={18} />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {/* Login button */}
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center text-sm font-medium hover:text-primary transition-colors"
                >
                  <Link
                    to="/login"
                    className="flex items-center cursor-pointer"
                  >
                    <User size={18} className="mr-1" />
                    Login
                  </Link>
                </Button>

                {/* Sell Now button */}
                <Link to="/sell-phone">
                  <Button className="bg-primary text-primary-foreground hover:brightness-95 hidden md:inline-flex">
                    Sell Now
                  </Button>
                </Link>

                {/* Become Agent button */}
                <Link to="/login">
                  <Button
                    variant="outline"
                    className="border-primary text-primary hover:bg-primary/10 hidden lg:inline-flex"
                  >
                    Become Agent
                  </Button>
                </Link>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <div className="grid gap-6 py-6">
                  <Link
                    to="/sell-phone"
                    className="text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    Sell Phone
                  </Link>
                  <Link
                    to="/how-it-works"
                    className="text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    How It Works
                  </Link>
                  <Link
                    to="/about-us"
                    className="text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    About Us
                  </Link>
                  <Link
                    to="/contact"
                    className="text-base font-medium hover:text-blue-600 transition-colors"
                  >
                    Contact
                  </Link>

                  <div className="border-t pt-6">
                    {isLoggedIn ? (
                      <div className="grid gap-3">
                        {/* User info */}
                        <div className="flex items-center gap-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                            <User size={18} className="text-white" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">
                              {user?.role}
                            </p>
                          </div>
                        </div>

                        {/* Dashboard link for agents */}
                        {user?.role === "agent" && (
                          <Link to="/agent/dashboard">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <LayoutDashboard size={16} className="mr-2" />
                              Dashboard
                            </Button>
                          </Link>
                        )}

                        {/* Logout button */}
                        <Button
                          variant="outline"
                          onClick={handleLogout}
                          className="w-full justify-start border-red-200 text-red-600 hover:bg-red-50"
                        >
                          <LogOut size={16} className="mr-2" />
                          Logout
                        </Button>
                      </div>
                    ) : (
                      <>
                        <div className="text-sm font-semibold mb-3 text-gray-500">
                          Login
                        </div>
                        <div className="grid gap-3">
                          <Link to="/login">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <User size={16} className="mr-2" />
                              Customer Login
                            </Button>
                          </Link>
                          <Link to="/login">
                            <Button
                              variant="outline"
                              className="w-full justify-start"
                            >
                              <Users size={16} className="mr-2" />
                              Agent Login
                            </Button>
                          </Link>
                        </div>

                        <div className="border-t pt-6 mt-3">
                          <Link to="/login">
                            <Button className="w-full bg-purple-600 hover:bg-purple-700">
                              Become an Agent
                            </Button>
                          </Link>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
