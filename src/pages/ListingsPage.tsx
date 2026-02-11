import { motion } from "framer-motion";
import { MapPin, Bed, Bath, Square } from "lucide-react";

const listings = [
  { id: 1, address: "12345 W Teal St", city: "Eagle, ID", price: 450000, beds: 4, baths: 3, sqft: 2100 },
  { id: 2, address: "8421 Maple Grove Ln", city: "Meridian, ID", price: 425000, beds: 3, baths: 2, sqft: 1850 },
  { id: 3, address: "903 Birchwood Ave", city: "Boise, ID", price: 398000, beds: 3, baths: 2.5, sqft: 1720 },
  { id: 4, address: "5510 Sunset Ridge Dr", city: "Nampa, ID", price: 375000, beds: 4, baths: 2, sqft: 1950 },
  { id: 5, address: "2201 Cedar Park Way", city: "Star, ID", price: 489000, beds: 5, baths: 3.5, sqft: 2400 },
  { id: 6, address: "7718 Elm Crossing Ct", city: "Kuna, ID", price: 340000, beds: 3, baths: 2, sqft: 1580 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.4 } }),
};

const colors = [
  "from-primary/20 to-primary/5",
  "from-accent/20 to-accent/5",
  "from-primary/15 to-accent/5",
];

export default function ListingsPage() {
  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Houses Within Your Budget</h1>
        <p className="text-muted-foreground">Showing homes in the $340K – $500K range based on your profile.</p>
      </motion.div>

      <motion.div initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((home, i) => (
          <motion.div
            key={home.id}
            variants={fadeUp}
            custom={i}
            className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
          >
            {/* Color placeholder for house image */}
            <div className={`h-40 bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center`}>
              <div className="w-16 h-16 rounded-full bg-card/60 flex items-center justify-center">
                <MapPin className="h-7 w-7 text-primary" />
              </div>
            </div>
            <div className="p-5">
              <p className="text-2xl font-bold text-primary mb-1">
                ${home.price.toLocaleString()}
              </p>
              <p className="font-semibold text-sm mb-0.5">{home.address}</p>
              <p className="text-xs text-muted-foreground mb-3">{home.city}</p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5" />{home.beds} bd</span>
                <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5" />{home.baths} ba</span>
                <span className="flex items-center gap-1"><Square className="h-3.5 w-3.5" />{home.sqft.toLocaleString()} sqft</span>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
