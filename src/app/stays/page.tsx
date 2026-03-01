import { PlaceGrid } from "@/components/PlaceGrid";

export const metadata = {
    title: "Stays — AddisView",
    description: "Find hotels, guesthouses, apartments, and resorts across Ethiopia.",
};

export default function StaysPage() {
    return (
        <PlaceGrid
            title="Discover Stays"
            types="hotel,guesthouse,apartment,resort"
            filterOptions={[
                { value: "", label: "All Stays" },
                { value: "hotel", label: "Hotels" },
                { value: "guesthouse", label: "Guesthouses" },
                { value: "apartment", label: "Apartments" },
                { value: "resort", label: "Resorts" },
            ]}
            searchPlaceholder="Bole, hotels, apartments..."
            accentColor="ethiopia-green"
        />
    );
}
