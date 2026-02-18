import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin, Calendar, Car, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import home1 from "@/assets/home-1.jpg";
import home2 from "@/assets/home-2.jpg";
import home3 from "@/assets/home-3.jpg";
import home4 from "@/assets/home-4.jpg";
import home5 from "@/assets/home-5.jpg";
import home6 from "@/assets/home-6.jpg";

const homeImages = [home1, home2, home3, home4, home5, home6];

// Extended house data with more details
const houseDetails: Record<number, {
  id: number;
  address: string;
  city: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  yearBuilt: number;
  lotSize: string;
  garage: number;
  description: string;
  features: string[];
}> = {
  1: {
    id: 1,
    address: "12345 W Teal St",
    city: "Eagle, ID",
    price: 450000,
    beds: 4,
    baths: 3,
    sqft: 2100,
    yearBuilt: 2018,
    lotSize: "0.25 acres",
    garage: 2,
    description: "Beautiful craftsman-style home in a quiet neighborhood. Features an open-concept main floor with vaulted ceilings, updated kitchen with granite countertops, and a spacious master suite. The backyard is perfect for entertaining with a covered patio and mature landscaping.",
    features: ["Granite Countertops", "Vaulted Ceilings", "Master Suite", "Covered Patio", "Mature Landscaping", "Open Floor Plan"]
  },
  2: {
    id: 2,
    address: "8421 Maple Grove Ln",
    city: "Meridian, ID",
    price: 425000,
    beds: 3,
    baths: 2,
    sqft: 1850,
    yearBuilt: 2015,
    lotSize: "0.20 acres",
    garage: 2,
    description: "Charming single-story home with modern updates throughout. The kitchen features stainless steel appliances and a breakfast nook. Large backyard with a deck perfect for summer gatherings. Located in a family-friendly community with excellent schools nearby.",
    features: ["Stainless Steel Appliances", "Breakfast Nook", "Deck", "Single-Story", "Updated Throughout", "Family-Friendly"]
  },
  3: {
    id: 3,
    address: "903 Birchwood Ave",
    city: "Boise, ID",
    price: 398000,
    beds: 3,
    baths: 2.5,
    sqft: 1720,
    yearBuilt: 2012,
    lotSize: "0.18 acres",
    garage: 2,
    description: "Cozy two-story home with a finished basement. The main floor includes a living room with fireplace, updated kitchen, and dining area. Upstairs features three bedrooms including a master with walk-in closet. Close to parks and shopping.",
    features: ["Fireplace", "Finished Basement", "Walk-in Closet", "Two-Story", "Updated Kitchen", "Close to Parks"]
  },
  4: {
    id: 4,
    address: "5510 Sunset Ridge Dr",
    city: "Nampa, ID",
    price: 375000,
    beds: 4,
    baths: 2,
    sqft: 1950,
    yearBuilt: 2019,
    lotSize: "0.22 acres",
    garage: 2,
    description: "Spacious newer construction home with modern finishes. Open floor plan with large windows providing plenty of natural light. The kitchen includes an island and pantry. Master bedroom has an ensuite bathroom. Great value in a growing area.",
    features: ["Newer Construction", "Open Floor Plan", "Kitchen Island", "Pantry", "Ensuite Bathroom", "Natural Light"]
  },
  5: {
    id: 5,
    address: "2201 Cedar Park Way",
    city: "Star, ID",
    price: 489000,
    beds: 5,
    baths: 3.5,
    sqft: 2400,
    yearBuilt: 2020,
    lotSize: "0.30 acres",
    garage: 3,
    description: "Stunning newer home with premium upgrades throughout. Features include hardwood floors, custom cabinetry, and a gourmet kitchen with double ovens. The master suite includes a luxurious bathroom with soaking tub. Large backyard with room for a pool.",
    features: ["Hardwood Floors", "Custom Cabinetry", "Gourmet Kitchen", "Double Ovens", "Soaking Tub", "Pool-Ready Yard"]
  },
  6: {
    id: 6,
    address: "7718 Elm Crossing Ct",
    city: "Kuna, ID",
    price: 340000,
    beds: 3,
    baths: 2,
    sqft: 1580,
    yearBuilt: 2016,
    lotSize: "0.15 acres",
    garage: 2,
    description: "Well-maintained starter home perfect for first-time buyers. Features include a cozy living room, functional kitchen, and a fenced backyard. Located in a quiet cul-de-sac with friendly neighbors. Great opportunity to build equity.",
    features: ["Starter Home", "Fenced Backyard", "Cul-de-sac", "Well-Maintained", "Functional Kitchen", "Great Value"]
  },
};

export default function HouseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const houseId = id ? parseInt(id, 10) : null;
  const house = houseId && houseDetails[houseId];

  if (!house) {
    return (
      <div className="container py-10 max-w-3xl text-center">
        <h1 className="text-2xl font-bold mb-4">House Not Found</h1>
        <p className="text-muted-foreground mb-6">The house you're looking for doesn't exist.</p>
        <Button asChild>
          <Link to="/listings">Back to Listings</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container py-10 max-w-5xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Listings
        </Button>

        {/* Main image */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl overflow-hidden shadow-card"
        >
          <img
            src={homeImages[house.id - 1]}
            alt={house.address}
            className="w-full h-[400px] md:h-[500px] object-cover"
          />
        </motion.div>

        {/* Header info */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{house.address}</h1>
            <div className="flex items-center text-muted-foreground mb-4">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{house.city}</span>
            </div>
            <p className="text-3xl font-bold text-primary mb-6">
              ${house.price.toLocaleString()}
            </p>
          </div>

          {/* Key stats */}
          <div className="bg-card rounded-xl p-6 shadow-card">
            <h2 className="text-lg font-semibold mb-4">Property Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Bed className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="font-semibold">{house.beds}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Bath className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="font-semibold">{house.baths}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Square className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="font-semibold">{house.sqft.toLocaleString()}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Lot Size</p>
                  <p className="font-semibold">{house.lotSize}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="font-semibold">{house.yearBuilt}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Garage</p>
                  <p className="font-semibold">{house.garage} car</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-card rounded-xl p-6 shadow-card"
        >
          <h2 className="text-xl font-bold mb-4">About This Home</h2>
          <p className="text-muted-foreground leading-relaxed">{house.description}</p>
        </motion.div>

        {/* Features */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-card rounded-xl p-6 shadow-card"
        >
          <h2 className="text-xl font-bold mb-4">Features</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {house.features.map((feature, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-sm"
              >
                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                <span className="text-muted-foreground">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button size="lg" className="flex-1">
            Schedule a Tour
          </Button>
          <Button size="lg" variant="outline" className="flex-1">
            Contact Agent
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
