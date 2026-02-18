import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn, UserPlus, Mail, Lock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isCreateAccount) {
        await register(
          email,
          password,
          zipcode.trim() ? parseInt(zipcode, 10) : undefined
        );
        navigate("/onboarding");
      } else {
        await login(email, password);
        navigate("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-10 max-w-md">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="text-center">
          <h1 className="text-3xl font-bold mb-2">
            {isCreateAccount ? "Create account" : "Sign in"}
          </h1>
          <p className="text-muted-foreground">
            {isCreateAccount
              ? "Join Home Buyer's Handbook to track your progress and save listings."
              : "Welcome back. Sign in to continue your home buying journey."}
          </p>
        </motion.div>

        <motion.div variants={fadeUp} custom={1}>
          <Card className="bg-card rounded-xl shadow-card border-0">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-xl flex items-center gap-2">
                {isCreateAccount ? (
                  <UserPlus className="h-5 w-5 text-primary" />
                ) : (
                  <LogIn className="h-5 w-5 text-primary" />
                )}
                {isCreateAccount ? "Create account" : "Sign in"}
              </CardTitle>
              <CardDescription>
                {isCreateAccount
                  ? "We'll use defaults for role and premium. You can update profile later."
                  : "Use your email and password."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 rounded-md px-3 py-2">
                    {error}
                  </p>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9"
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      required
                      minLength={6}
                      autoComplete={isCreateAccount ? "new-password" : "current-password"}
                    />
                  </div>
                  {isCreateAccount && (
                    <p className="text-xs text-muted-foreground">At least 6 characters</p>
                  )}
                </div>
                {isCreateAccount && (
                  <div className="space-y-2">
                    <Label htmlFor="zipcode">Zip code (optional)</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="zipcode"
                        type="text"
                        placeholder="90210"
                        value={zipcode}
                        onChange={(e) => setZipcode(e.target.value.replace(/\D/g, "").slice(0, 5))}
                        className="pl-9"
                        maxLength={5}
                        autoComplete="postal-code"
                      />
                    </div>
                  </div>
                )}
                <Button type="submit" className="w-full" size="lg" disabled={loading}>
                  {loading ? "Please wait…" : isCreateAccount ? "Create account" : "Sign in"}
                </Button>
              </form>
              <p className="text-center text-sm text-muted-foreground">
                {isCreateAccount ? "Already have an account?" : "Don't have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateAccount(!isCreateAccount);
                    setError("");
                  }}
                  className="text-primary font-medium hover:underline"
                >
                  {isCreateAccount ? "Sign in" : "Create account"}
                </button>
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} custom={2} className="text-center">
          <Button variant="outline" asChild>
            <Link to="/">Back to home</Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
