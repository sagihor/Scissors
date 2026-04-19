import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../services/apiClient';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  
  const { setUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); 
    try {
      // פנייה לשרת (ל-Mock שלנו כרגע)
      const response = await apiClient.post('/auth/login', { phone });
      
      // שמירת הטוקן והמשתמש
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      
      // מעבר לדף הבית
      navigate('/');
    } catch (err) {
      setError('שגיאה בהתחברות, נסה שוב');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100" dir="rtl">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-96 text-center">
        
        <h1 className="text-3xl font-bold mb-2 text-gray-800">התחברות</h1>
        <p className="text-gray-500 mb-8">ברוכים הבאים ל-Scissors ✂️</p>

        {error && <p className="text-red-500 mb-4 font-medium">{error}</p>}

        <form onSubmit={handleLogin} className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="מספר טלפון (למשל 0501234567)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
            required
          />
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition duration-200"
          >
            היכנס למערכת
          </button>
        </form>
        
      </div>
    </div>
  );
}