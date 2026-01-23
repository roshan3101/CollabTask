"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react"

// Dummy events data
const DUMMY_EVENTS: Array<{
  id: string
  title: string
  date: Date
  color: string
}> = [
  { id: "1", title: "Team Meeting", date: new Date(2024, 0, 15), color: "bg-blue-500" },
  { id: "2", title: "Project Review", date: new Date(2024, 0, 20), color: "bg-green-500" },
  { id: "3", title: "Sprint Planning", date: new Date(2024, 0, 25), color: "bg-purple-500" },
]

export default function CalendarPage() {
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()

  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const daysInMonth = lastDayOfMonth.getDate()
  const startingDayOfWeek = firstDayOfMonth.getDay()

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  const navigateMonth = (direction: "prev" | "next") => {
    setCurrentDate((prev) => {
      const newDate = new Date(prev)
      if (direction === "prev") {
        newDate.setMonth(newDate.getMonth() - 1)
      } else {
        newDate.setMonth(newDate.getMonth() + 1)
      }
      return newDate
    })
  }

  const navigateToToday = () => {
    setCurrentDate(new Date())
  }

  const canNavigatePrev = useMemo(() => {
    const minDate = new Date()
    minDate.setFullYear(minDate.getFullYear() - 1)
    return currentDate > minDate
  }, [currentDate])

  const canNavigateNext = useMemo(() => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    return currentDate < maxDate
  }, [currentDate])

  const getEventsForDate = (date: Date) => {
    return DUMMY_EVENTS.filter(
      (event) =>
        event.date.getDate() === date.getDate() &&
        event.date.getMonth() === date.getMonth() &&
        event.date.getFullYear() === date.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const renderCalendarDays = () => {
    const days = []
    const today = new Date()

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="aspect-square p-1">
          <div className="h-full rounded-md border border-transparent"></div>
        </div>
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      const events = getEventsForDate(date)
      const isCurrentDay = isToday(date)

      days.push(
        <div key={day} className="aspect-square p-0.5">
          <div
            className={`h-full rounded-md border p-1 ${
              isCurrentDay
                ? "border-primary bg-primary/10"
                : "border-border hover:bg-muted/50"
            } transition-colors`}
          >
            <div
              className={`text-xs font-medium mb-0.5 ${
                isCurrentDay ? "text-primary" : "text-foreground"
              }`}
            >
              {day}
            </div>
            <div className="space-y-0.5">
              {events.slice(0, 1).map((event) => (
                <div
                  key={event.id}
                  className={`${event.color} text-white text-[8px] px-0.5 py-0 rounded truncate`}
                  title={event.title}
                >
                  {event.title}
                </div>
              ))}
              {events.length > 1 && (
                <div className="text-[8px] text-muted-foreground">
                  +{events.length - 1}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }

    return days
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("prev")}
                disabled={!canNavigatePrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <h2 className="text-2xl font-semibold min-w-[200px] text-center">
                {monthNames[month]} {year}
              </h2>
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth("next")}
                disabled={!canNavigateNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Day Names Header */}
          <div className="grid grid-cols-7 gap-0.5 mb-1">
            {dayNames.map((day) => (
              <div key={day} className="text-center text-xs font-medium text-muted-foreground py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0.5">
            {renderCalendarDays()}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
