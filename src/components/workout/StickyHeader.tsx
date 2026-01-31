interface StickyHeaderProps {
    templateName: string;
    loggedAt: string;
}

export function StickyHeader({ templateName, loggedAt }: StickyHeaderProps) {
    const date = new Date(loggedAt);
    const formattedDate = date.toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="container mx-auto px-4 py-4">
                <h1 className="text-2xl font-bold text-gray-900">{templateName}</h1>
                <p className="text-sm text-gray-600 mt-1">{formattedDate}</p>
            </div>
        </header>
    );
}
