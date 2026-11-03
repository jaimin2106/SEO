# Graph Report - .  (2026-05-14)

## Corpus Check
- Corpus is ~20,457 words - fits in a single context window. You may not need a graph.

## Summary
- 377 nodes · 495 edges · 36 communities (33 shown, 3 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_UI Primitives A|UI Primitives A]]
- [[_COMMUNITY_UI Primitives B|UI Primitives B]]
- [[_COMMUNITY_Landing Page & App Core|Landing Page & App Core]]
- [[_COMMUNITY_Sidebar & Navigation|Sidebar & Navigation]]
- [[_COMMUNITY_Toast Notifications|Toast Notifications]]
- [[_COMMUNITY_Command & Dialog|Command & Dialog]]
- [[_COMMUNITY_Form Elements|Form Elements]]
- [[_COMMUNITY_Carousel Component|Carousel Component]]
- [[_COMMUNITY_Menubar Component|Menubar Component]]
- [[_COMMUNITY_Chart Components|Chart Components]]
- [[_COMMUNITY_Context Menu|Context Menu]]
- [[_COMMUNITY_Dropdown Menu|Dropdown Menu]]
- [[_COMMUNITY_Sheet Component|Sheet Component]]
- [[_COMMUNITY_Table Component|Table Component]]
- [[_COMMUNITY_SEO Schemas|SEO Schemas]]
- [[_COMMUNITY_Navigation Menu|Navigation Menu]]
- [[_COMMUNITY_Select Component|Select Component]]
- [[_COMMUNITY_Sitemap Script|Sitemap Script]]
- [[_COMMUNITY_Toggle Components|Toggle Components]]
- [[_COMMUNITY_SEO Metadata|SEO Metadata]]
- [[_COMMUNITY_Alert Component|Alert Component]]
- [[_COMMUNITY_Demo Report|Demo Report]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Accordion|Accordion]]
- [[_COMMUNITY_AlertDialog|AlertDialog]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 72 edges
2. `Reveal()` - 6 edges
3. `buttonVariants` - 6 edges
4. `Toast` - 4 edges
5. `useToast()` - 4 edges
6. `Index()` - 4 edges
7. `Hero()` - 3 edges
8. `Navbar()` - 3 edges
9. `Badge()` - 3 edges
10. `Button` - 3 edges

## Surprising Connections (you probably didn't know these)
- `CommandShortcut()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/command.tsx → src/lib/utils.ts
- `ContextMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/context-menu.tsx → src/lib/utils.ts
- `DialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dialog.tsx → src/lib/utils.ts
- `DropdownMenuShortcut()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/dropdown-menu.tsx → src/lib/utils.ts

## Communities (36 total, 3 thin omitted)

### Community 0 - "UI Primitives A"
Cohesion: 0.06
Nodes (43): cn(), AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay (+35 more)

### Community 1 - "UI Primitives B"
Cohesion: 0.04
Nodes (30): NavLink, NavLinkCompatProps, AccordionContent, AccordionItem, AccordionTrigger, Card, CardContent, CardDescription (+22 more)

### Community 2 - "Landing Page & App Core"
Cohesion: 0.08
Nodes (19): Index(), features, FinalCta(), Hero(), HowItWorks(), steps, links, Navbar() (+11 more)

### Community 3 - "Sidebar & Navigation"
Cohesion: 0.06
Nodes (29): useIsMobile(), Input, Separator, Sidebar, SidebarContent, SidebarContext, SidebarFooter, SidebarGroup (+21 more)

### Community 4 - "Toast Notifications"
Cohesion: 0.11
Nodes (24): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+16 more)

### Community 5 - "Command & Dialog"
Cohesion: 0.12
Nodes (15): Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+7 more)

### Community 6 - "Form Elements"
Cohesion: 0.15
Nodes (11): FormControl, FormDescription, FormFieldContext, FormFieldContextValue, FormItem, FormItemContext, FormItemContextValue, FormLabel (+3 more)

### Community 7 - "Carousel Component"
Cohesion: 0.14
Nodes (12): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+4 more)

### Community 8 - "Menubar Component"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 9 - "Chart Components"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 10 - "Context Menu"
Cohesion: 0.2
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 11 - "Dropdown Menu"
Cohesion: 0.2
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 12 - "Sheet Component"
Cohesion: 0.22
Nodes (8): SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay, SheetTitle, sheetVariants

### Community 13 - "Table Component"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 14 - "SEO Schemas"
Cohesion: 0.22
Nodes (6): BlogPostSchemaProps, BreadcrumbItem, faqPageSchema, organizationSchema, softwareApplicationSchema, websiteSchema

### Community 15 - "Navigation Menu"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 16 - "Select Component"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 17 - "Sitemap Script"
Cohesion: 0.29
Nodes (4): __dirname, OUTPUT_PATH, routes, xml

### Community 18 - "Toggle Components"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 19 - "SEO Metadata"
Cohesion: 0.29
Nodes (5): MetaTags(), MetaTagsProps, BLOG_POST_META, PAGE_META, PageMeta

### Community 20 - "Alert Component"
Cohesion: 0.4
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 22 - "Avatar Component"
Cohesion: 0.5
Nodes (3): Avatar, AvatarFallback, AvatarImage

## Knowledge Gaps
- **213 isolated node(s):** `__dirname`, `OUTPUT_PATH`, `routes`, `xml`, `queryClient` (+208 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **3 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `UI Primitives A` to `UI Primitives B`, `Sidebar & Navigation`, `Toast Notifications`, `Command & Dialog`, `Form Elements`, `Carousel Component`, `Menubar Component`, `Chart Components`, `Context Menu`, `Dropdown Menu`, `Sheet Component`, `Table Component`, `Navigation Menu`, `Select Component`, `Toggle Components`, `Alert Component`, `Avatar Component`?**
  _High betweenness centrality (0.425) - this node is a cross-community bridge._
- **Why does `Index()` connect `Landing Page & App Core` to `SEO Metadata`?**
  _High betweenness centrality (0.037) - this node is a cross-community bridge._
- **Why does `MetaTags()` connect `SEO Metadata` to `Landing Page & App Core`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **What connects `__dirname`, `OUTPUT_PATH`, `routes` to the rest of the system?**
  _213 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Primitives A` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `UI Primitives B` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Landing Page & App Core` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._