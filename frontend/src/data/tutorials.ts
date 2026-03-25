import { DollarSign, Home, ClipboardCheck, FileCheck, CreditCard } from "lucide-react";

export type TutorialCategoryId = "saving" | "mortgage" | "inspecting" | "buying" | "credit";

/** YouTube “Learn more” destination (search results for Win the House You Love). */
export const TUTORIALS_YOUTUBE_CHANNEL_URL =
  "https://www.youtube.com/results?search_query=win+the+house+you+love";

/** Saving topic: “To know more, click here” uses the same destination as above. */
export const SAVING_KNOW_MORE_CHANNEL_URL = TUTORIALS_YOUTUBE_CHANNEL_URL;

/** Mortgage topic: full playlist (Course: First-Time Homebuyers 2025). */
export const MORTGAGE_KNOW_MORE_PLAYLIST_URL =
  "https://www.youtube.com/playlist?list=PLsjEjJAI2Tj-gukHZxpvK5USMF0v_YWsZ";

/** Inspecting topic: “click here to see more” — InterNACHI playlists on YouTube. */
export const INSPECTING_KNOW_MORE_URL = "https://www.youtube.com/@internachi/playlists";

/** Buying topic: “click here to learn more” — starts this playlist video on YouTube. */
export const BUYING_KNOW_MORE_URL =
  "https://www.youtube.com/watch?v=WNQLqGLhmvI&list=PLL2NpJzFd3bsX8UxJXHcFvC2hZZlHeUv_";

/** Credit topic: “click here to learn more” — Javy Vidana on YouTube. */
export const CREDIT_KNOW_MORE_URL = "https://www.youtube.com/@JavyVidana";

/**
 * Placeholder video ID for every row until you swap in real tutorial IDs from YouTube.
 * (YouTube’s embed docs use this sample; replace per video when you publish content.)
 */
export const TUTORIAL_PLACEHOLDER_VIDEO_ID = "M7lc1UVf-VE";

export function youtubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`;
}

export function youtubeWatchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}

export type TutorialVideo = {
  id: string;
  title: string;
  duration: string;
  description?: string;
  /** YouTube video ID; defaults to placeholder until you set real uploads */
  youtubeVideoId?: string;
  /** If set, “Open on YouTube” and link lists use this URL (e.g. with playlist params). */
  youtubeWatchUrlOverride?: string;
};

export const tutorialCategories: {
  id: TutorialCategoryId;
  title: string;
  description: string;
  icon: typeof DollarSign;
}[] = [
  { id: "saving", title: "Saving for a Down Payment", description: "Build your fund and find first-time buyer programs.", icon: DollarSign },
  { id: "mortgage", title: "How to Get a Mortgage", description: "Loan types, pre-approval, and what lenders look for.", icon: FileCheck },
  { id: "inspecting", title: "Inspecting a Home", description: "What to look for and when to walk away.", icon: ClipboardCheck },
  { id: "buying", title: "The Buying Process", description: "Offers, negotiating, and closing day.", icon: Home },
  { id: "credit", title: "Understanding Credit", description: "Scores, reports, and debt-to-income.", icon: CreditCard },
];

export const tutorialVideos: Record<TutorialCategoryId, TutorialVideo[]> = {
  saving: [
    { id: "s1", title: "The Ultimate FIRST TIME HOME BUYERS GUIDE", duration: "55:21", youtubeVideoId: "wXzTE8zLIbo" },
    { id: "s2", title: "Buying A Home In 6 Months? Here's Your Game Plan", duration: "59:08", youtubeVideoId: "CdZBMa0kJvA" },
    { id: "s3", title: "2025 Conventional Loan Requiremnts - Here'What You Need to Qualify", duration:"1:10:27", youtubeVideoId: "HPyzNj_K4m4"},
  ],
  mortgage: [
    {
      id: "m1",
      title: "Mortgage Basics: Types of Loans",
      duration: "10:15",
      youtubeVideoId: "8PhbXO5iv7I",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=8PhbXO5iv7I&list=PLsjEjJAI2Tj-gukHZxpvK5USMF0v_YWsZ&index=1",
    },
    {
      id: "m2",
      title: "Getting Pre-Approved vs. Pre-Qualified",
      duration: "8:50",
      youtubeVideoId: "DUfHTFLgXEM",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=DUfHTFLgXEM&list=PLsjEjJAI2Tj-gukHZxpvK5USMF0v_YWsZ&index=2",
    },
    {
      id: "m3",
      title: "Understanding Interest Rates",
      duration: "9:20",
      youtubeVideoId: "KIMNE9XoO6k",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=KIMNE9XoO6k&list=PLsjEjJAI2Tj-gukHZxpvK5USMF0v_YWsZ&index=3",
    },
  ],
  inspecting: [
    {
      id: "i1",
      title: "Why a Home Inspection Matters",
      duration: "7:30",
      youtubeVideoId: "32VdBPMVzLU",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=32VdBPMVzLU&list=PLKPEi6DdHVZxhQGmOZ88uoUzZJY0GR4cr&index=4",
    },
    {
      id: "i2",
      title: "What Inspectors Look For",
      duration: "12:05",
      youtubeVideoId: "_O9tQkKIb4o",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=_O9tQkKIb4o&list=PLKPEi6DdHVZxhQGmOZ88uoUzZJY0GR4cr&index=5",
    },
    {
      id: "i3",
      title: "Red Flags to Watch For",
      duration: "6:45",
      youtubeVideoId: "0lbMH9OmqX0",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=0lbMH9OmqX0&list=PLKPEi6DdHVZxhQGmOZ88uoUzZJY0GR4cr&index=6",
    },
  ],
  buying: [
    {
      id: "b1",
      title: "Understanding the Buying Process",
      duration: "12:05",
      youtubeVideoId: "zI9IorZQumQ",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=zI9IorZQumQ&list=PLL2NpJzFd3bsX8UxJXHcFvC2hZZlHeUv_&index=4",
    },
    {
      id: "b2",
      title: "Making Your First Offer",
      duration: "9:30",
      youtubeVideoId: "HzxNfltI8NM",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=HzxNfltI8NM&list=PLL2NpJzFd3bsX8UxJXHcFvC2hZZlHeUv_&index=6",
    },
    {
      id: "b3",
      title: "Negotiating Like a Pro",
      duration: "8:15",
      youtubeVideoId: "W58QneULWN8",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=W58QneULWN8&list=PLL2NpJzFd3bsX8UxJXHcFvC2hZZlHeUv_&index=12",
    },
  ],
  credit: [
    {
      id: "c1",
      title: "How Credit Score Affects Your Rate",
      duration: "7:40",
      youtubeVideoId: "1aHBv1Bxv5k",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=1aHBv1Bxv5k&list=PLbppVTP2mwOqgfzUcHe9JqiV2abxQ3ICH",
    },
    {
      id: "c2",
      title: "Improving Your Credit Before You Buy",
      duration: "9:10",
      youtubeVideoId: "7vbh4CwN1Xc",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=7vbh4CwN1Xc&list=PLbppVTP2mwOqgfzUcHe9JqiV2abxQ3ICH&index=12",
    },
    {
      id: "c3",
      title: "Checking Your Report for Errors",
      duration: "6:25",
      youtubeVideoId: "eBk98GS5Bsg",
      youtubeWatchUrlOverride:
        "https://www.youtube.com/watch?v=eBk98GS5Bsg&list=PLbppVTP2mwOqgfzUcHe9JqiV2abxQ3ICH&index=2",
    },
  ],
};

export function resolveTutorialEmbedUrl(video: TutorialVideo): string {
  return youtubeEmbedUrl(video.youtubeVideoId ?? TUTORIAL_PLACEHOLDER_VIDEO_ID);
}

export function resolveTutorialWatchUrl(video: TutorialVideo): string {
  if (video.youtubeWatchUrlOverride) return video.youtubeWatchUrlOverride;
  return youtubeWatchUrl(video.youtubeVideoId ?? TUTORIAL_PLACEHOLDER_VIDEO_ID);
}
