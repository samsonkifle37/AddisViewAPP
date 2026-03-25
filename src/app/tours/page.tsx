import { PlaceGrid } from "@/components/PlaceGrid";

export const metadata = {
    title: "Tours & Experiences — NU",
    description: "Discover guided tours, museums, parks, markets, and cultural experiences across Ethiopia.",
};

export default function ToursPage() {
    return (
        <PlaceGrid
            title="Tours & Experiences"
            types="tour,tour_operator,guide,experience"
            filterOptions={[
                { value: "", label: "All Tours" },
                { value: "tour", label: "Day Tours" },
                { value: "tour_operator", label: "Operators" },
            ]}
            searchPlaceholder="Lalibela, parks, coffee..."
            accentColor="orange-500"
        />
    );
}
