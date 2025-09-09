import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

interface AdminUser {
  id: string;
  username: string;
  email: string;
  role: "admin" | "super_admin";
}

interface AdminContextType {
  admin: AdminUser | null;
  loading: boolean;
  isAdmin: boolean;
  loginAdmin: (email: string, password: string) => Promise<void>;
  logoutAdmin: () => void;
}

const AdminContext = createContext<AdminContextType | null>(null);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAdmin = () => {
      const adminToken = localStorage.getItem("adminToken");
      const savedAdmin = localStorage.getItem("admin");
      
      if (adminToken && savedAdmin) {
        try {
          const parsedAdmin = JSON.parse(savedAdmin);
          setAdmin(parsedAdmin);
        } catch (error) {
          console.error("Error parsing saved admin:", error);
          localStorage.removeItem("adminToken");
          localStorage.removeItem("admin");
        }
      }
      setLoading(false);
    };

    initAdmin();
  }, []);

  const loginAdmin = async (email: string, password: string) => {
    try {
      // Mock admin login - in real app, this would call backend
      if (email === "admin@charitychain.com" && password === "admin123") {
        const adminData: AdminUser = {
          id: "admin-1",
          username: "Admin",
          email: "admin@charitychain.com",
          role: "admin"
        };
        
        const token = "mock-admin-token-" + Date.now();
        
        localStorage.setItem("adminToken", token);
        localStorage.setItem("admin", JSON.stringify(adminData));
        setAdmin(adminData);
        
        toast({
          title: "Admin login successful",
          description: "Welcome to the admin dashboard",
        });
      } else {
        throw new Error("Invalid admin credentials");
      }
    } catch (error: any) {
      toast({
        title: "Admin login failed",
        description: error.message || "Invalid credentials",
        variant: "destructive",
      });
      throw error;
    }
  };

  const logoutAdmin = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");
    setAdmin(null);
    toast({
      title: "Admin logged out",
      description: "You have been logged out of the admin panel",
    });
  };

  const value = {
    admin,
    loading,
    isAdmin: !!admin,
    loginAdmin,
    logoutAdmin,
  };

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};