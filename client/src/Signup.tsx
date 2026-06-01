import { useState } from "react";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "buyer",  
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Registering user:", formData);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden py-12">
      {/* Background Glows */}
      <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

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
            
            {/* Account Type Selector (Matches the "For Vendors" distinction in your Navbar) */}
            <div>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                I want to join as a
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "buyer" })}
                  className={`py-2 px-4 rounded-xl border text-sm font-body transition-all duration-200 ${
                    formData.role === "buyer"
                      ? "bg-amber-400/10 border-amber-400 text-amber-400"
                      : "bg-white/[0.02] border-white/[0.08] text-white/60 hover:text-white hover:border-white/20"
                  }`}
                >
                  Buyer
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, role: "vendor" })}
                  className={`py-2 px-4 rounded-xl border text-sm font-body transition-all duration-200 ${
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
            <div>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  required
                  placeholder="John Doe"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            {/* Email Field */}
            <div>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
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
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 8 characters"
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
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-body text-sm font-semibold py-3 px-5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/10 mt-2"
            >
              Create Account
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