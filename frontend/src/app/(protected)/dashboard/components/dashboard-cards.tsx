import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import React from "react";

interface DashboardCardProps {
    icon: React.ReactNode
    title: string
    value: string
    description: string
}

export default function DashboardCards(
    {icon, title, value, description}: DashboardCardProps
) {
    const cardContent = (
        <Card>
            <CardContent className="p-6 relative overflow-hidden cursor-help">
                {icon && (
                    <div className="pointer-events-none absolute right-4 bottom-2 opacity-10 text-6xl">
                        {icon}
                    </div>
                )}

                <div className="flex flex-col gap-2 relative">
                    <div className="flex items-center justify-between gap-2">
                        <h3 className="text-lg font-semibold">{title}</h3>
                    </div>
                    <h2 className="text-2xl font-bold">{value}</h2>
                </div>
            </CardContent>
        </Card>
    )

    if (!description) {
        return cardContent
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>
                {cardContent}
            </TooltipTrigger>
            <TooltipContent side="right">
                <span>{description}</span>
            </TooltipContent>
        </Tooltip>
    )
}