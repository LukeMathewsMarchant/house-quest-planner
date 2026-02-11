import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Home, TrendingUp, Building2, GraduationCap, Info } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { getBudgetSummary } from "@/lib/budget";

const STORAGE_GOAL = "hbh_monthly_goal";
const STORAGE_PROGRESS = "hbh_monthly_progress";
const STORAGE_INCOME = "hbh_monthly_income";

function loadNumber(key: string, fallback: number): number {
  try {
    const v = localStorage.getItem(key);
    if (v == null) return fallback;
    const n = Number(v);
    return Number.isFinite(n) && n >= 0 ? n : fallback;
  } catch {
    return fallback;
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function DashboardPage() {
  const [contribution, setContribution] = useState(2000);
  const [goalContribution, setGoalContribution] = useState(5000);
  const [income, setIncome] = useState(0);

  useEffect(() => {
    setContribution(loadNumber(STORAGE_PROGRESS, 2000));
    setGoalContribution(loadNumber(STORAGE_GOAL, 5000));
    setIncome(loadNumber(STORAGE_INCOME, 0));
  }, []);

  const budget = useMemo(() => getBudgetSummary(income), [income]);
  const progressPercent = goalContribution > 0 ? (contribution / goalContribution) * 100 : 0;

  return (
    <div className="container py-10 max-w-3xl">
      <motion.div initial="hidden" animate="visible" className="space-y-8">
        <motion.div variants={fadeUp} custom={0}>
          <h1 className="text-3xl font-bold mb-2">Budget Progress</h1>
          <p className="text-muted-foreground">Track your savings and see what you can afford.</p>
        </motion.div>

        {/* Progress bar */}
        <motion.div variants={fadeUp} custom={1} className="bg-card rounded-xl p-6 shadow-card space-y-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-sm font-medium text-muted-foreground">Monthly Savings</span>
            <span className="text-2xl font-bold text-primary">${contribution.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ ${goalContribution.toLocaleString()}</span></span>
          </div>
          <Progress value={progressPercent} className="h-3" />
          <p className="text-xs text-muted-foreground">You're {progressPercent}% of the way to your monthly savings goal!</p>
        </motion.div>

        {/* Stats */}
        <motion.div variants={fadeUp} custom={2} className="grid sm:grid-cols-3 gap-4">
          {[
            { icon: Home, label: "Monthly Contribution", value: `$${contribution.toLocaleString()}`, color: "text-primary" },
            { icon: TrendingUp, label: "Possible Price Range", value: budget.priceRangeFormatted, color: "text-accent" },
            { icon: DollarSign, label: "Est. Mortgage Rate", value: "6.25%", color: "text-primary" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="bg-card rounded-xl p-5 shadow-card flex items-start gap-4"
            >
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Why this range? */}
        <motion.div variants={fadeUp} custom={3} className="bg-card rounded-xl p-6 shadow-card border border-primary/10">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-5 w-5 text-primary shrink-0" />
            <h2 className="text-lg font-semibold">Why this range fits you</h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">{budget.explanation}</p>
          {!budget.hasValidIncome && (
            <p className="text-sm text-primary mt-3">
              <Link to="/profile" className="underline font-medium">Add your monthly income in Profile</Link> to see a personalized range and explanation.
            </p>
          )}
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
