import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Added for redirecting after registration
import { Eye, EyeOff, Lock, Mail, User, AlertTriangle, X } from "lucide-react";

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer", 
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Client-side structural validations
    if (!formData.name.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!formData.email) {
      setError("Please enter a valid email address.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Your password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);

    try {
      // Pull base registry route (ex: http://localhost:5000/api/auth/register)
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: formData.role.toUpperCase(), // Normalizes 'buyer'/'vendor' to backend match ('BUYER'/'VENDOR')
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed. Try again.");
      }

      const extractedToken = data.token || data.accessToken || (data.data && data.data.token);

      if (extractedToken) {
        localStorage.setItem("user_token", extractedToken);
        navigate("/dashboard");
      } else {
        // Fallback redirect if your backend doesn't instantly sign them in on signup
        navigate("/login");
      }

    } catch (err) {
      console.error("Signup validation barrier crash:", err);
      setError(err.message || "Connection refused by registration node cluster.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ERROR MODAL COMPONENT */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/5 relative">
            <button 
              type="button"
              onClick={() => setError("")}
              className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Registration Failed</h3>
              <p className="text-sm text-white/60 mb-6">{error}</p>
              <button
                onClick={() => setError("")}
                className="w-full bg-white/10 hover:bg-white/15 text-white text-sm font-medium py-2.5 px-4 rounded-xl transition-all border border-white/5"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="w-full max-w-md z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="font-display font-bold text-3xl tracking-tight mb-2">
            Market<span className="gold-gradient bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">Xpress</span>
          </div>
          <p className="font-body text-sm text-white/50">
            Create your account and start scaling today.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Account Type Selector */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setFormData({ ...formData, role: "buyer" })}
                  className={`py-2 px-4 rounded-xl border text-sm font-body transition-all duration-200 disabled:cursor-not-allowed ${
                    formData.role === "buyer"
                      ? "bg-amber-400/10 border-amber-400 text-amber-400"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setFormData({ ...formData, role: "vendor" })}
                  className={`py-2 px-4 rounded-xl border text-sm font-body transition-all duration-200 disabled:cursor-not-allowed ${
                    formData.role === "vendor"
                      ? "bg-amber-400/10 border-amber-400 text-amber-400"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  Vendor
                </button>
              </div>
            </div>

            {/* Full Name Field */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  disabled={isLoading}
                  placeholder="John Doe"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200 disabled:cursor-not-allowed"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200 disabled:cursor-not-allowed"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  placeholder="Minimum 8 characters"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200 disabled:cursor-not-allowed"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-body text-sm font-semibold py-3 px-5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/10 mt-2 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-black" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Registering...</span>
                </>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm text-white/40">
              Already have an account?{" "}
              <a href="/login" className="text-white hover:text-amber-400 font-medium transition-colors">
                Sign in
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Signup;