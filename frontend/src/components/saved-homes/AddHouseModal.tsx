import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
const SUFFIXES = new Set(["rd","st","ave","blvd","dr","ln","ct","way","pl","cir","ter","pkwy","hwy","trail","loop","pass","run","row","sq"]);

// Parse a hyphen-delimited address slug: {street}-{city}-{STATE}-{zip}
// Used by: Zillow, Homes.com, Apartments.com, HotPads, Roofstock, Zumper
function parseHyphenSlug(slug: string): Partial<HouseFormValues> {
  const tokens = slug.split("-");
  let zipIdx = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (/^\d{5}$/.test(tokens[i])) { zipIdx = i; break; }
  }
  if (zipIdx < 1) return {};
  const stateIdx = zipIdx - 1;
  if (!/^[A-Za-z]{2}$/.test(tokens[stateIdx])) return {};

  let suffixIdx = -1;
  for (let i = stateIdx - 1; i >= 0; i--) {
    if (SUFFIXES.has(tokens[i].toLowerCase())) { suffixIdx = i; break; }
  }

  // Fallback: cardinal directions (grid-style addresses like "891 W 600 S")
  const CARDINALS = new Set(["n","s","e","w","ne","nw","se","sw"]);
  let boundaryIdx = suffixIdx;
  if (boundaryIdx < 0) {
    for (let i = stateIdx - 1; i >= 0; i--) {
      if (CARDINALS.has(tokens[i].toLowerCase())) { boundaryIdx = i; break; }
    }
  }

  if (boundaryIdx >= 0) {
    return {
      streetAddress: tokens.slice(0, boundaryIdx + 1).map(cap).join(" "),
      city: tokens.slice(boundaryIdx + 1, stateIdx).map(cap).join(" "),
      state: tokens[stateIdx].toUpperCase(),
      zip: tokens[zipIdx],
    };
  }
  return { state: tokens[stateIdx].toUpperCase(), zip: tokens[zipIdx] };
}

function parseListingUrl(url: string): Partial<HouseFormValues> {
  try {
    const { hostname, pathname } = new URL(url);
    const host = hostname.replace(/^www\./, "");

    // Realtor.com: /realestateandhomes-detail/{street}_{city}_{state}_{zip}_M{id}
    if (host === "realtor.com") {
      const m = pathname.match(/\/realestateandhomes-detail\/([^/?]+)/);
      if (m) {
        const parts = m[1].split("_");
        if (parts.length >= 4) {
          return {
            streetAddress: parts[0].split("-").map(cap).join(" "),
            city: parts[1].split("-").map(cap).join(" "),
            state: parts[2].toUpperCase(),
            zip: parts[3].replace(/\D/g, "").slice(0, 5),
          };
        }
      }
    }

    // Redfin: /{STATE}/{City}/{street-zip}/home/{id}
    if (host === "redfin.com") {
      const segs = pathname.split("/").filter(Boolean);
      if (segs.length >= 4 && segs[3] === "home") {
        const tokens = segs[2].split("-");
        let zipIdx = -1;
        for (let i = tokens.length - 1; i >= 0; i--) {
          if (/^\d{5}$/.test(tokens[i])) { zipIdx = i; break; }
        }
        return {
          streetAddress: zipIdx > 0 ? tokens.slice(0, zipIdx).map(cap).join(" ") : undefined,
          city: segs[1].split("-").map(cap).join(" "),
          state: segs[0].toUpperCase(),
          zip: zipIdx >= 0 ? tokens[zipIdx] : undefined,
        };
      }
    }

    // Trulia: /p/{state}/{city}/{full-address-slug}--{id}
    if (host === "trulia.com") {
      const m = pathname.match(/\/p\/([a-z]{2})\/([^/]+)\/([^/?]+)/);
      if (m) {
        const state = m[1].toUpperCase();
        const city = m[2].split("-").map(cap).join(" ");
        const slug = m[3].replace(/--\d+$/, "");
        const parsed = parseHyphenSlug(slug);
        return { ...parsed, state, city: parsed.city || city };
      }
    }

    // Generic hyphen slug fallback: Zillow, Homes.com, Apartments.com, HotPads, Roofstock, Zumper
    for (const seg of pathname.split("/").filter(Boolean)) {
      const result = parseHyphenSlug(seg);
      if (result.state && result.zip) return result;
    }

    return {};
  } catch {
    return {};
  }
}

export type HouseFormValues = {
  title: string;
  zillowUrl: string;
  streetAddress: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
};

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: HouseFormValues) => void;
  submitting: boolean;
  title?: string;
  description?: string;
  submitLabel?: string;
  initialValues?: Partial<HouseFormValues> | null;
};

export function AddHouseModal({
  open,
  onOpenChange,
  onSubmit,
  submitting,
  title = "Add a house",
  description = "Paste a Zillow/Web listing link below and basic details. We'll use this to compare the home against your savings and budget.",
  submitLabel = "Save house",
  initialValues = null,
}: Props) {
  const [zillowUrl, setZillowUrl] = useState("");
  const [houseTitle, setHouseTitle] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFeet, setSquareFeet] = useState("");
  const [usePresets, setUsePresets] = useState(false);

  const PRESETS = { price: "450000", bedrooms: "3", squareFeet: "2000" };

  const reset = () => {
    setZillowUrl("");
    setHouseTitle("");
    setStreetAddress("");
    setCity("");
    setState("");
    setZip("");
    setPrice("");
    setBedrooms("");
    setBathrooms("");
    setSquareFeet("");
    setUsePresets(false);
  };

  useEffect(() => {
    if (!open) return;
    if (!initialValues) return;
    setZillowUrl(initialValues.zillowUrl ?? "");
    setHouseTitle(initialValues.title ?? "");
    setStreetAddress(initialValues.streetAddress ?? "");
    setCity(initialValues.city ?? "");
    setState(initialValues.state ?? "");
    setZip(initialValues.zip ?? "");
    setPrice(initialValues.price != null ? String(initialValues.price) : "");
    setBedrooms(initialValues.bedrooms != null ? String(initialValues.bedrooms) : "");
    setBathrooms(initialValues.bathrooms != null ? String(initialValues.bathrooms) : "");
    setSquareFeet(initialValues.squareFeet != null ? String(initialValues.squareFeet) : "");
  }, [open, initialValues]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!houseTitle.trim() || !streetAddress || !city || !state || !price) return;
    onSubmit({
      title: houseTitle.trim(),
      zillowUrl,
      streetAddress,
      city,
      state,
      zip,
      price: Number(price),
      bedrooms: bedrooms ? Number(bedrooms) : 0,
      bathrooms: bathrooms ? Number(bathrooms) : 0,
      squareFeet: squareFeet ? Number(squareFeet) : 0,
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="house-title">House title</Label>
            <Input
              id="house-title"
              placeholder="Starter Home in Boise"
              value={houseTitle}
              onChange={(e) => setHouseTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zillow-url">Zillow/Web listing link</Label>
            <Input
              id="zillow-url"
              type="url"
              placeholder="https://www.zillow.com/..."
              value={zillowUrl}
              onChange={(e) => {
                const url = e.target.value;
                setZillowUrl(url);
                const parsed = parseListingUrl(url);
                if (parsed.streetAddress) setStreetAddress(parsed.streetAddress);
                if (parsed.city) setCity(parsed.city);
                if (parsed.state) setState(parsed.state);
                if (parsed.zip) setZip(parsed.zip);
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="street-address">Street address</Label>
            <Input
              id="street-address"
              placeholder="123 Main St or 123 Main St, Boise, ID 83702"
              value={streetAddress}
              onChange={(e) => {
                const value = e.target.value;
                setStreetAddress(value);

                // If the user pastes a full address like:
                // "123 Main St, Boise, ID 83702"
                // try to auto-fill city, state, and zip when those fields are empty.
                if (!city && !state && !zip && value.includes(",")) {
                  const parts = value.split(",").map((p) => p.trim());
                  const street = parts[0] ?? "";
                  const cityPart = parts[1] ?? "";
                  const stateZipPart = parts[2] ?? "";

                  const stateZipTokens = stateZipPart.split(" ").filter(Boolean);
                  const maybeState = stateZipTokens[0] ?? "";
                  const maybeZip = stateZipTokens[1] ?? "";

                  if (street) setStreetAddress(street);
                  if (cityPart) setCity(cityPart);
                  if (maybeState) setState(maybeState.toUpperCase());
                  if (maybeZip) setZip(maybeZip.replace(/\D/g, "").slice(0, 5));
                }
              }}
              required
            />
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                placeholder="Boise"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                placeholder="ID"
                value={state}
                onChange={(e) => setState(e.target.value.toUpperCase())}
                maxLength={2}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">Zip</Label>
              <Input
                id="zip"
                placeholder="83616"
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D/g, "").slice(0, 5))}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <input
              id="use-presets"
              type="checkbox"
              checked={usePresets}
              onChange={(e) => {
                const checked = e.target.checked;
                setUsePresets(checked);
                if (checked) {
                  setPrice(PRESETS.price);
                  setBedrooms(PRESETS.bedrooms);
                  setSquareFeet(PRESETS.squareFeet);
                } else {
                  setPrice("");
                  setBedrooms("");
                  setSquareFeet("");
                }
              }}
              className="h-4 w-4 accent-primary cursor-pointer"
            />
            <Label htmlFor="use-presets" className="cursor-pointer text-sm font-normal text-muted-foreground">
              Use typical values ($450,000 · 3 bd · 2,000 sqft)
            </Label>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                placeholder="450000"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bedrooms">Bedrooms</Label>
              <Input
                id="bedrooms"
                type="number"
                placeholder="3"
                value={bedrooms}
                onChange={(e) => setBedrooms(e.target.value)}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bathrooms">Bathrooms</Label>
              <Input
                id="bathrooms"
                type="number"
                placeholder="2"
                value={bathrooms}
                onChange={(e) => setBathrooms(e.target.value)}
                min="0"
                step="0.5"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="square-feet">Square feet</Label>
            <Input
              id="square-feet"
              type="number"
              placeholder="2000"
              value={squareFeet}
              onChange={(e) => setSquareFeet(e.target.value)}
              min="0"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : submitLabel}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

