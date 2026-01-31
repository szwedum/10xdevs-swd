import { useState } from "react";
import { Button } from "../ui/button";

interface UserMenuProps {
    userEmail: string | undefined;
}

export function UserMenu({ userEmail }: UserMenuProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            if (!response.ok) {
                throw new Error("Failed to log out");
            }

            window.location.href = "/login";
        } catch (error) {
            console.error("Logout failed:", error);
            setIsLoggingOut(false);
        }
    };

    if (!userEmail) {
        return null;
    }

    return (
        <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">{userEmail}</span>
            <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
        </div>
    );
}
