import { PlaceGrid } from "@/components/PlaceGrid";

export const metadata = {
    title: "Dining — NU",
    description: "Find the best restaurants, cafes, and nightlife in Ethiopia.",
};

export default function DiningPage() {
    return (
        <PlaceGrid
            title="Dining & Nightlife"
            types="restaurant,coffee,club,nightlife"
            filterOptions={[
                { value: "", label: "All Dining" },
                { value: "restaurant", label: "Restaurants" },
                { value: "coffee", label: "Coffee Shops" },
                { value: "club", label: "Nightlife" },
            ]}
            searchPlaceholder="Injera, coffee, clubs..."
            accentColor="ethiopia-red"
        />
    );
}
