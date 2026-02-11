import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { tutorialCategories, tutorialVideos } from "@/data/tutorials";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function TutorialCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = tutorialCategories.find((c) => c.id === categoryId);
  const videos = category ? tutorialVideos[category.id] : [];

  if (!category || !videos.length) {
    return (
      <div className="container py-10 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">Category Not Found</h1>
        <p className="text-muted-foreground mb-6">This tutorial category doesn't exist.</p>
        <Button asChild>
          <Link to="/tutorials">Back to Tutorials</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/tutorials">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <category.icon className="h-6 w-6 text-primary" aria-hidden />
          </div>
          <div>
            <h1 className="text-3xl font-bold">{category.title}</h1>
            <p className="text-muted-foreground">{category.description}</p>
          </div>
        </div>
      </motion.div>

      {/* YouTube-style video grid */}
      <motion.div
        initial="hidden"
        animate="visible"
        className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {videos.map((video, i) => (
          <motion.article
            key={video.id}
            variants={fadeUp}
            custom={i}
            className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer"
          >
            {/* Thumbnail area - YouTube style */}
            <div className="relative aspect-video bg-muted">
              <div className="absolute inset-0 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground shadow-lg group-hover:scale-110 transition-transform">
                  <Play className="h-7 w-7 ml-1" fill="currentColor" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2 rounded bg-foreground/80 px-1.5 py-0.5 text-xs font-medium text-background">
                {video.duration}
              </div>
            </div>
            {/* Video info */}
            <div className="p-4">
              <h2 className="font-semibold line-clamp-2 group-hover:text-primary transition-colors">
                {video.title}
              </h2>
              <p className="text-xs text-muted-foreground mt-1">HBH Tutorials</p>
            </div>
          </motion.article>
        ))}
      </motion.div>
    </div>
  );
}
