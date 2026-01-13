import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import './Auth.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate network delay for UX
    setTimeout(async () => {
      const result = await login(username, password);
      if (result.success) {
        Swal.fire({
          icon: 'success',
          title: 'Login Berhasil!',
          text: `Selamat datang kembali, ${username}!`,
          timer: 2000,
          showConfirmButton: false
        });
        navigate('/');
      } else {
        toast.error(result.message || 'Login gagal, periksa username dan password Anda');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title text-gradient">Welcome Back</h1>
          <p className="auth-subtitle">Masuk untuk mengelola keuangan Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Masukkan username Anda"
            icon={User}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan password"
            icon={Lock}
            required
          />

          <Button 
            type="submit" 
            variant="primary" 
            disabled={isLoading}
            className="auth-button"
            icon={!isLoading ? ArrowRight : undefined}
          >
            {isLoading ? 'Memproses...' : 'Masuk'}
          </Button>

          <div className="auth-footer">
            <p>Belum punya akun? <Link to="/signup" className="auth-link">Daftar sekarang</Link></p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
