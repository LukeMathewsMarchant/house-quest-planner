import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, DollarSign, BookOpen, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-home.jpg";

const testimonials = [
  { name: "Spencer Hilton", role: "First-time Buyer", quote: "HBH made home buying feel possible, even on my budget.", avatar: "SH" },
  { name: "James Gaskin", role: "Young Professional", quote: "The budget tools helped me understand exactly what I could afford.", avatar: "JG" },
  { name: "Maria Santos", role: "Recent Graduate", quote: "I never thought I'd own a home at 26. This app changed everything.", avatar: "MS" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.15, duration: 0.5 } }),
};

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Beautiful craftsman home at sunset" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/60 to-foreground/30" />
        </div>
        <div className="relative container py-24 md:py-36 lg:py-44">
          <motion.div
            initial="hidden"
            animate="visible"
            className="max-w-xl space-y-6"
          >
            <motion.h1
              variants={fadeUp}
              custom={0}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground leading-tight"
            >
              Welcome to the Home Buyer's Handbook
            </motion.h1>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="text-lg text-primary-foreground/80 max-w-md"
            >
              We make home buying as easy as 1, 2, 3. Plan your budget, explore listings, and learn every step of the way.
            </motion.p>
            <motion.div variants={fadeUp} custom={2} className="flex flex-wrap gap-4">
              <Button variant="hero" size="lg" asChild>
                <Link to="/dashboard">
                  Start Your Journey <ArrowRight className="ml-1 h-5 w-5" />
                </Link>
              </Button>
              <Button variant="hero-outline" size="lg" asChild>
                <Link to="/tutorials">Learn the Basics</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="container py-20">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-14"
        >
          <motion.h2 variants={fadeUp} custom={0} className="text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to Buy a Home
          </motion.h2>
          <motion.p variants={fadeUp} custom={1} className="text-muted-foreground text-lg max-w-2xl mx-auto">
            From budgeting to browsing, we guide you through every step.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid sm:grid-cols-3 gap-8"
        >
          {[
            { icon: DollarSign, title: "Budget Planning", desc: "See your contribution, price range, and mortgage estimate at a glance.", to: "/dashboard" },
            { icon: BookOpen, title: "Learn As You Go", desc: "Video tutorials on saving, mortgages, inspecting a home, and the buying process.", to: "/tutorials" },
            { icon: Star, title: "Listings in Your Budget", desc: "Browse homes filtered to what you can actually afford.", to: "/listings" },
          ].map((f, i) => (
            <Link key={f.title} to={f.to}>
              <motion.div
                variants={fadeUp}
                custom={i}
                className="group bg-card rounded-xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 text-center cursor-pointer hover:-translate-y-0.5"
              >
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-muted-foreground">{f.desc}</p>
                <span className="inline-flex items-center text-primary text-sm font-medium mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started <ArrowRight className="ml-1 h-4 w-4" />
                </span>
              </motion.div>
            </Link>
          ))}
        </motion.div>
      </section>

      {/* Testimonials */}
      <section className="bg-secondary/50 py-20">
        <div className="container">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold text-center mb-12"
          >
            What Our Users Say
          </motion.h2>
          <div className="grid sm:grid-cols-3 gap-8">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="bg-card rounded-xl p-6 shadow-card"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-primary/15 flex items-center justify-center text-primary font-semibold text-sm">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
                <p className="text-muted-foreground text-sm italic">"{t.quote}"</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 HBH. Your journey to homeownership starts here.
        </div>
      </footer>
    </div>
  );
}
