import { useState } from "react";
import { Eye, EyeOff, Lock, Mail } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Logging in with:", formData);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glows to match the premium theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo / Branding */}
        <div className="text-center mb-8">
          <div className="font-display font-bold text-3xl tracking-tight mb-2">
            Market<span className="gold-gradient bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">Xpress</span>
          </div>
          <p className="font-body text-sm text-white/50">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input
                  type="email"
                  required
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-body text-xs uppercase tracking-wider text-white/60">
                  Password
                </label>
                <a href="#" className="font-body text-xs text-amber-400 hover:text-amber-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-body text-sm font-semibold py-3 px-5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/10 dynamic-btn"
            >
              Log In
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm text-white/40">
              Don't have an account?{" "}
              <a href="/signup" className="text-white hover:text-amber-400 font-medium transition-colors">
                Sign up
              </a>
            </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;