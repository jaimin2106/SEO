# Graph Report - seo-hub-analyzer-main  (2026-05-18)

## Corpus Check
- 97 files · ~46,814 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 518 nodes · 760 edges · 45 communities (40 shown, 5 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 2 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a424751`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 70 edges
2. `runForensicAnalysis()` - 22 edges
3. `unique()` - 12 edges
4. `buildPageSnapshot()` - 8 edges
5. `fetchPageSpeedSnapshot()` - 8 edges
6. `clamp()` - 7 edges
7. `ForensicReport` - 7 edges
8. `buttonVariants` - 6 edges
9. `truncate()` - 5 edges
10. `Badge()` - 5 edges

## Surprising Connections (you probably didn't know these)
- `buildPrintHtml()` --calls--> `scoreToneClass()`  [INFERRED]
  src/pages/SampleReport.tsx → src/components/report/pdfExport.ts
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `BreadcrumbSeparator()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/breadcrumb.tsx → src/lib/utils.ts
- `BreadcrumbEllipsis()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/breadcrumb.tsx → src/lib/utils.ts

## Communities (45 total, 5 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.05
Nodes (73): average(), buildAiVisibilityAudit(), buildBenchmarkingAudit(), buildContentAudit(), buildExecutiveSummary(), buildFrontendAudit(), buildIssues(), buildPageSnapshot() (+65 more)

### Community 1 - "Community 1"
Cohesion: 0.05
Nodes (38): useIsMobile(), Input, Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader() (+30 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (31): IssueCard(), loadingSteps, Report(), ReportTab, ScoreDial(), scoreTone(), severityClasses(), tabs (+23 more)

### Community 3 - "Community 3"
Cohesion: 0.06
Nodes (9): fadeUp, staggerContainer, buildPrintHtml(), mockReport, BrandLogoProps, PageTransitionProps, queryClient, Toaster() (+1 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (24): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+16 more)

### Community 5 - "Community 5"
Cohesion: 0.09
Nodes (6): steps, tiers, RevealProps, Props, containerVariants, itemVariants

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (15): Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+7 more)

### Community 7 - "Community 7"
Cohesion: 0.12
Nodes (9): Checkbox, HoverCardContent, PopoverContent, RadioGroup, RadioGroupItem, Slider, Switch, Textarea (+1 more)

### Community 8 - "Community 8"
Cohesion: 0.14
Nodes (14): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle (+6 more)

### Community 9 - "Community 9"
Cohesion: 0.14
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 10 - "Community 10"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 11 - "Community 11"
Cohesion: 0.26
Nodes (10): cn(), Pagination(), PaginationContent, PaginationEllipsis(), PaginationItem, PaginationLinkProps, PaginationNext(), PaginationPrevious() (+2 more)

### Community 12 - "Community 12"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 13 - "Community 13"
Cohesion: 0.25
Nodes (9): AiSnippetPreview(), MODES, OgPreview(), PreviewEngine(), PreviewMode, Props, SerpPreview(), truncate() (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 15 - "Community 15"
Cohesion: 0.2
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 16 - "Community 16"
Cohesion: 0.2
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 17 - "Community 17"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 18 - "Community 18"
Cohesion: 0.22
Nodes (6): BlogPostSchemaProps, BreadcrumbItem, faqPageSchema, organizationSchema, softwareApplicationSchema, websiteSchema

### Community 19 - "Community 19"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 20 - "Community 20"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 21 - "Community 21"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 22 - "Community 22"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 23 - "Community 23"
Cohesion: 0.29
Nodes (4): __dirname, OUTPUT_PATH, routes, xml

### Community 24 - "Community 24"
Cohesion: 0.29
Nodes (6): Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle

### Community 25 - "Community 25"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 26 - "Community 26"
Cohesion: 0.4
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 28 - "Community 28"
Cohesion: 0.5
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 29 - "Community 29"
Cohesion: 0.5
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 30 - "Community 30"
Cohesion: 0.5
Nodes (3): BLOG_POST_META, PAGE_META, PageMeta

## Knowledge Gaps
- **237 isolated node(s):** `__dirname`, `OUTPUT_PATH`, `routes`, `xml`, `queryClient` (+232 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **5 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 11` to `Community 1`, `Community 2`, `Community 4`, `Community 6`, `Community 7`, `Community 8`, `Community 9`, `Community 10`, `Community 12`, `Community 14`, `Community 15`, `Community 16`, `Community 17`, `Community 19`, `Community 20`, `Community 21`, `Community 22`, `Community 24`, `Community 25`, `Community 26`, `Community 28`, `Community 29`, `Community 31`, `Community 32`?**
  _High betweenness centrality (0.336) - this node is a cross-community bridge._
- **Why does `runForensicAnalysis()` connect `Community 0` to `Community 2`?**
  _High betweenness centrality (0.030) - this node is a cross-community bridge._
- **Why does `Badge()` connect `Community 2` to `Community 11`?**
  _High betweenness centrality (0.026) - this node is a cross-community bridge._
- **What connects `__dirname`, `OUTPUT_PATH`, `routes` to the rest of the system?**
  _237 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._
- **Should `Community 2` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._