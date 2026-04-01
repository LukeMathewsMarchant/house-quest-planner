import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  DollarSign,
  CreditCard,
  Calendar,
  MapPin,
  TrendingUp,
  Percent,
  Sparkles,
  PiggyBank,
  Info,
} from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { getProgress, updateProgress } from "@/lib/api";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function OnboardingPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [budgetHomePrice, setBudgetHomePrice] = useState("");
  const [downPaymentPct, setDownPaymentPct] = useState("");
  const [monthlyIncome, setMonthlyIncome] = useState("");
  const [monthlyExpenses, setMonthlyExpenses] = useState("");
  const [creditScore, setCreditScore] = useState([720]);
  const [timeHorizon, setTimeHorizon] = useState("");
  const [homeState, setHomeState] = useState("");
  const [zipCodes, setZipCodes] = useState("");
  const [amountAlreadySaved, setAmountAlreadySaved] = useState("");
  const [monthlyContribution, setMonthlyContribution] = useState("");

  const { data: progress, isLoading } = useQuery({
    queryKey: ["progress", user?.UserID],
    queryFn: () => getProgress(user!.UserID),
    enabled: !!user?.UserID,
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    if (!progress) return;
    if (
      progress.budget != null &&
      progress.downPaymentPercentage != null &&
      (progress.budget > 0 || (progress.amountSaved ?? 0) > 0)
    ) {
      navigate("/dashboard", { replace: true });
      return;
    }
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
    setAmountAlreadySaved(progress.amountSaved ? String(Math.round(progress.amountSaved)) : "");
  }, [user, progress, navigate]);

  const completeMutation = useMutation({
    mutationFn: () =>
      updateProgress(user!.UserID, {
        budget: budgetHomePrice ? parseInt(budgetHomePrice, 10) : null,
        downPaymentPercentage: downPaymentPct ? parseFloat(downPaymentPct) : null,
        amountSaved: amountAlreadySaved ? parseFloat(amountAlreadySaved) || 0 : 0,
        creditScore: creditScore[0],
        monthlyIncome: monthlyIncome ? parseInt(monthlyIncome, 10) : null,
        monthlyExpenses: monthlyExpenses ? parseInt(monthlyExpenses, 10) : null,
        homeState: homeState || null,
        timeHorizon: timeHorizon || null,
        desiredZipCodes: zipCodes.trim() || null,
        contributionGoal: monthlyContribution ? parseFloat(monthlyContribution) : null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress", user?.UserID] });
      navigate("/dashboard");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    completeMutation.mutate();
  };

  if (!user) return null;
  if (isLoading) {
    return (
      <div className="container py-10 max-w-3xl">
        <p className="text-muted-foreground">Setting things up…</p>
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
        {/* Welcome / why we need this */}
        <motion.div
          variants={fadeUp}
          custom={0}
          className="bg-primary/10 border border-primary/20 rounded-xl p-6 text-center"
        >
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2">Let's create your personalized plan</h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            We'll use the details below to set your down payment goal, show your savings progress on
            your dashboard, and recommend listings in your budget and areas. You can update
            anything later in Profile.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Amount already saved - prominent for onboarding */}
          <motion.div variants={fadeUp} custom={1} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <PiggyBank className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Where you're starting</h2>
                <p className="text-sm text-muted-foreground">
                  Many people already have some savings. Enter how much you've saved toward your down
                  payment so we can show your real progress.
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-saved">Amount already saved ($)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                <Input
                  id="amount-saved"
                  type="number"
                  value={amountAlreadySaved}
                  onChange={(e) => setAmountAlreadySaved(e.target.value)}
                  className="pl-7"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Enter 0 if you're starting from scratch. This will appear on your dashboard.
              </p>
            </div>
          </motion.div>

          {/* Budget & Down Payment % */}
          <motion.div variants={fadeUp} custom={2} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Budget & down payment</h2>
                <p className="text-sm text-muted-foreground">
                  Your target home price and down payment % define your savings goal.
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="budget-price">Maximum home price</Label>
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
                <div className="flex items-center gap-1.5">
                  <Label htmlFor="down-payment-pct">Down payment %</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted text-muted-foreground cursor-default">
                          <Info className="h-3 w-3" />
                        </span>
                      </TooltipTrigger>
                      <TooltipContent side="right" className="max-w-[260px] text-sm leading-relaxed p-3">
                        A 20% down payment is the traditional goal — it avoids PMI
                        (Private Mortgage Insurance) and lowers your monthly payment.
                        However, many first-time buyers put down 3–10% using FHA or
                        conventional loans. Consider how much cash you'll have left
                        after the down payment, your monthly budget, and how long you
                        plan to stay in the home.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
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
                </span>
              </p>
            )}
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
                <h2 className="text-lg font-semibold">Credit score</h2>
                <p className="text-sm text-muted-foreground">Used for rate context.</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Credit score</Label>
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
                <span>300</span>
                <span>850</span>
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
                <h2 className="text-lg font-semibold">When you plan to buy</h2>
                <p className="text-sm text-muted-foreground">Helps us prioritize your timeline.</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="time-horizon">Timeline</Label>
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

          {/* Zip Codes */}
          <motion.div variants={fadeUp} custom={6} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preferred areas</h2>
                <p className="text-sm text-muted-foreground">
                  Zip codes where you're interested in buying (comma-separated).
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="home-state">Home state</Label>
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
                <Label htmlFor="zip-codes">Zip codes</Label>
                <Input
                  id="zip-codes"
                  type="text"
                  value={zipCodes}
                  onChange={(e) => setZipCodes(e.target.value)}
                  placeholder="83616, 83642, 83646"
                />
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} custom={7}>
            <Button
              type="submit"
              size="lg"
              className="w-full sm:w-auto"
              disabled={completeMutation.isPending}
            >
              {completeMutation.isPending ? "Setting up…" : "Create my plan"}
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
