import React, { createContext, useContext, ReactNode } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { 
  useGetCurrentUser, 
  useLoginUser, 
  useLogoutUser,
  getGetCurrentUserQueryKey,
  type UserProfile,
  type LoginRequest
} from '@workspace/api-client-react';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  login: (data: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isDriver: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: user, isLoading } = useGetCurrentUser({
    query: {
      retry: false,
      refetchOnWindowFocus: false,
    }
  });

  const loginMutation = useLoginUser({
    mutation: {
      onSuccess: (data) => {
        // Admin accounts go through 2FA — response includes requiresMfa flag
        // instead of a user object. Don't set user data yet.
        const mfaData = data as unknown as { requiresMfa: boolean; mfaToken: string };
        if (mfaData.requiresMfa) {
          setLocation(`/verify-code?token=${mfaData.mfaToken}`);
          return;
        }

        queryClient.setQueryData(getGetCurrentUserQueryKey(), data.user);
        toast({
          title: "Welcome back",
          description: "You have successfully logged in.",
        });
        if (data.user.role === 'admin') {
          setLocation('/admin');
        } else if (
          data.user.productPurchased === 'training' &&
          data.user.paymentStatus === 'paid'
        ) {
          // Training-only buyers have no platform access — land them directly
          // on the Training Center so they never see the platform dashboard.
          setLocation('/training');
        } else {
          setLocation('/dashboard');
        }
      },
      // Silent onError — required by React Query 5 so it doesn't fire an
      // unhandledrejection event internally. The login form's own try/catch
      // around mutateAsync catches the error and shows the inline message.
      onError: () => {},
    }
  });

  const logoutMutation = useLogoutUser({
    mutation: {
      onSuccess: () => {
        // Clear the entire query cache so no stale data can trigger
        // a back-redirect to the admin or dashboard page.
        queryClient.clear();
        setLocation('/login');
        toast({
          title: "Logged out",
          description: "You have been safely logged out.",
        });
      },
      onError: () => {
        // If the logout API call fails, still clear local state and redirect
        queryClient.clear();
        setLocation('/login');
      },
    }
  });

  // login() resolves on success and throws on failure so the caller (the login
  // form) can catch the error and show an inline message without a toast.
  const login = async (data: LoginRequest) => {
    await loginMutation.mutateAsync({ data });
  };

  const logout = async () => {
    await logoutMutation.mutateAsync();
  };

  const value = {
    user: user || null,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isDriver: user?.role === 'driver',
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
