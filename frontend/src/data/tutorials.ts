import { DollarSign, Home, ClipboardCheck, FileCheck, CreditCard } from "lucide-react";

export type TutorialCategoryId = "saving" | "mortgage" | "inspecting" | "buying" | "credit";

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

export const tutorialVideos: Record<
  TutorialCategoryId,
  { id: string; title: string; duration: string; description?: string }[]
> = {
  saving: [
    { id: "s1", title: "Building Your Down Payment Fund", duration: "8:24" },
    { id: "s2", title: "Cutting Expenses That Matter", duration: "6:12" },
    { id: "s3", title: "How Much Do You Really Need to Save?", duration: "7:45" },
    { id: "s4", title: "First-Time Buyer Programs & Grants", duration: "9:30" },
  ],
  mortgage: [
    { id: "m1", title: "Mortgage Basics: Types of Loans", duration: "10:15" },
    { id: "m2", title: "Getting Pre-Approved vs. Pre-Qualified", duration: "8:50" },
    { id: "m3", title: "Understanding Interest Rates", duration: "9:20" },
    { id: "m4", title: "What Lenders Look For", duration: "11:00" },
  ],
  inspecting: [
    { id: "i1", title: "Why a Home Inspection Matters", duration: "7:30" },
    { id: "i2", title: "What Inspectors Look For", duration: "12:05" },
    { id: "i3", title: "Red Flags to Watch For", duration: "6:45" },
    { id: "i4", title: "When to Walk Away", duration: "5:50" },
  ],
  buying: [
    { id: "b1", title: "Understanding the Buying Process", duration: "12:05" },
    { id: "b2", title: "Making Your First Offer", duration: "9:30" },
    { id: "b3", title: "Negotiating Like a Pro", duration: "8:15" },
    { id: "b4", title: "From Offer to Closing Day", duration: "14:20" },
  ],
  credit: [
    { id: "c1", title: "How Credit Score Affects Your Rate", duration: "7:40" },
    { id: "c2", title: "Improving Your Credit Before You Buy", duration: "9:10" },
    { id: "c3", title: "Checking Your Report for Errors", duration: "6:25" },
    { id: "c4", title: "Debt-to-Income: What Lenders See", duration: "8:00" },
  ],
};
