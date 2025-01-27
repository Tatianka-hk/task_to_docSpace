import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import ErrorModal from '../components/ErrorModal';
import Cookies from "js-cookie";
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
      },
        body: JSON.stringify({ email, password }),
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/dashboard');
        console.log(response)
        // Cookies.set('session_token', response?.session_token, { path: '/', expires: 3600 });
      } else {
        const errorData = await response.json();
        setErrorMessage(errorData.detail);
        setIsModalOpen(true);
      }
    } catch (err) {
      setErrorMessage('An error occurred. Please try again.');
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 p-2"
            />
          </div>
          <div className="flex justify-between items-center">
            <Link href="/reset-password" className="text-sm text-blue-500 hover:text-blue-600">
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Log In
          </button>
        </form>
        <div className="mt-4 text-center">
          <Link href="/register" className="text-blue-500 hover:text-blue-600">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
      <ErrorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        message={errorMessage}
      />
    </div>
  );
}