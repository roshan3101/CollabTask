"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


export function LoginForm() {
    return (
        <Card className="w-[350px]">
            <CardHeader>
                <CardTitle>Login to your account</CardTitle>
            </CardHeader>

            <CardContent>
                <form className="space-y-4">
                    <div className="space-y-4">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="you@example.com" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input id="password" type="password" />
                    </div>

                    <Button className="w-full" type="submit">
                        Sign in
                    </Button>
                </form>
            </CardContent>
        </Card>
    )
}