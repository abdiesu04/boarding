"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export function useAuth(requiredRoles: string[] = ['CLIENT', 'ADMIN', 'SUPER_ADMIN']) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    async function loadUser() {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          // Redirect to login if no token
          router.push('/login');
          return;
        }
        
        // Fetch user data
        const response = await fetch('/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        // Check if user has required role
        if (!requiredRoles.includes(data.user.role)) {
          // Redirect to dashboard if user doesn't have required role
          router.push('/dashboard');
          return;
        }
        
        setUser(data.user);
      } catch (error) {
        console.error('Authentication error:', error);
        // Clear token and redirect to login
        localStorage.removeItem('token');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    }
    
    loadUser();
  }, [router, requiredRoles]);
  
  return { user, loading };
}


