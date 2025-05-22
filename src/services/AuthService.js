import { supabase } from '@/lib/supabase';
import { API_BASE_URL, ENDPOINTS } from '../config';

class AuthService {
  async signUp(email, password, fullName) {
    try {
      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.SIGNUP}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password,
          full_name: fullName
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to sign up');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in signUp:', error);
      throw error;
    }
  }

  async signIn(email, password) {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.LOGIN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to sign in');
      }

      const data = await response.json();
      
      // Store the token
      await supabase.auth.setSession({
        access_token: data.access_token,
        refresh_token: null
      });

      return data;
    } catch (error) {
      console.error('Error in signIn:', error);
      throw error;
    }
  }

  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error in signOut:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const token = (await supabase.auth.getSession()).data.session?.access_token;
      if (!token) return null;

      const response = await fetch(`${API_BASE_URL}${ENDPOINTS.AUTH.PROFILE}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to get user profile');
      }

      return await response.json();
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      return null;
    }
  }
}

export default new AuthService();
