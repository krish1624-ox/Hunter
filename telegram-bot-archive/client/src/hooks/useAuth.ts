import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { LoginData } from "@shared/schema";

export function useAuth() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Get current user
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ["/api/auth/me"],
    retry: false,
  });

  // Login mutation
  const login = useMutation({
    mutationFn: async (credentials: LoginData) => {
      return await apiRequest("POST", "/api/auth/login", credentials);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to log in",
        variant: "destructive",
      });
    },
  });

  // Logout mutation
  const logout = useMutation({
    mutationFn: async () => {
      return await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.clear();
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to log out",
        variant: "destructive",
      });
    },
  });

  // Register mutation
  const register = useMutation({
    mutationFn: async (userData: { username: string; password: string; email?: string }) => {
      return await apiRequest("POST", "/api/auth/register", userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({
        title: "Success",
        description: "Registered successfully",
      });
    },
    onError: (err: any) => {
      toast({
        title: "Error",
        description: err.message || "Failed to register",
        variant: "destructive",
      });
    },
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    register,
  };
}