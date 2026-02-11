import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Target, TrendingUp, CheckCircle, Wallet } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";

const STORAGE_GOAL = "hbh_monthly_goal";
const STORAGE_PROGRESS = "hbh_monthly_progress";
const STORAGE_INCOME = "hbh_monthly_income";

const defaultGoal = 5000;
const defaultProgress = 2000;
const defaultIncome = 0;

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

function saveNumber(key: string, value: number) {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // ignore
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function ProfilePage() {
  const [goal, setGoalState] = useState(defaultGoal);
  const [progress, setProgressState] = useState(defaultProgress);
  const [income, setIncomeState] = useState(defaultIncome);
  const [goalInput, setGoalInput] = useState("");
  const [progressInput, setProgressInput] = useState("");
  const [incomeInput, setIncomeInput] = useState("");
  const [goalSaved, setGoalSaved] = useState(false);
  const [progressCheckedIn, setProgressCheckedIn] = useState(false);
  const [incomeSaved, setIncomeSaved] = useState(false);

  useEffect(() => {
    setGoalState(loadNumber(STORAGE_GOAL, defaultGoal));
    setProgressState(loadNumber(STORAGE_PROGRESS, defaultProgress));
    setIncomeState(loadNumber(STORAGE_INCOME, defaultIncome));
  }, []);

  useEffect(() => {
    setGoalInput("");
    setProgressInput("");
    setIncomeInput("");
  }, [goal, progress, income]);

  const progressPercent = goal > 0 ? Math.min(100, (progress / goal) * 100) : 0;

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(goalInput.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(val) && val >= 0) {
      setGoalState(val);
      saveNumber(STORAGE_GOAL, val);
      setGoalSaved(true);
      setTimeout(() => setGoalSaved(false), 2000);
    }
  };

  const handleCheckIn = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(progressInput.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(val) && val >= 0) {
      setProgressState(val);
      saveNumber(STORAGE_PROGRESS, val);
      setProgressCheckedIn(true);
      setTimeout(() => setProgressCheckedIn(false), 2000);
    }
  };

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(incomeInput.replace(/[^0-9.]/g, ""));
    if (Number.isFinite(val) && val >= 0) {
      setIncomeState(val);
      saveNumber(STORAGE_INCOME, val);
      setIncomeSaved(true);
      setTimeout(() => setIncomeSaved(false), 2000);
    }
  };

  return (
    <div className="container py-10 max-w-2xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Your Profile</h1>
        <p className="text-muted-foreground">Update your savings goal and check in with your progress anytime.</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" className="space-y-6">
        {/* Current progress summary */}
        <motion.div variants={fadeUp} custom={0}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Savings progress
              </CardTitle>
              <CardDescription>Your current progress toward your monthly savings goal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-sm font-medium text-muted-foreground">This month</span>
                <span className="text-2xl font-bold text-primary">
                  ${progress.toLocaleString()} <span className="text-sm font-normal text-muted-foreground">/ ${goal.toLocaleString()}</span>
                </span>
              </div>
              <Progress value={progressPercent} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {progressPercent >= 100 ? "You hit your goal!" : `You're ${progressPercent.toFixed(0)}% of the way to your monthly goal.`}
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly income */}
        <motion.div variants={fadeUp} custom={1}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-primary" />
                Monthly income
              </CardTitle>
              <CardDescription>Your gross monthly income (before taxes). We use this to estimate a home price range that fits your budget.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveIncome} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="income">Gross monthly income ($)</Label>
                  <Input
                    id="income"
                    type="text"
                    inputMode="numeric"
                    placeholder={income > 0 ? income.toLocaleString() : "e.g. 6000"}
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="outline" className="min-w-[120px]">
                    {incomeSaved ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      "Save income"
                    )}
                  </Button>
                </div>
              </form>
              {income > 0 && (
                <p className="text-sm text-muted-foreground mt-3">
                  Your budget and listings are based on ${income.toLocaleString()}/month.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Update goal */}
        <motion.div variants={fadeUp} custom={2}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                Update your goal
              </CardTitle>
              <CardDescription>Set your target monthly savings amount.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSaveGoal} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="goal">Monthly savings goal ($)</Label>
                  <Input
                    id="goal"
                    type="text"
                    inputMode="numeric"
                    placeholder={goal.toLocaleString()}
                    value={goalInput}
                    onChange={(e) => setGoalInput(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" className="min-w-[120px]">
                    {goalSaved ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Saved
                      </>
                    ) : (
                      "Save goal"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>

        {/* Check in / update progress */}
        <motion.div variants={fadeUp} custom={3}>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Check in your progress
              </CardTitle>
              <CardDescription>Update how much you've saved this month so far.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCheckIn} className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="progress">Amount saved this month ($)</Label>
                  <Input
                    id="progress"
                    type="text"
                    inputMode="numeric"
                    placeholder={progress.toLocaleString()}
                    value={progressInput}
                    onChange={(e) => setProgressInput(e.target.value)}
                    className="max-w-xs"
                  />
                </div>
                <div className="flex items-end">
                  <Button type="submit" variant="outline" className="min-w-[140px]">
                    {progressCheckedIn ? (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Updated
                      </>
                    ) : (
                      "Update progress"
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
