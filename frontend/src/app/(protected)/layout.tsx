import React from "react";

export default function ProtectedLayout({
    children
}: {
    children: React.ReactNode
}) {

    const isAuthenticated = true

    if(!isAuthenticated) {
        return <div>Unauthorized</div>
    }

    return (
        <div className="min-h-screen">
            {children}
        </div>
    )
}