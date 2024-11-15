import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../utilities/AuthContext"; // Adjust path as necessary

function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login from context

  const handleLogin = async (e) => {
    e.preventDefault();

    const username = e.target.username.value;
    const password = e.target.password.value;

    try {
      const response = await fetch(
        "http://192.168.225.229:5000/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ username, password }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();

      // Perform login action from AuthContext if necessary
      login(data.token, data.username, data.userId); // Store the token/userId if applicable

      // Redirect to dashboard upon successful login
      navigate("/dashboard");

    } catch (error) {
      console.error("Login error:", error);
      setMessage("Login failed. Please check your credentials and try again.");
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="bg-white p-8 shadow-md rounded-lg max-w-md w-full"
    >
      <h2 className="text-2xl font-bold mb-6">Login</h2>
      <div className="mb-4">
        <label htmlFor="username" className="block mb-2">
          Username
        </label>
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
        <label htmlFor="password" className="block mb-2">
          Password
        </label>
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
      <button
        type="submit"
        className="w-full bg-blue-500 text-white py-2 rounded-md"
      >
        Login
      </button>
    </form>
  );
}

export default LoginForm;
