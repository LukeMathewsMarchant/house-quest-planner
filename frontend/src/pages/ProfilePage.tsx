import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Calendar, MapPin, TrendingUp, Save, Percent, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/components/ui/use-toast";
import { getProgress, updateProgress } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { toast } = useToast();
  const [budgetHomePrice, setBudgetHomePrice] = useState("");
  const [downPaymentPct, setDownPaymentPct] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");
  const [creditScore, setCreditScore] = useState([720]);
  const [timeHorizon, setTimeHorizon] = useState("");
  const [homeState, setHomeState] = useState("");
  const [zipCodes, setZipCodes] = useState("");
  const [amountSaved, setAmountSaved] = useState("");

  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress", user?.UserID],
    queryFn: () => getProgress(user!.UserID),
    enabled: !!user?.UserID,
  });

  useEffect(() => {
    if (!progress) return;
    setBudgetHomePrice(progress.budget != null ? String(progress.budget) : "");
    setDownPaymentPct(
      progress.downPaymentPercentage != null ? String(progress.downPaymentPercentage) : ""
    );
    const income = progress.monthlyIncome;
    const expenses = progress.monthlyExpenses;
    setMonthlyIncome(income != null ? String(income) : "");
    setMonthlyExpenses(expenses != null ? String(expenses) : "");
    if (progress.contributionGoal != null) {
      setMonthlyContribution(String(progress.contributionGoal));
    } else if (income != null && expenses != null) {
      setMonthlyContribution(String(income - expenses));
    } else {
      setMonthlyContribution("");
    }
    setCreditScore([progress.creditScore ?? 720]);
    setTimeHorizon(progress.timeHorizon ?? "");
    setHomeState(progress.homeState ?? "");
    setZipCodes(progress.desiredZipCodes ?? "");
    setAmountSaved(progress.amountSaved != null ? String(Math.round(progress.amountSaved)) : "");
  }, [progress]);

  const saveMutation = useMutation({
    mutationFn: () =>
      updateProgress(user!.UserID, {
        budget: budgetHomePrice ? parseInt(budgetHomePrice, 10) : null,
        downPaymentPercentage: downPaymentPct ? parseFloat(downPaymentPct) : null,
        amountSaved: amountSaved ? parseFloat(amountSaved) : 0,
        creditScore: creditScore[0],
        monthlyIncome: monthlyIncome ? parseInt(monthlyIncome, 10) : null,
        monthlyExpenses: monthlyExpenses ? parseInt(monthlyExpenses, 10) : null,
        homeState: homeState || null,
        timeHorizon: timeHorizon || null,
        desiredZipCodes: zipCodes.trim() || null,
        contributionGoal: monthlyContribution ? parseFloat(monthlyContribution) : null,
      }),
    onSuccess: (updatedProgress) => {
      queryClient.setQueryData(["progress", user?.UserID], updatedProgress);
      toast({
        title: "Profile saved",
        description: "We’ve updated your plan with your latest numbers.",
      });
    },
  });

  useEffect(() => {
    if (user == null) navigate("/login", { replace: true });
  }, [user, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate();
  };

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <p className="text-muted-foreground">Loading your profile…</p>
      </div>
    );
  }

  const monthlySavings =
    monthlyIncome && monthlyExpenses
      ? parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)
      : null;
  const goalFromDownPct =
    budgetHomePrice && downPaymentPct
      ? (parseInt(budgetHomePrice, 10) * parseFloat(downPaymentPct)) / 100
      : null;

  return (
    <div className="container py-10 max-w-3xl">
      <motion.div initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={fadeUp} custom={0}>
          <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
          <p className="text-muted-foreground">
            Set your preferences to get personalized budget recommendations and house listings.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Home Price & Down Payment % */}
          <motion.div variants={fadeUp} custom={1} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Budget & Down Payment</h2>
                <p className="text-sm text-muted-foreground">
                  Your target home price and down payment % set your savings goal on the dashboard.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-price">Maximum Home Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="budget-price"
                    type="number"
                    value={budgetHomePrice}
                    onChange={(e) => setBudgetHomePrice(e.target.value)}
                    className="pl-7"
                    placeholder="450000"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="down-payment-pct">Down Payment %</Label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="down-payment-pct"
                    type="number"
                    value={downPaymentPct}
                    onChange={(e) => setDownPaymentPct(e.target.value)}
                    className="pl-9"
                    placeholder="20"
                    min="0"
                    max="100"
                    step="0.5"
                  />
                </div>
              </div>
            </div>
            {goalFromDownPct != null && goalFromDownPct > 0 && (
              <p className="text-sm text-muted-foreground pt-2 border-t">
                Your down payment goal:{" "}
                <span className="font-semibold text-foreground">
                  ${Math.round(goalFromDownPct).toLocaleString()}
                </span>{" "}
                (shown on Dashboard)
              </p>
            )}
          </motion.div>

          {/* Current Amount Saved */}
          <motion.div variants={fadeUp} custom={2} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Current Amount Saved</h2>
                <p className="text-sm text-muted-foreground">
                  The total you've saved toward your down payment so far. Update this if your savings change.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-saved">Amount Saved</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount-saved"
                  type="number"
                  value={amountSaved}
                  onChange={(e) => setAmountSaved(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Life happens — if you need to dip into savings, update this to keep your dashboard accurate.
              </p>
            </div>
          </motion.div>

          {/* Monthly Income, Expenses & Contribution */}
          <motion.div variants={fadeUp} custom={3} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Monthly Finances</h2>
                <p className="text-sm text-muted-foreground">
                  Your income, expenses, and how much you&apos;ll set aside for your down payment each month.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="monthly-income">Monthly Income</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monthly-income"
                    type="number"
                    value={monthlyIncome}
                    onChange={(e) => setMonthlyIncome(e.target.value)}
                    className="pl-7"
                    placeholder="6000"
                    min="0"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="monthly-expenses">Monthly Expenses</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monthly-expenses"
                    type="number"
                    value={monthlyExpenses}
                    onChange={(e) => setMonthlyExpenses(e.target.value)}
                    className="pl-7"
                    placeholder="3500"
                    min="0"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2 border-t space-y-3">
              <p className="text-sm text-muted-foreground">
                Estimated monthly savings:{" "}
                <span className="font-semibold text-foreground">
                  {monthlySavings != null ? `$${monthlySavings.toLocaleString()}` : "—"}
                </span>
                <span className="text-xs text-muted-foreground"> (income − expenses)</span>
              </p>

              <div className="space-y-2">
                <Label htmlFor="monthly-contribution">
                  How much of your monthly savings would you like to contribute toward your down payment?
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    id="monthly-contribution"
                    type="number"
                    value={monthlyContribution}
                    onChange={(e) => setMonthlyContribution(e.target.value)}
                    className="pl-7"
                    placeholder={monthlySavings != null ? String(monthlySavings) : "500"}
                    min="0"
                    max={monthlySavings != null && monthlySavings > 0 ? monthlySavings : undefined}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  This is the amount we use to estimate your timeline on the Dashboard.
                  {monthlySavings != null && monthlySavings > 0
                    ? ` (Your estimated savings are $${monthlySavings.toLocaleString()}/mo.)`
                    : ""}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Credit Score */}
          <motion.div variants={fadeUp} custom={4} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Credit Score</h2>
                <p className="text-sm text-muted-foreground">Your current credit score</p>
              </div>
            </div>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label>Credit Score</Label>
                  <span className="text-lg font-bold text-primary">{creditScore[0]}</span>
                </div>
                <Slider
                  value={creditScore}
                  onValueChange={setCreditScore}
                  min={300}
                  max={850}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>300 (Poor)</span>
                  <span>850 (Excellent)</span>
                </div>
              </div>
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">
                  {creditScore[0] >= 740
                    ? "Excellent credit - You'll qualify for the best mortgage rates!"
                    : creditScore[0] >= 670
                    ? "Good credit - You should qualify for competitive rates."
                    : creditScore[0] >= 580
                    ? "Fair credit - Consider improving your score for better rates."
                    : "Poor credit - Focus on improving your credit score before buying."}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Time Horizon */}
          <motion.div variants={fadeUp} custom={5} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Time Horizon</h2>
                <p className="text-sm text-muted-foreground">When do you plan to buy a home?</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-horizon">Ideal Purchase Timeline</Label>
              <Select value={timeHorizon} onValueChange={setTimeHorizon}>
                <SelectTrigger id="time-horizon">
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3-months">Within 3 months</SelectItem>
                  <SelectItem value="6-months">Within 6 months</SelectItem>
                  <SelectItem value="1-year">Within 1 year</SelectItem>
                  <SelectItem value="2-years">Within 2 years</SelectItem>
                  <SelectItem value="3-years">Within 3 years</SelectItem>
                  <SelectItem value="5-years">Within 5 years</SelectItem>
                  <SelectItem value="exploring">Just exploring</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </motion.div>

          {/* Preferred Zip Codes */}
          <motion.div variants={fadeUp} custom={6} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preferred Locations</h2>
                <p className="text-sm text-muted-foreground">Zip codes where you're interested in buying</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-state">Home State</Label>
                <Input
                  id="home-state"
                  type="text"
                  value={homeState}
                  onChange={(e) => setHomeState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="UT"
                  maxLength={2}
                />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="zip-codes">Zip Codes</Label>
                <Input
                  id="zip-codes"
                  type="text"
                  value={zipCodes}
                  onChange={(e) => setZipCodes(e.target.value)}
                  placeholder="83616, 83642, 83646 (comma-separated)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter multiple zip codes separated by commas
                </p>
              </div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fadeUp} custom={7}>
            <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={saveMutation.isPending}>
              <Save className="h-4 w-4 mr-2" />
              {saveMutation.isPending ? "Saving…" : "Save Profile"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
