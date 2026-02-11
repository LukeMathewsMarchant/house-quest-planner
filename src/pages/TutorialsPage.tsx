import { motion } from "framer-motion";
import { Play, DollarSign, Home, Tag, Key } from "lucide-react";

const categories = [
  {
    title: "How to Save",
    icon: DollarSign,
    color: "bg-primary/10 text-primary",
    videos: [
      { title: "Building Your Down Payment Fund", duration: "8:24" },
      { title: "Cutting Expenses That Matter", duration: "6:12" },
    ],
  },
  {
    title: "How to Buy",
    icon: Home,
    color: "bg-accent/10 text-accent",
    videos: [
      { title: "Understanding the Buying Process", duration: "12:05" },
      { title: "Making Your First Offer", duration: "9:30" },
    ],
  },
  {
    title: "How to Sell",
    icon: Tag,
    color: "bg-primary/10 text-primary",
    videos: [
      { title: "Preparing Your Home for Sale", duration: "7:45" },
      { title: "Pricing Strategies That Work", duration: "10:18" },
    ],
  },
  {
    title: "How to Rent",
    icon: Key,
    color: "bg-accent/10 text-accent",
    videos: [
      { title: "Renting vs. Buying: What's Right?", duration: "11:02" },
      { title: "Understanding Lease Agreements", duration: "8:50" },
    ],
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.4 } }),
};

export default function TutorialsPage() {
  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Educational Videos</h1>
        <p className="text-muted-foreground">Learn the essentials of home buying, selling, and everything in between.</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" className="space-y-10">
        {categories.map((cat, ci) => (
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
                  className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-0.5 flex"
                >
                  <div className={`w-28 shrink-0 ${cat.color} bg-opacity-20 flex items-center justify-center`}>
                    <div className="w-10 h-10 rounded-full bg-card/70 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Play className="h-4 w-4 ml-0.5" />
                    </div>
                  </div>
                  <div className="p-4 flex flex-col justify-center">
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
