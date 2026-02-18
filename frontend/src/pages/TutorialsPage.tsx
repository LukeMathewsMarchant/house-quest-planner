import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { tutorialCategories } from "@/data/tutorials";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

export default function TutorialsPage() {
  return (
    <div className="container py-10 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-bold mb-2">Learn As You Go</h1>
        <p className="text-muted-foreground">
          Choose a topic to watch video tutorials on saving, mortgages, inspecting a home, and more.
        </p>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 gap-6"
      >
        {tutorialCategories.map((cat, i) => (
          <Link key={cat.id} to={`/tutorials/${cat.id}`}>
            <motion.div
              variants={fadeUp}
              custom={i}
              className="group bg-card rounded-xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-0.5 border border-transparent hover:border-primary/20"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <cat.icon className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-display mb-2">{cat.title}</h2>
              <p className="text-muted-foreground text-sm mb-4">{cat.description}</p>
              <span className="inline-flex items-center text-primary text-sm font-medium">
                Watch videos <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </motion.div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
