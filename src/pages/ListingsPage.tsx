import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Square, ArrowDown, ArrowUp } from "lucide-react";
import home1 from "@/assets/home-1.jpg";
import home2 from "@/assets/home-2.jpg";
import home3 from "@/assets/home-3.jpg";
import home4 from "@/assets/home-4.jpg";
import home5 from "@/assets/home-5.jpg";
import home6 from "@/assets/home-6.jpg";
import { Button } from "@/components/ui/button";

const homeImages = [home1, home2, home3, home4, home5, home6];

const listingsData = [
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

type PriceSort = "low-high" | "high-low";

export default function ListingsPage() {
  const [priceSort, setPriceSort] = useState<PriceSort | null>(null);

  const listings = useMemo(() => {
    if (!priceSort) return listingsData;
    const sorted = [...listingsData].sort((a, b) =>
      priceSort === "low-high" ? a.price - b.price : b.price - a.price
    );
    return sorted;
  }, [priceSort]);

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Houses Within Your Budget</h1>
        <p className="text-muted-foreground mb-4">Showing homes in the $340K – $500K range based on your profile.</p>
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-muted-foreground mr-1 self-center">Sort by price:</span>
          <Button
            variant={priceSort === "low-high" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceSort(priceSort === "low-high" ? null : "low-high")}
          >
            <ArrowUp className="h-4 w-4 mr-1" />
            Low to High
          </Button>
          <Button
            variant={priceSort === "high-low" ? "default" : "outline"}
            size="sm"
            onClick={() => setPriceSort(priceSort === "high-low" ? null : "high-low")}
          >
            <ArrowDown className="h-4 w-4 mr-1" />
            High to Low
          </Button>
        </div>
      </motion.div>

      <motion.div initial="hidden" animate="visible" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((home, i) => (
          <Link key={home.id} to={`/listings/${home.id}`}>
            <motion.div
              variants={fadeUp}
              custom={i}
              className="group bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 cursor-pointer hover:-translate-y-1"
            >
              {/* House image */}
              <div className="h-40 overflow-hidden bg-muted">
                <img
                  src={homeImages[home.id - 1]}
                  alt={home.address}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
