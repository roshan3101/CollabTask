"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAppDispatch } from "@/stores/hooks"
import { searchService } from "@/services/search.service"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, TagsIcon , FolderKanban, Building2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { SearchResult } from "@/services/search.service"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()

  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<SearchResult | null>(null)

  useEffect(() => {
    const q = searchParams.get("q")
    if (q) {
      setSearchQuery(q)
      performSearch(q)
    }
  }, [searchParams])

  const performSearch = async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults(null)
      return
    }

    setIsLoading(true)
    try {
      const response = await searchService.search(query.trim())
      if (response.success && response.data) {
        setResults(response.data)
      } else {
        toast.error(response.error || "Search failed")
        setResults(null)
      }
    } catch (err) {
      toast.error("Failed to perform search")
      setResults(null)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim().length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`)
      performSearch(searchQuery.trim())
    } else {
      toast.error("Search query must be at least 2 characters")
    }
  }

  const handleTaskClick = (task: SearchResult["tasks"][0]) => {
    if (task.org_id && task.project_id) {
      router.push(
        `/organizations/${task.org_id}/projects/${task.project_id}/tasks/${task.id}`
      )
    }
  }

  const handleProjectClick = (project: SearchResult["projects"][0]) => {
    router.push(`/organizations/${project.org_id}/projects/${project.id}`)
  }

  const handleOrganizationClick = (org: SearchResult["organizations"][0]) => {
    router.push(`/organizations/${org.id}`)
  }

  const totalResults =
    (results?.tasks.length || 0) +
    (results?.projects.length || 0) +
    (results?.organizations.length || 0)

  return (
    <div className="space-y-6">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Search</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold mb-2">Search</h1>
        <p className="text-muted-foreground">Search across tasks, projects, and organizations</p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1 max-w-2xl">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search tasks, projects, organizations..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button type="submit" disabled={isLoading || searchQuery.trim().length < 2}>
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Searching...
            </>
          ) : (
            "Search"
          )}
        </Button>
      </form>

      {isLoading && (
        <div className="text-center py-12 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
          Searching...
        </div>
      )}

      {!isLoading && results && (
        <div className="space-y-6">
          {totalResults === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No results found for "{searchQuery}"
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Tasks Results */}
              {results.tasks.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TagsIcon className="w-5 h-5" />
                      Task ({results.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.tasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => handleTaskClick(task)}
                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1">{task.title}</h3>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              {task.project_name && (
                                <span className="flex items-center gap-1">
                                  <FolderKanban className="w-3 h-3" />
                                  {task.project_name}
                                </span>
                              )}
                              {task.org_name && (
                                <span className="flex items-center gap-1">
                                  <Building2 className="w-3 h-3" />
                                  {task.org_name}
                                </span>
                              )}
                            </div>
                          </div>
                          <Badge variant="outline" className="shrink-0">
                            {task.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Projects Results */}
              {results.projects.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderKanban className="w-5 h-5" />
                      Projects ({results.projects.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.projects.map((project) => (
                      <div
                        key={project.id}
                        onClick={() => handleProjectClick(project)}
                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1">{project.name}</h3>
                            {project.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {project.description}
                              </p>
                            )}
                            {project.org_name && (
                              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                                <Building2 className="w-3 h-3" />
                                {project.org_name}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}

              {/* Organizations Results */}
              {results.organizations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="w-5 h-5" />
                      Organizations ({results.organizations.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {results.organizations.map((org) => (
                      <div
                        key={org.id}
                        onClick={() => handleOrganizationClick(org)}
                        className="p-4 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-medium mb-1">{org.name}</h3>
                            {org.description && (
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {org.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      )}

      {!isLoading && !results && searchQuery && (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Enter a search query (minimum 2 characters) and click Search
          </CardContent>
        </Card>
      )}
    </div>
  )
}
