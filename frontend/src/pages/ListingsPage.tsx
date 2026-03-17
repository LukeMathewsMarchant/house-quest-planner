import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Home as HomeIcon, Plus } from "lucide-react";
import heroHome from "@/assets/hero-home.jpg";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getProgress, getWishlist, createHome, updateHome, deleteHome, type Home } from "@/lib/api";
import { calculateDownPayment, calculateRemainingSavings, calculateAffordabilityTimeline } from "@/lib/affordability";
import { AddHouseModal, type HouseFormValues } from "@/components/saved-homes/AddHouseModal";
import { HomeCard } from "@/components/saved-homes/HomeCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function ListingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [addOpen, setAddOpen] = useState(false);
  const [editHome, setEditHome] = useState<Home | null>(null);
  const [deleteHomeTarget, setDeleteHomeTarget] = useState<Home | null>(null);

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

  const editHomeMutation = useMutation({
    mutationFn: (values: HouseFormValues) => updateHome(user!.UserID, editHome!.HomeID, values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.UserID] });
      setEditHome(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to update home";
      // eslint-disable-next-line no-alert
      alert(message);
    },
  });

  const deleteHomeMutation = useMutation({
    mutationFn: (homeId: number) => deleteHome(user!.UserID, homeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist", user?.UserID] });
      setDeleteHomeTarget(null);
    },
    onError: (err: unknown) => {
      const message = err instanceof Error ? err.message : "Failed to delete home";
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
    <div>
      {/* Hero banner */}
      <div className="relative h-48 sm:h-56 w-full overflow-hidden mb-8">
        <img src={heroHome} alt="" className="w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 flex items-center justify-between px-6 sm:px-12 max-w-5xl mx-auto w-full">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Saved Homes</h1>
            <p className="text-white/80 text-sm max-w-md">
              Track homes you&apos;re considering and see how they compare to your savings and budget.
            </p>
          </div>
          <Button onClick={() => setAddOpen(true)} className="shrink-0 hidden sm:flex">
            <Plus className="h-4 w-4 mr-2" />
            Add House
          </Button>
        </div>
      </div>

      <div className="container max-w-5xl pb-10">
        <div className="flex justify-end mb-6 sm:hidden">
          <Button onClick={() => setAddOpen(true)} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Add House
          </Button>
        </div>

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
                onEdit={(h) => setEditHome(h)}
                onDelete={(h) => setDeleteHomeTarget(h)}
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

      <AddHouseModal
        open={editHome != null}
        onOpenChange={(open) => {
          if (!open) setEditHome(null);
        }}
        title="Edit house"
        description="Update the details for this saved home. Zillow link is optional."
        submitLabel="Save changes"
        initialValues={
          editHome
            ? {
                zillowUrl: editHome.ZillowURL ?? "",
                streetAddress: editHome.StreetAddress ?? "",
                city: editHome.City ?? "",
                state: editHome.State ?? "",
                zip: editHome.Zip != null ? String(editHome.Zip) : "",
                price: editHome.Price ?? 0,
                bedrooms: editHome.Bedrooms ?? 0,
                bathrooms: editHome.Bathrooms ?? 0,
                squareFeet: editHome.SquareFeet ?? 0,
              }
            : null
        }
        onSubmit={(values) => editHomeMutation.mutate(values)}
        submitting={editHomeMutation.isPending}
      />

      <AlertDialog open={deleteHomeTarget != null} onOpenChange={(open) => !open && setDeleteHomeTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this saved home?</AlertDialogTitle>
            <AlertDialogDescription>
              This removes the home from your saved list. You can always add it again later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteHomeMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!deleteHomeTarget) return;
                deleteHomeMutation.mutate(deleteHomeTarget.HomeID);
              }}
              disabled={deleteHomeMutation.isPending}
            >
              {deleteHomeMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      </div>
    </div>
  );
}
