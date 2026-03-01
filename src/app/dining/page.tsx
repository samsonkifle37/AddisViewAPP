import { PlaceGrid } from "@/components/PlaceGrid";

export const metadata = {
    title: "Dining & Nightlife — AddisView",
    description: "Cultural restaurants, traditional food, live music, and vibrant clubs in Addis Ababa.",
};

export default function DiningPage() {
    return (
        <PlaceGrid
            title="Dining & Nightlife"
            types="restaurant,club"
            filterOptions={[
                { value: "", label: "All" },
                { value: "restaurant", label: "Restaurants" },
                { value: "club", label: "Bars & Clubs" },
            ]}
            searchPlaceholder="Yod, Fendika, music..."
            accentColor="rose-500"
        />
    );
}
