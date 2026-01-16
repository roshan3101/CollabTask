import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Dashboard() {
  return (
    <div className="p-6">
      <Card>
        <CardHeader>
          <CardTitle>CollabTask Dashboard</CardTitle>
        </CardHeader>
        <CardContent>
          Backend is real. Frontend is catching up.
        </CardContent>
      </Card>
    </div>
  )
}
