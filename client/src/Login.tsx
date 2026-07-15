import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Added for routing
import { Eye, EyeOff, Lock, Mail, AlertTriangle, X } from "lucide-react";

const Login = () => {
  const navigate = useNavigate(); // Hook initialized to handle redirect
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("user_token");

    if (token) {
      console.log("User is logged in");

      const base64Payload = token.split(".")[1];
      const decodedPayload = JSON.parse(window.atob(base64Payload));

      if (decodedPayload.role?.toUpperCase() === "VENDOR") {
        navigate("/vendor-dashboard");
      } else {
        navigate("/buyer-dashboard");
      }
    } else {
      console.log("User is not logged in");
      
    }
  }, []);

  // Added 'async' keyword right here so 'await fetch' can work
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Logging in with:", formData);

    if (!formData.email) {
      setError("Please enter your email");
      return;
    }

    if (formData.password.length < 6) {
      setError("Your password must be more than six characters");
      return;
    }

    setIsLoading(true);

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL;

      const response = await fetch(`${baseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Incorrect Credentials.");
      }

      const extractedToken =
        data.token || data.accessToken || (data.data && data.data.token);

      if (extractedToken) {
        localStorage.setItem("user_token", extractedToken);
        const base64Payload = extractedToken.split(".")[1];
        const decodedPayload = JSON.parse(window.atob(base64Payload));

        if (decodedPayload.role?.toUpperCase() === "VENDOR") {
          navigate("/vendor-dashboard");
        } else {
          navigate("/buyer-dashboard");
        }
      } else {
        // Log the complete keys back to help narrow down what keys the backend object sent
        console.log("Unexpected Backend Payload Structure:", data);
        throw new Error(
          `Token key missing. Received object keys: [${Object.keys(data).join(", ")}]`,
        );
      }
    } catch (err) {
      console.error("Login verification barrier crash:", err);
      setError(err.message || "Connection refused by auth node cluster.");
    } finally {
      setIsLoading(false); // Corrected from 'setLoading' to match state hook name
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 relative overflow-hidden">
      {/* Background Glows to match the premium theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ERROR MODAL COMPONENT */}
      {error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-zinc-950 border border-red-500/30 rounded-2xl p-6 max-w-sm w-full shadow-2xl shadow-red-500/5 relative">
            <button
              type="button"
              onClick={() => setError("")} // Set to empty string to close modal
              className="absolute top-4 right-4 text-white/40 hover:text-white/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">
                Authentication Failed
              </h3>
              <p className="text-sm text-white/60 mb-6">{error}</p>
              <button
                onClick={() => setError("")} // Set to empty string to close modal
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
            Market
            <span className="gold-gradient bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              Xpress
            </span>
          </div>
          <p className="font-body text-sm text-white/50">
            Welcome back! Please enter your details.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white/[0.03] border border-white/[0.08] backdrop-blur-md rounded-2xl p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <label className="block font-body text-xs uppercase tracking-wider text-white/60 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  placeholder="name@company.com"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-4 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200 disabled:cursor-not-allowed"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            {/* Password Field */}
            <div className={isLoading ? "opacity-40 transition-opacity" : ""}>
              <div className="flex justify-between items-center mb-2">
                <label className="block font-body text-xs uppercase tracking-wider text-white/60">
                  Password
                </label>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-900" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl py-3 pl-12 pr-12 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400/50 focus:ring-1 focus:ring-amber-400/50 transition-all duration-200 disabled:cursor-not-allowed"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors disabled:cursor-not-allowed"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-amber-400 to-amber-500 text-black font-body text-sm font-semibold py-3 px-5 rounded-xl hover:from-amber-300 hover:to-amber-400 transition-all duration-200 shadow-lg shadow-amber-500/10 dynamic-btn flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin h-4 w-4 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Verifying...</span>
                </>
              ) : (
                "Log In"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-6 text-center">
            <p className="font-body text-sm text-white/40">
              Don't have an account?{" "}
              <a
                href="/signup"
                className="text-white hover:text-amber-400 font-medium transition-colors"
              >
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
