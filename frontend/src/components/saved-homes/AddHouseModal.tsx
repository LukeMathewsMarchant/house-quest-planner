import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type HouseFormValues = {
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
  description = "Paste a Zillow link and basic details. We&apos;ll use this to compare the home against your savings and budget.",
  submitLabel = "Save house",
  initialValues = null,
}: Props) {
  const [zillowUrl, setZillowUrl] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [price, setPrice] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [bathrooms, setBathrooms] = useState("");
  const [squareFeet, setSquareFeet] = useState("");

  const reset = () => {
    setZillowUrl("");
    setStreetAddress("");
    setCity("");
    setState("");
    setZip("");
    setPrice("");
    setBedrooms("");
    setBathrooms("");
    setSquareFeet("");
  };

  useEffect(() => {
    if (!open) return;
    if (!initialValues) return;
    setZillowUrl(initialValues.zillowUrl ?? "");
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
    if (!streetAddress || !city || !state || !price) return;
    onSubmit({
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
            <Label htmlFor="zillow-url">Zillow link</Label>
            <Input
              id="zillow-url"
              type="url"
              placeholder="https://www.zillow.com/..."
              value={zillowUrl}
              onChange={(e) => setZillowUrl(e.target.value)}
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

