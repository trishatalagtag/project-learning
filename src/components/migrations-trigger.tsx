import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

/**
 * Component that triggers migrations on app start (runs once)
 */
export function MigrationsTrigger() {
    const triggerMigrations = useMutation(api.migrations.trigger.triggerMigrations);
    const [migrationTriggered, setMigrationTriggered] = useState(false);

    useEffect(() => {
        if (!migrationTriggered) {
            // Trigger migrations on app load (runs once per session)
            triggerMigrations().catch((error) => {
                console.error("Failed to trigger migrations:", error);
            });
            setMigrationTriggered(true);
        }
    }, [migrationTriggered, triggerMigrations]);

    return null; // This component doesn't render anything
}

