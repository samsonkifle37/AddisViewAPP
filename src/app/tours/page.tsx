import { PlaceGrid } from "@/components/PlaceGrid";

export const metadata = {
    title: "Tours — AddisView",
    description: "Explore Ethiopia's iconic destinations — Lalibela, Danakil, Bale Mountains, and more.",
};

export default function ToursPage() {
    return (
        <PlaceGrid
            title="Explore Tours"
            types="tour"
            filterOptions={[
                { value: "", label: "All Tours" },
                { value: "tour", label: "Destinations" },
            ]}
            searchPlaceholder="Lalibela, nature, hiking..."
            accentColor="orange-500"
        />
    );
}
