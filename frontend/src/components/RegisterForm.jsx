import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function RegisterForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://192.168.225.229:5000/api/auth/register', {
        username,
        password,
      });
      setMessage(res.data.msg);
      navigate('/login');
    } catch (err) {
      setMessage(err.response.data.msg || 'Registration failed');
    }
  };

  return (
    <form onSubmit={handleRegister} className="bg-white p-8 shadow-md rounded-lg max-w-md w-full">
      <h2 className="text-2xl font-bold mb-6">Register</h2>
      <div className="mb-4">
        <label htmlFor="username" className="block mb-2">Username</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="password" className="block mb-2">Password</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-2 border rounded-md"
          required
        />
      </div>
      {message && <p className="mb-4 text-red-500">{message}</p>}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded-md">Register</button>
    </form>
  );
}

export default RegisterForm;
