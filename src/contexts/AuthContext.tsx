import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, UserProfile } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Load user from localStorage on mount
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    // Simulate authentication - check if user exists in localStorage
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    const foundUser = users.find((u: any) => u.email === email && u.password === password);
    
    if (foundUser) {
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        createdAt: foundUser.createdAt,
        profile: foundUser.profile,
      };
      setUser(userData);
      localStorage.setItem('currentUser', JSON.stringify(userData));
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    // Simulate user registration
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    
    // Check if user already exists
    if (users.find((u: any) => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: `user_${Date.now()}`,
      email,
      password, // In production, this should be hashed
      name,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    
    const userData: User = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      createdAt: newUser.createdAt,
    };
    
    setUser(userData);
    localStorage.setItem('currentUser', JSON.stringify(userData));
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
  };

  const updateProfile = (profile: UserProfile) => {
    if (!user) return;
    
    const updatedUser = { ...user, profile };
    setUser(updatedUser);
    localStorage.setItem('currentUser', JSON.stringify(updatedUser));
    
    // Also update in users array
    const usersData = localStorage.getItem('users');
    const users = usersData ? JSON.parse(usersData) : [];
    const updatedUsers = users.map((u: any) => 
      u.id === user.id ? { ...u, profile } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        signIn,
        signUp,
        signOut,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
