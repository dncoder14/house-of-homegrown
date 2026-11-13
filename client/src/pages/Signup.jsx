import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input, Field } from '../components/ui/input';
import { PasswordInput } from '../components/ui/password-input';
import AuthLayout from '../components/AuthLayout';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';
import { authAPI, getErrorMessage } from '../utils/api';

const Signup = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  usePageTitle('Sign up');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (formData.password.length < 8) errors.password = 'Use at least 8 characters.';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
    if (Object.keys(errors).length) {
      setFieldErrors(errors);
      document.getElementById(errors.password ? 'password' : 'confirmPassword')?.focus();
      return;
    }

    setLoading(true);
    setError('');
    try {
      const { confirmPassword, ...signupData } = formData;
      const response = await authAPI.signup(signupData);
      login(response.data.user, response.data.token);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Signup failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Track orders and check out faster."
      error={error}
      footer={<>Already have an account? <Link to="/login" className="font-semibold text-primary hover:underline">Log in</Link></>}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Full name" htmlFor="name">
          <Input id="name" name="name" autoComplete="name" required autoFocus value={formData.name} onChange={handleChange} />
        </Field>
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" autoComplete="email" required value={formData.email} onChange={handleChange} placeholder="you@example.com" />
        </Field>
        <Field label="Password" htmlFor="password" error={fieldErrors.password} hint="At least 8 characters.">
          <PasswordInput id="password" name="password" autoComplete="new-password" required value={formData.password} onChange={handleChange} aria-invalid={!!fieldErrors.password} aria-describedby={fieldErrors.password ? 'password-error' : 'password-hint'} />
        </Field>
        <Field label="Confirm password" htmlFor="confirmPassword" error={fieldErrors.confirmPassword}>
          <PasswordInput id="confirmPassword" name="confirmPassword" autoComplete="new-password" required value={formData.confirmPassword} onChange={handleChange} aria-invalid={!!fieldErrors.confirmPassword} aria-describedby={fieldErrors.confirmPassword ? 'confirmPassword-error' : undefined} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  );
};

export default Signup;
