import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { DollarSign, Home, Tag, Key } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type TutorialCategoryId = "save" | "buy" | "sell" | "rent" | "all";

const categories: {
  id: TutorialCategoryId;
  title: string;
  icon: typeof DollarSign;
  color: string;
  videos: { title: string; duration: string; videoId: string }[];
}[] = [
  {
    id: "save",
    title: "How to Save",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
    videos: [
      { title: "Building Your Down Payment Fund", duration: "8:24", videoId: "xGE4a9IMZwM" },
      { title: "Cutting Expenses That Matter", duration: "6:12", videoId: "xBtKMup3jVE" },
    ],
  },
  {
    id: "buy",
    title: "How to Buy",
    icon: Home,
    color: "bg-accent/10 text-accent",
    videos: [
      { title: "Understanding the Buying Process", duration: "12:05", videoId: "xGE4a9IMZwM" },
      { title: "Making Your First Offer", duration: "9:30", videoId: "xBtKMup3jVE" },
    ],
  },
  {
    id: "sell",
    title: "How to Sell",
    icon: Tag,
    color: "bg-primary/10 text-primary",
    videos: [
      { title: "Preparing Your Home for Sale", duration: "7:45", videoId: "xGE4a9IMZwM" },
      { title: "Pricing Strategies That Work", duration: "10:18", videoId: "xBtKMup3jVE" },
    ],
  },
  {
    id: "rent",
    title: "How to Rent",
    icon: Key,
    color: "bg-accent/10 text-accent",
    videos: [
      { title: "Renting vs. Buying: What's Right?", duration: "11:02", videoId: "xGE4a9IMZwM" },
      { title: "Understanding Lease Agreements", duration: "8:50", videoId: "xBtKMup3jVE" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function TutorialsPage() {
  const [categoryFilter, setCategoryFilter] = useState<TutorialCategoryId>("all");

  const filteredCategories = useMemo(() => {
    if (categoryFilter === "all") return categories;
    return categories.filter((cat) => cat.id === categoryFilter);
  }, [categoryFilter]);

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Educational Videos</h1>
            <p className="text-muted-foreground">Learn the essentials of home buying, selling, and everything in between.</p>
          </div>
          <div className="w-full sm:w-48 shrink-0">
            <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as TutorialCategoryId)}>
              <SelectTrigger>
                <SelectValue placeholder="What do you need help with?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All topics</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" className="space-y-10">
        {filteredCategories.map((cat, ci) => (
          <motion.div key={cat.title} variants={fadeUp} custom={ci}>
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-lg ${cat.color} flex items-center justify-center`}>
                <cat.icon className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-bold font-display">{cat.title}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {cat.videos.map((vid) => (
                <div
                  key={vid.title}
                  className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 flex flex-col"
                >
                  <div className="aspect-video w-full bg-muted">
                    <iframe
                      src={`https://www.youtube.com/embed/${vid.videoId}`}
                      title={vid.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-sm mb-1">{vid.title}</p>
                    <p className="text-xs text-muted-foreground">{vid.duration}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
