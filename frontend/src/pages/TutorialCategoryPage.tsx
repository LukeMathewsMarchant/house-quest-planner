import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ExternalLink, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  tutorialCategories,
  tutorialVideos,
  TUTORIALS_YOUTUBE_CHANNEL_URL,
  SAVING_KNOW_MORE_CHANNEL_URL,
  MORTGAGE_KNOW_MORE_PLAYLIST_URL,
  INSPECTING_KNOW_MORE_URL,
  BUYING_KNOW_MORE_URL,
  CREDIT_KNOW_MORE_URL,
  resolveTutorialEmbedUrl,
  resolveTutorialWatchUrl,
  type TutorialVideo,
} from "@/data/tutorials";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35 } }),
};

export default function TutorialCategoryPage() {
  const { categoryId } = useParams<{ categoryId: string }>();
  const category = tutorialCategories.find((c) => c.id === categoryId);
  const videos = category ? tutorialVideos[category.id] : [];

  const [selected, setSelected] = useState<TutorialVideo | null>(videos[0] ?? null);

  useEffect(() => {
    const cat = tutorialCategories.find((c) => c.id === categoryId);
    const list = cat ? tutorialVideos[cat.id] : [];
    setSelected(list[0] ?? null);
  }, [categoryId]);

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

  const embedSrc = selected ? resolveTutorialEmbedUrl(selected) : "";
  const watchHref = selected ? resolveTutorialWatchUrl(selected) : "";

  const headerLearnMoreHref =
    category.id === "mortgage"
      ? MORTGAGE_KNOW_MORE_PLAYLIST_URL
      : category.id === "inspecting"
        ? INSPECTING_KNOW_MORE_URL
        : category.id === "buying"
          ? BUYING_KNOW_MORE_URL
          : category.id === "credit"
            ? CREDIT_KNOW_MORE_URL
            : TUTORIALS_YOUTUBE_CHANNEL_URL;

  return (
    <div className="container py-10 max-w-6xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link to="/tutorials">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Tutorials
          </Link>
        </Button>
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <category.icon className="h-6 w-6 text-primary" aria-hidden />
            </div>
            <div>
              <h1 className="text-3xl font-bold">{category.title}</h1>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" asChild className="shrink-0 self-start sm:self-center">
            <a href={headerLearnMoreHref} target="_blank" rel="noopener noreferrer">
              Learn more on YouTube
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden />
            </a>
          </Button>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_minmax(260px,320px)] lg:items-start">
        <div className="space-y-4 min-w-0">
          {selected && (
            <div className="rounded-xl overflow-hidden border bg-card shadow-card">
              <div className="relative aspect-video w-full bg-muted">
                <iframe
                  key={selected.id}
                  title={selected.title}
                  src={embedSrc}
                  className="absolute inset-0 h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  referrerPolicy="strict-origin-when-cross-origin"
                />
              </div>
              <div className="p-4 sm:p-5">
                <h2 className="text-xl font-semibold">{selected.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">HBH Tutorials · {selected.duration}</p>
                {selected.description ? (
                  <p className="text-sm text-muted-foreground mt-3">{selected.description}</p>
                ) : null}
                <a
                  href={watchHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary mt-4 hover:underline"
                >
                  Open on YouTube
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                </a>
              </div>
            </div>
          )}
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          className="space-y-2 lg:sticky lg:top-24"
          role="navigation"
          aria-label="Videos in this topic"
        >
          <p className="text-sm font-medium text-muted-foreground px-1">Playlist</p>
          {videos.map((video, i) => {
            const isActive = selected?.id === video.id;
            return (
              <motion.button
                key={video.id}
                type="button"
                variants={fadeUp}
                custom={i}
                onClick={() => setSelected(video)}
                className={`w-full text-left rounded-lg border p-3 transition-all flex gap-3 ${
                  isActive
                    ? "border-primary bg-primary/5 shadow-sm"
                    : "border-transparent bg-card hover:border-primary/20 hover:bg-muted/50"
                }`}
              >
                <div
                  className={`shrink-0 w-10 h-10 rounded-md flex items-center justify-center ${
                    isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  <Play className={`h-4 w-4 ${isActive ? "ml-0.5" : "ml-0.5"}`} fill="currentColor" aria-hidden />
                </div>
                <div className="min-w-0">
                  <p className={`font-medium text-sm line-clamp-2 ${isActive ? "text-foreground" : ""}`}>{video.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{video.duration}</p>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      </div>

      {category.id === "saving" && (
        <section
          className="mt-10 rounded-xl border bg-card p-5 sm:p-6 shadow-card"
          aria-labelledby="saving-youtube-links-heading"
        >
          <h2 id="saving-youtube-links-heading" className="text-lg font-semibold mb-4">
            Saving for a down payment — all YouTube links
          </h2>
          <ul className="space-y-2.5 mb-6">
            {videos.map((video) => {
              const href = resolveTutorialWatchUrl(video);
              return (
                <li key={`link-${video.id}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium">{video.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            To know more,{" "}
            <a
              href={SAVING_KNOW_MORE_CHANNEL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
            >
              click here
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            .
          </p>
        </section>
      )}

      {category.id === "mortgage" && (
        <section
          className="mt-10 rounded-xl border bg-card p-5 sm:p-6 shadow-card"
          aria-labelledby="mortgage-youtube-links-heading"
        >
          <h2 id="mortgage-youtube-links-heading" className="text-lg font-semibold mb-4">
            How to Get a Mortgage — all YouTube links
          </h2>
          <ul className="space-y-2.5 mb-6">
            {videos.map((video) => {
              const href = resolveTutorialWatchUrl(video);
              return (
                <li key={`link-${video.id}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium">{video.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            To know more,{" "}
            <a
              href={MORTGAGE_KNOW_MORE_PLAYLIST_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
            >
              click here
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            .
          </p>
        </section>
      )}

      {category.id === "inspecting" && (
        <section
          className="mt-10 rounded-xl border bg-card p-5 sm:p-6 shadow-card"
          aria-labelledby="inspecting-youtube-links-heading"
        >
          <h2 id="inspecting-youtube-links-heading" className="text-lg font-semibold mb-4">
            Inspecting a Home — all YouTube links
          </h2>
          <ul className="space-y-2.5 mb-6">
            {videos.map((video) => {
              const href = resolveTutorialWatchUrl(video);
              return (
                <li key={`link-${video.id}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium">{video.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            To see more,{" "}
            <a
              href={INSPECTING_KNOW_MORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
            >
              click here
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            .
          </p>
        </section>
      )}

      {category.id === "buying" && (
        <section
          className="mt-10 rounded-xl border bg-card p-5 sm:p-6 shadow-card"
          aria-labelledby="buying-youtube-links-heading"
        >
          <h2 id="buying-youtube-links-heading" className="text-lg font-semibold mb-4">
            The Buying Process — all YouTube links
          </h2>
          <ul className="space-y-2.5 mb-6">
            {videos.map((video) => {
              const href = resolveTutorialWatchUrl(video);
              return (
                <li key={`link-${video.id}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium">{video.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            To learn more,{" "}
            <a
              href={BUYING_KNOW_MORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
            >
              click here
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            .
          </p>
        </section>
      )}

      {category.id === "credit" && (
        <section
          className="mt-10 rounded-xl border bg-card p-5 sm:p-6 shadow-card"
          aria-labelledby="credit-youtube-links-heading"
        >
          <h2 id="credit-youtube-links-heading" className="text-lg font-semibold mb-4">
            Understanding Credit — all YouTube links
          </h2>
          <ul className="space-y-2.5 mb-6">
            {videos.map((video) => {
              const href = resolveTutorialWatchUrl(video);
              return (
                <li key={`link-${video.id}`}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm text-primary hover:underline"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0 mt-0.5" aria-hidden />
                    <span className="font-medium">{video.title}</span>
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="text-sm text-muted-foreground">
            To learn more,{" "}
            <a
              href={CREDIT_KNOW_MORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary inline-flex items-center gap-1 hover:underline"
            >
              click here
              <ExternalLink className="h-3.5 w-3.5" aria-hidden />
            </a>
            .
          </p>
        </section>
      )}
    </div>
  );
}
