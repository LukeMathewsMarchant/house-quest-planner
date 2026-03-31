import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin, ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SingleHomeMap } from "@/components/saved-homes/SingleHomeMap";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { getHome, getProgress, type Home as HomeType } from "@/lib/api";
import {
  calculateDownPayment,
  calculateRemainingSavings,
  calculateAffordabilityTimeline,
  calculateSavingsNeededForTimeline,
} from "@/lib/affordability";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function HouseDetailsPage() {
  const { homeId } = useParams<{ homeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const id = homeId ? parseInt(homeId, 10) : NaN;

  useEffect(() => {
    if (!user) navigate("/login", { replace: true });
  }, [user, navigate]);

  const {
    data: home,
    isLoading: loadingHome,
    error: homeError,
  } = useQuery<HomeType>({
    queryKey: ["home", id],
    queryFn: () => getHome(id),
    enabled: !!user && !Number.isNaN(id),
  });

  const {
    data: progress,
    isLoading: loadingProgress,
    error: progressError,
  } = useQuery({
    queryKey: ["progress", user?.UserID],
    queryFn: () => getProgress(user!.UserID),
    enabled: !!user?.UserID,
  });

  if (!user) return null;

  if (loadingHome || loadingProgress) {
    return (
      <div className="container py-10 max-w-4xl">
        <p className="text-muted-foreground">Loading home details…</p>
      </div>
    );
  }

  if (homeError || progressError || !home || !progress) {
    return (
      <div className="container py-10 max-w-4xl text-center">
        <h1 className="text-2xl font-bold mb-4">Home not found</h1>
        <p className="text-muted-foreground mb-6">
          We couldn&apos;t load this home. It may have been removed from your saved list.
        </p>
        <Button asChild>
          <Link to="/listings">Back to Saved Homes</Link>
        </Button>
      </div>
    );
  }

  const downPaymentNeeded = calculateDownPayment(home.Price ?? 0, progress.downPaymentPercentage);
  const remainingSavings = calculateRemainingSavings(downPaymentNeeded, progress.amountSaved);
  const monthlySavings = progress.contributionGoal ?? null;
  const timeline = calculateAffordabilityTimeline(remainingSavings, monthlySavings);
  const savingsNeeded = calculateSavingsNeededForTimeline(remainingSavings, progress.timeHorizon);
  const timelineSavingsNeededLabel = savingsNeeded
    ? `$${Math.round(savingsNeeded.monthlyNeeded).toLocaleString()}/mo (${savingsNeeded.targetLabel})`
    : null;
  const timelineSavingsIncreaseLabel = (() => {
    if (!savingsNeeded) return null;
    if (monthlySavings == null) return null;

    if (savingsNeeded.monthlyNeeded <= 0) {
      return "You're already there based on your current savings.";
    }

    if (savingsNeeded.monthlyNeeded <= monthlySavings) {
      return "You're already saving enough to hit your timeline.";
    }

    const increase = Math.ceil(savingsNeeded.monthlyNeeded - monthlySavings);
    return `That's about +$${increase.toLocaleString()}/mo more than you're saving now.`;
  })();
  const progressPercent = downPaymentNeeded > 0 ? Math.min(100, (progress.amountSaved / downPaymentNeeded) * 100) : 0;

  const cityState = [home.City, home.State].filter(Boolean).join(", ");
  const fullAddress = [home.StreetAddress, home.City, home.State, home.Zip]
    .filter(Boolean)
    .join(", ");

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} custom={0} className="flex items-center justify-between gap-3">
          <Button variant="ghost" onClick={() => navigate(-1)} className="px-2">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
        </motion.div>

        <motion.div variants={fadeUp} custom={1} className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold">{home.StreetAddress}</h1>
          <div className="flex items-center text-muted-foreground gap-2">
            <MapPin className="h-4 w-4" />
            <span className="text-sm">{cityState}</span>
          </div>
          <p className="text-3xl font-bold text-primary">
            {home.Price != null ? `$${home.Price.toLocaleString()}` : "—"}
          </p>
        </motion.div>

        <motion.div
          variants={fadeUp}
          custom={2}
          className="grid gap-6 md:grid-cols-[2fr,1.5fr]"
        >
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Property details</CardTitle>
              <CardDescription>Key specs for this home.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 pt-0">
              <div>
                <p className="text-xs text-muted-foreground">Bedrooms</p>
                <p className="font-semibold text-sm">{home.Bedrooms ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Bathrooms</p>
                <p className="font-semibold text-sm">{home.Bathrooms ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Square feet</p>
                <p className="font-semibold text-sm">
                  {home.SquareFeet != null ? home.SquareFeet.toLocaleString() : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Zip</p>
                <p className="font-semibold text-sm">{home.Zip ?? "—"}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg">User financial snapshot</CardTitle>
              <CardDescription>Pulled from your profile and dashboard.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Budget</span>
                <span className="font-semibold">
                  {progress.budget != null ? `$${progress.budget.toLocaleString()}` : "Set in Profile"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount saved</span>
                <span className="font-semibold">${progress.amountSaved.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down payment target %</span>
                <span className="font-semibold">
                  {progress.downPaymentPercentage != null
                    ? `${progress.downPaymentPercentage.toFixed(1)}%`
                    : "Set in Profile"}
                </span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} custom={3} className="grid gap-6 md:grid-cols-2">
          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Down payment analysis</CardTitle>
              <CardDescription>How this home compares to your savings.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Down payment needed</span>
                <span className="font-semibold">
                  {downPaymentNeeded > 0 ? `$${Math.round(downPaymentNeeded).toLocaleString()}` : "Set in Profile"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Remaining savings</span>
                <span className="font-semibold">
                  {downPaymentNeeded > 0 ? `$${Math.round(remainingSavings).toLocaleString()}` : "—"}
                </span>
              </div>
              {downPaymentNeeded > 0 && (
                <div className="space-y-2 pt-1">
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    Saved ${progress.amountSaved.toLocaleString()} of $
                    {Math.round(downPaymentNeeded).toLocaleString()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Affordability timeline</CardTitle>
              <CardDescription>
                Estimated time until you reach the down payment goal based on your monthly savings.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 pt-0 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Monthly savings toward down payment</span>
                <span className="font-semibold">
                  {progress.contributionGoal != null
                    ? `$${Math.round(progress.contributionGoal).toLocaleString()}`
                    : "Set in Profile"}
                </span>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Estimated time until affordable</p>
                <p className="text-base font-semibold">
                  {timeline?.label ?? "Add a contribution amount and down payment % to see this."}
                </p>
              </div>

              {timelineSavingsNeededLabel && (
                <div className="pt-1">
                  <p className="text-xs text-muted-foreground mb-1">Savings needed to hit your timeline</p>
                  <p className="text-base font-semibold">{timelineSavingsNeededLabel}</p>
                  {timelineSavingsIncreaseLabel && (
                    <p className="text-xs text-muted-foreground mt-1">{timelineSavingsIncreaseLabel}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {fullAddress && (
          <motion.div variants={fadeUp} custom={4}>
            <Card className="shadow-card overflow-hidden">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Location
                </CardTitle>
                <CardDescription>{fullAddress}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-0">
                <SingleHomeMap
                  address={fullAddress}
                  className="h-[300px] rounded-b-xl -mx-6 -mb-0"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {home.ZillowURL && (
          <motion.div variants={fadeUp} custom={5} className="flex justify-between items-center gap-4">
            <div className="text-xs text-muted-foreground">
              Want to review the full listing details? Open this home on Zillow.
            </div>
            <Button asChild variant="outline">
              <a href={home.ZillowURL} target="_blank" rel="noreferrer">
                Open Zillow listing
                <ExternalLink className="h-4 w-4 ml-1" />
              </a>
            </Button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
