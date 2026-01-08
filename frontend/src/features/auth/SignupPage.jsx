import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Input from '../../shared/components/Input';
import Button from '../../shared/components/Button';
import Card from '../../shared/components/Card';
import './Auth.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Password tidak sama');
      return;
    }

    if (password.length < 4) {
      setError('Password minimal 4 karakter');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const result = await signup(username, password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="auth-container">
      <Card className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title text-gradient">Buat Akun</h1>
          <p className="auth-subtitle">Mulai perjalanan finansial Anda</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {error && <div className="auth-error">{error}</div>}
          
          <Input
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Pilih username"
            icon={User}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Buat password"
            icon={Lock}
            required
          />

          <Input
            label="Konfirmasi Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Ulangi password"
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
            {isLoading ? 'Membuat Akun...' : 'Daftar'}
          </Button>

          <div className="auth-footer">
            <p>Sudah punya akun? <Link to="/login" className="auth-link">Masuk disini</Link></p>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default SignupPage;
