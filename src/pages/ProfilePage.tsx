import { useState } from "react";
import { motion } from "framer-motion";
import { DollarSign, CreditCard, Calendar, MapPin, TrendingUp, Save } from "lucide-react";
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function ProfilePage() {
  const [budgetHomePrice, setBudgetHomePrice] = useState("450000");
  const [monthlyIncome, setMonthlyIncome] = useState("6000");
  const [monthlyExpenses, setMonthlyExpenses] = useState("3500");
  const [creditScore, setCreditScore] = useState([720]);
  const [timeHorizon, setTimeHorizon] = useState("");
  const [zipCodes, setZipCodes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Save to database later
    console.log({
      budgetHomePrice,
      monthlyIncome,
      monthlyExpenses,
      creditScore: creditScore[0],
      timeHorizon,
      zipCodes: zipCodes.split(",").map((z) => z.trim()).filter(Boolean),
    });
    // Show success message (could add toast here)
    alert("Profile saved successfully!");
  };

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
          {/* Budget Home Price */}
          <motion.div variants={fadeUp} custom={1} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Budget Home Price</h2>
                <p className="text-sm text-muted-foreground">Your target home purchase price</p>
              </div>
            </div>
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
          </motion.div>

          {/* Monthly Income & Expenses */}
          <motion.div variants={fadeUp} custom={2} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Monthly Finances</h2>
                <p className="text-sm text-muted-foreground">Your income and expenses</p>
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
            {monthlyIncome && monthlyExpenses && (
              <p className="text-sm text-muted-foreground pt-2 border-t">
                Monthly savings: <span className="font-semibold text-foreground">
                  ${(parseFloat(monthlyIncome) - parseFloat(monthlyExpenses)).toLocaleString()}
                </span>
              </p>
            )}
          </motion.div>

          {/* Credit Score */}
          <motion.div variants={fadeUp} custom={3} className="bg-card rounded-xl p-6 shadow-card space-y-4">
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
          <motion.div variants={fadeUp} custom={4} className="bg-card rounded-xl p-6 shadow-card space-y-4">
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
          <motion.div variants={fadeUp} custom={5} className="bg-card rounded-xl p-6 shadow-card space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">Preferred Locations</h2>
                <p className="text-sm text-muted-foreground">Zip codes where you're interested in buying</p>
              </div>
            </div>
            <div className="space-y-2">
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
          </motion.div>

          {/* Submit Button */}
          <motion.div variants={fadeUp} custom={6}>
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              <Save className="h-4 w-4 mr-2" />
              Save Profile
            </Button>
          </motion.div>
        </form>
      </motion.div>
    </div>
  );
}
