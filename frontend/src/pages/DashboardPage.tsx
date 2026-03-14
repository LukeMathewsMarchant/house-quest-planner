import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, Home, TrendingUp, Building2, GraduationCap, Plus } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { CircularProgress } from "@/components/ui/circular-progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { getProgress, addContribution } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [contributionAmount, setContributionAmount] = useState("");

  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress", user?.UserID],
    queryFn: () => getProgress(user!.UserID),
    enabled: !!user?.UserID,
  });

  const contributionMutation = useMutation({
    mutationFn: (amount: number) => addContribution(user!.UserID, amount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", user?.UserID] });
      setContributionAmount("");
    },
  });

  const handleAddContribution = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(contributionAmount);
    if (isNaN(num) || num <= 0) return;
    contributionMutation.mutate(num);
  };

  useEffect(() => {
    if (user == null) navigate("/login", { replace: true });
  }, [user, navigate]);

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <p className="text-muted-foreground">Loading your progress…</p>
      </div>
    );
  }

  const saved = progress?.amountSaved ?? 0;
  const budget = progress?.budget ?? null;
  const downPct = progress?.downPaymentPercentage ?? null;
  const downPaymentGoal =
    budget != null && downPct != null ? (budget * downPct) / 100 : 0;
  const progressPercent =
    downPaymentGoal > 0 ? Math.min(100, (saved / downPaymentGoal) * 100) : 0;
  const monthlyIncome = progress?.monthlyIncome ?? null;
  const monthlyExpenses = progress?.monthlyExpenses ?? null;
  const monthlySavings =
    monthlyIncome != null && monthlyExpenses != null ? monthlyIncome - monthlyExpenses : null;
  const monthlyContribution = progress?.contributionGoal ?? null;

  return (
    <div className="container py-10 max-w-3xl">
      <motion.div initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={fadeUp} custom={0}>
          <h1 className="text-3xl font-bold mb-2">Budget Progress</h1>
          <p className="text-muted-foreground">Track your savings and see what you can afford.</p>
        </motion.div>

        {/* Circular Progress */}
        <motion.div variants={fadeUp} custom={1} className="bg-card rounded-xl p-8 shadow-card">
          <div className="flex flex-col items-center space-y-6">
            <CircularProgress value={progressPercent} size={200} strokeWidth={12}>
              <Home className="h-12 w-12 text-primary" />
            </CircularProgress>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Your Savings Progress</h2>
              <p className="text-lg text-muted-foreground">
                ${saved.toLocaleString()} of $
                {downPaymentGoal > 0 ? Math.round(downPaymentGoal).toLocaleString() : "—"} saved
              </p>
              <p className="text-sm text-muted-foreground">
                {downPaymentGoal > 0
                  ? `${Math.round(progressPercent)}% toward your down payment goal`
                  : "Set your budget and down payment % in Profile to see your goal."}
              </p>
            </div>

            {downPaymentGoal > 0 && (
              <div className="w-full max-w-md space-y-2">
                <Progress value={progressPercent} className="h-2" />
              </div>
            )}
          </div>
        </motion.div>

        {/* Add contribution */}
        <motion.div variants={fadeUp} custom={2} className="bg-card rounded-xl p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-3">Add a contribution</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Record money you've saved toward your down payment. It will update your progress above.
          </p>
          <form onSubmit={handleAddContribution} className="flex flex-wrap items-end gap-3">
            <div className="flex-1 min-w-[120px] space-y-2">
              <Label htmlFor="contribution-amount">Amount ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="contribution-amount"
                  type="number"
                  placeholder="500"
                  min="0"
                  step="1"
                  value={contributionAmount}
                  onChange={(e) => setContributionAmount(e.target.value)}
                  className="pl-7"
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={
                !contributionAmount ||
                parseFloat(contributionAmount) <= 0 ||
                contributionMutation.isPending
              }
            >
              <Plus className="h-4 w-4 mr-2" />
              {contributionMutation.isPending ? "Adding…" : "Add"}
            </Button>
          </form>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} custom={3} className="grid sm:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-5 shadow-card flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Home className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly savings</p>
              <p className="text-lg font-bold">
                {monthlySavings != null ? `$${monthlySavings.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <TrendingUp className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Budget (max price)</p>
              <p className="text-lg font-bold">
                {budget != null ? `$${budget.toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
          <div className="bg-card rounded-xl p-5 shadow-card flex items-start gap-4">
            <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Monthly contribution</p>
              <p className="text-lg font-bold">
                {monthlyContribution != null ? `$${Math.round(monthlyContribution).toLocaleString()}` : "—"}
              </p>
            </div>
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div variants={fadeUp} custom={4} className="grid sm:grid-cols-2 gap-4">
          <Button asChild size="lg" className="h-auto py-4 justify-start gap-3">
            <Link to="/listings">
              <Building2 className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">View Listings in Your Budget</p>
                <p className="text-xs opacity-80">Browse homes you can afford</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-4 justify-start gap-3">
            <Link to="/profile">
              <DollarSign className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Edit profile & goal</p>
                <p className="text-xs opacity-70">Budget, down %, zip codes</p>
              </div>
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-auto py-4 justify-start gap-3 sm:col-span-2">
            <Link to="/tutorials">
              <GraduationCap className="h-5 w-5" />
              <div className="text-left">
                <p className="font-semibold">Home Buying Tutorials</p>
                <p className="text-xs opacity-70">Learn the essentials</p>
              </div>
            </Link>
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
