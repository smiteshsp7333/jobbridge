import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import axios from '../api/axios';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'seeker' | 'employer';
  profileComplete?: number;
  companyName?: string;
  // other fields can expand...
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  token: string | null;
  loading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          // Decode just to verify structure
          jwtDecode(storedToken);
          // Set token to axios defaults handled in api/axios.ts automatically
          setToken(storedToken);
          const res = await axios.get('/users/me', {
            headers: { Authorization: `Bearer ${storedToken}` }
          });
          setUser(res.data);
        } catch (error) {
          console.error('Invalid token or fetch failed', error);
          localStorage.removeItem('token');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, []);

  const login = async (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    try {
       const res = await axios.get('/users/me', {
            headers: { Authorization: `Bearer ${newToken}` }
       });
       setUser(res.data);
    } catch(err) {
       console.error("Failed to fetch user state", err);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setToken(null);
  };

  if (loading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#0f0f0f] text-[#c5f135] text-xl font-medium">Loading JobBridge...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, setUser, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
