import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { DollarSign, Home, TrendingUp, Building2, GraduationCap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

export default function DashboardPage() {
  const contribution = 2000;
  const goalContribution = 5000;
  const progressPercent = (contribution / goalContribution) * 100;

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
            { icon: Home, label: "Monthly Contribution", value: "$2,000", color: "text-primary" },
            { icon: TrendingUp, label: "Possible Price Range", value: "$400K – $500K", color: "text-accent" },
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

        {/* CTA buttons */}
        <motion.div variants={fadeUp} custom={3} className="grid sm:grid-cols-2 gap-4">
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
