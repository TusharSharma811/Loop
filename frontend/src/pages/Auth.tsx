import React, { useEffect, useState } from "react";
import { MessageCircle, Eye, EyeOff, ArrowLeft, Mail, Lock, User, Chrome } from "lucide-react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import useUserStore from "../store/userStore";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "motion/react";

export const AuthPage: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, setIsAuthenticated } = useAuthStore();
  const { fetchUser } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
      navigate("/chat");
    }
  }, [isAuthenticated, navigate, fetchUser]);

  const location = window.location.pathname;
  useEffect(() => {
    if (location.includes("signup")) {
      setIsSignUp(true);
    } else {
      setIsSignUp(false);
      navigate("/auth/signin");
    }
  }, [location, navigate]);

  const onBack = () => navigate("/");

  const onAuthSuccess = () => {
    toast.success("Authentication successful!");
    navigate("/chat");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const endpoint = isSignUp ? "/auth/register" : "/auth/login";
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setIsLoading(false);
      if (response.ok) {
        setIsAuthenticated(true);
        fetchUser();
        onAuthSuccess();
      } else {
        toast.error(data?.message || "Authentication failed");
      }
    } catch {
      setIsLoading(false);
      toast.error("Something went wrong. Please try again.");
    }
  };

  const handleSocialAuth = () => {
    try {
      setIsLoading(true);
      const width = 500;
      const height = 600;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/google-login`,
        "Google OAuth",
        `width=${width},height=${height},left=${left},top=${top}`
      );

      window.addEventListener("message", (event) => {
        if (event.origin !== import.meta.env.VITE_API_BASE_URL) return;
        if (event.data.type === "google-auth-success") {
          popup?.close();
        }
        setIsAuthenticated(true);
        fetchUser();
        onAuthSuccess();
      });
    } catch {
      setIsLoading(false);
      toast.error("Social authentication failed. Please try again.");
    }
  };

  const inputClasses = "w-full pl-10 pr-4 py-3 bg-bg-tertiary border border-border rounded-lg text-text placeholder-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none";

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-30%] left-[-20%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[-30%] right-[-20%] w-[400px] h-[400px] rounded-full bg-accent/8 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <button
          onClick={onBack}
          className="flex items-center text-text-secondary hover:text-text mb-6 transition-colors text-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to home
        </button>

        <div className="glass-strong rounded-2xl p-8 shadow-[var(--shadow-elevated)]">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 gradient-bg rounded-xl flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-text mb-2">
              {isSignUp ? "Create your account" : "Welcome back"}
            </h1>
            <p className="text-text-secondary text-sm">
              {isSignUp ? "Start your journey with Loop today" : "Sign in to continue to Loop"}
            </p>
          </div>

          <div className="mb-6">
            <button
              onClick={() => handleSocialAuth()}
              disabled={isLoading}
              className="w-full flex items-center justify-center px-4 py-3 glass rounded-lg hover:bg-surface-hover transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Chrome className="h-5 w-5 mr-3 text-text-secondary" />
              <span className="text-text font-medium text-sm">Continue with Google</span>
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-bg-elevated text-text-muted text-xs">Or continue with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input id="name" name="fullname" type="text" required={isSignUp} value={formData.fullname} onChange={handleInputChange} className={inputClasses} placeholder="Your full name" />
                  </div>
                </div>
                <div>
                  <label htmlFor="username" className="block text-sm font-medium text-text-secondary mb-1.5">Username</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                    <input id="username" name="username" type="text" required={isSignUp} value={formData.username} onChange={handleInputChange} className={inputClasses} placeholder="Choose a username" />
                  </div>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input id="email" name="email" type="email" required value={formData.email} onChange={handleInputChange} className={inputClasses} placeholder="you@example.com" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-secondary mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                <input id="password" name="password" type={showPassword ? "text" : "password"} required value={formData.password} onChange={handleInputChange} className="w-full pl-10 pr-12 py-3 bg-bg-tertiary border border-border rounded-lg text-text placeholder-text-muted focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all outline-none" placeholder="Enter your password" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {isSignUp && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-secondary mb-1.5">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-muted" />
                  <input id="confirmPassword" name="confirmPassword" type={showPassword ? "text" : "password"} required={isSignUp} value={formData.confirmPassword} onChange={handleInputChange} className={inputClasses} placeholder="Confirm your password" />
                </div>
              </div>
            )}

            {!isSignUp && (
              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 text-text-secondary">
                  <input type="checkbox" className="h-4 w-4 rounded border-border bg-bg-tertiary text-primary focus:ring-primary/50" />
                  Remember me
                </label>
                <a href="#" className="text-primary-light hover:text-primary transition-colors">Forgot password?</a>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full gradient-bg text-white py-3 px-4 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  {isSignUp ? "Creating account..." : "Signing in..."}
                </div>
              ) : isSignUp ? "Create Account" : "Sign In"}
            </button>
          </form>

          {isSignUp && (
            <p className="mt-4 text-xs text-text-muted text-center">
              By creating an account, you agree to our{" "}
              <a href="#" className="text-primary-light hover:text-primary">Terms</a> and{" "}
              <a href="#" className="text-primary-light hover:text-primary">Privacy Policy</a>
            </p>
          )}

          <div className="mt-6 text-center">
            <p className="text-text-secondary text-sm">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); navigate(isSignUp ? "/auth/signin" : "/auth/signup"); }}
                className="text-primary-light hover:text-primary font-medium transition-colors"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-text-muted">🔒 Protected with enterprise-grade security</p>
        </div>
      </motion.div>

      <ToastContainer position="top-right" autoClose={3000} theme="dark" />
    </div>
  );
};
