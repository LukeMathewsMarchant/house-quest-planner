import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home as HomeIcon, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getProgress, getWishlist, createHome, type Home } from "@/lib/api";
import { calculateDownPayment, calculateRemainingSavings, calculateAffordabilityTimeline } from "@/lib/affordability";
import { AddHouseModal } from "@/components/saved-homes/AddHouseModal";
import { HomeCard } from "@/components/saved-homes/HomeCard";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function ListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);

  const { data: progress } = useQuery({
    queryKey: ["progress", user?.UserID],
    queryFn: () => getProgress(user!.UserID),
    enabled: !!user?.UserID,
  });

  const {
    data: homes,
    isLoading: loadingHomes,
  } = useQuery<Home[]>({
    queryKey: ["wishlist", user?.UserID],
    queryFn: () => getWishlist(user!.UserID),
    enabled: !!user?.UserID,
  });

  const addHomeMutation = useMutation({
    mutationFn: (values: {
      zillowUrl: string;
      streetAddress: string;
      city: string;
      state: string;
      zip: string;
      price: number;
      bedrooms: number;
      bathrooms: number;
      squareFeet: number;
    }) => createHome(user!.UserID, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.UserID] });
      setAddOpen(false);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to save home";
      // Simple user feedback for now
      // eslint-disable-next-line no-alert
      alert(message);
    },
  });

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) return null;

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">Saved Homes</h1>
          <p className="text-muted-foreground">
            Track homes you&apos;re considering and see how they compare to your savings and budget.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="w-full sm:w-auto">
          <Plus className="h-4 w-4 mr-2" />
          Add House
        </Button>
      </motion.div>

      {loadingHomes ? (
        <p className="text-muted-foreground">Loading your saved homes…</p>
      ) : !homes || homes.length === 0 ? (
        <div className="bg-card rounded-xl p-8 shadow-card text-center border border-dashed border-border">
          <div className="flex justify-center mb-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <HomeIcon className="h-6 w-6 text-primary" />
            </div>
          </div>
          <h2 className="text-xl font-semibold mb-1">No homes saved yet</h2>
          <p className="text-muted-foreground mb-4 max-w-md mx-auto">
            Add homes from Zillow and we&apos;ll show how each one fits your budget, savings, and timeline.
          </p>
          <Button onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add your first house
          </Button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="visible"
          className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {homes.map((home, index) => {
            const downPaymentNeeded = calculateDownPayment(home.Price ?? 0, progress?.downPaymentPercentage ?? null);
            const remainingSavings = calculateRemainingSavings(downPaymentNeeded, progress?.amountSaved);
            const monthlySavings = progress?.contributionGoal ?? null;
            const timeline = calculateAffordabilityTimeline(remainingSavings, monthlySavings);

            return (
              <HomeCard
                key={home.HomeID}
                home={home}
                index={index}
                fadeUp={fadeUp}
                progress={progress ?? null}
                downPaymentNeeded={downPaymentNeeded}
                remainingSavings={remainingSavings}
                timelineLabel={timeline?.label ?? null}
              />
            );
          })}
        </motion.div>
      )}

      <AddHouseModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={(values) => addHomeMutation.mutate(values)}
        submitting={addHomeMutation.isPending}
      />
    </div>
  );
}
