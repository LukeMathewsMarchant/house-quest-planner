import { Link } from "react-router-dom";
import { motion, type Variants } from "framer-motion";
import { Home as HomeIcon, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import type { Home, Progress as UserProgress } from "@/lib/api";

type Props = {
  home: Home;
  index: number;
  fadeUp: Variants;
  progress: UserProgress | null;
  downPaymentNeeded: number;
  remainingSavings: number;
  timelineLabel: string | null;
  onEdit?: (home: Home) => void;
  onDelete?: (home: Home) => void;
};

export function HomeCard({
  home,
  index,
  fadeUp,
  progress,
  downPaymentNeeded,
  remainingSavings,
  timelineLabel,
  onEdit,
  onDelete,
}: Props) {
  const saved = progress?.amountSaved ?? 0;
  const target = downPaymentNeeded;
  const withinBudget = progress?.budget != null && home.Price != null && home.Price <= progress.budget;
  const aboveBudget = progress?.budget != null && home.Price != null && home.Price > progress.budget;
  const progressPercent = target > 0 ? Math.min(100, (saved / target) * 100) : 0;

  const cityState = [home.City, home.State].filter(Boolean).join(", ");

  return (
    <motion.div
      variants={fadeUp}
      custom={index}
      className="bg-card rounded-xl shadow-card hover:shadow-card-hover border transition-all duration-300 hover:-translate-y-1 flex flex-col"
    >
      <Card className="border-0 shadow-none flex-1 flex flex-col">
        <CardHeader className="pb-4 flex-row items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mt-1">
              <HomeIcon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base mb-1">{home.StreetAddress}</CardTitle>
              <CardDescription className="text-xs">{cityState}</CardDescription>
            </div>
          </div>
          {withinBudget && <Badge className="mt-1">Within budget</Badge>}
          {!withinBudget && aboveBudget && (
            <Badge variant="destructive" className="mt-1">
              Above budget
            </Badge>
          )}
        </CardHeader>
        <CardContent className="space-y-4 pt-0 flex-1 flex flex-col">
          <div>
            <p className="text-2xl font-bold text-primary">
              {home.Price != null ? `$${home.Price.toLocaleString()}` : "—"}
            </p>
            <p className="text-xs text-muted-foreground">
              {home.Bedrooms ?? "—"} bd • {home.Bathrooms ?? "—"} ba •{" "}
              {home.SquareFeet != null ? `${home.SquareFeet.toLocaleString()} sqft` : "— sqft"}
            </p>
          </div>

          <div className="space-y-2 pt-1">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Financial snapshot
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-muted-foreground">Down payment needed</p>
                <p className="font-semibold">
                  {target > 0 ? `$${Math.round(target).toLocaleString()}` : "Set in Profile"}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Amount saved</p>
                <p className="font-semibold">${saved.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Remaining</p>
                <p className="font-semibold">
                  {target > 0 ? `$${Math.round(remainingSavings).toLocaleString()}` : "—"}
                </p>
              </div>
            </div>
            {target > 0 && (
              <div className="space-y-1">
                <Progress value={progressPercent} className="h-2" />
                <p className="text-[11px] text-muted-foreground">
                  Saved ${saved.toLocaleString()} of ${Math.round(target).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-1 pt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Estimated time until affordable
            </p>
            <p className="text-sm font-medium">
              {timelineLabel ?? "Add a monthly savings amount and down payment % to see this."}
            </p>
          </div>

          <div className="pt-4 mt-auto flex flex-col gap-2">
            <div className="flex gap-2">
              <Link
                to={`/homes/${home.HomeID}`}
                className="flex-1 inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground text-sm font-medium h-9 px-3 py-1.5 hover:bg-primary/90 transition-colors"
              >
                View details
              </Link>
              {home.ZillowURL && (
                <a
                  href={home.ZillowURL}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-sm font-medium h-9 px-3 py-1.5 hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                  Open Listing
                </a>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onEdit?.(home)}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                type="button"
                variant="destructive"
                className="flex-1"
                onClick={() => onDelete?.(home)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

