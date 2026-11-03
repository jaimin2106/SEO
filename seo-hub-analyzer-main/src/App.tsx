import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import NotFound from "./pages/NotFound.tsx";
import Report from "./pages/Report.tsx";
import Blog from "./pages/Blog.tsx";
import BlogPost from "./pages/BlogPost.tsx";
import About from "./pages/About.tsx";
import SampleReport from "./pages/SampleReport.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Overview from "./pages/Overview.tsx";
import Capabilities from "./pages/Capabilities.tsx";
import Workflow from "./pages/Workflow.tsx";
import Pricing from "./pages/Pricing.tsx";
import Docs from "./pages/Docs.tsx";
import ApiReference from "./pages/ApiReference.tsx";
import CaseStudies from "./pages/CaseStudies.tsx";
import Privacy from "./pages/Privacy.tsx";
import Terms from "./pages/Terms.tsx";
import Support from "./pages/Support.tsx";
import PageTransition from "@/components/seohub/PageTransition.tsx";
import Navbar from "@/components/seohub/Navbar.tsx";
import ScrollToTop from "@/components/seohub/ScrollToTop.tsx";
import SmoothScroll from "@/components/seohub/SmoothScroll.tsx";
import { AnimatePresence, motion } from "framer-motion";
import { AuthProvider } from "@/contexts/AuthContext.tsx";
// ── Admin imports ──────────────────────────────────────────────
import { AdminAuthProvider } from "@/contexts/AdminAuthContext.tsx";
import { AdminGuard } from "@/components/admin/AdminGuard.tsx";
import { PermissionGuard } from "@/components/admin/PermissionGuard.tsx";
import { AdminShell } from "@/components/admin/AdminShell.tsx";
import AdminLogin from "./pages/admin/AdminLogin.tsx";
import AdminDashboard from "./pages/admin/AdminDashboard.tsx";
import AdminUsers from "./pages/admin/AdminUsers.tsx";
import AdminReports from "./pages/admin/AdminReports.tsx";
import AdminLogs from "./pages/admin/AdminLogs.tsx";
import AdminForbidden from "./pages/admin/AdminForbidden.tsx";
import AdminUserProfile from "./pages/admin/AdminUserProfile.tsx";
import AdminActivity from "./pages/admin/AdminActivity.tsx";
import AdminActivityLogs from "./pages/admin/AdminActivityLogs.tsx";
import AdminReportDetail from "./pages/admin/AdminReportDetail.tsx";
import AdminScans from "./pages/admin/AdminScans.tsx";
import AdminScanDetail from "./pages/admin/AdminScanDetail.tsx";
import AdminPDFs from "./pages/admin/AdminPDFs.tsx";
import AdminAI from "./pages/admin/AdminAI.tsx";
import AdminSettings from "./pages/admin/AdminSettings.tsx";
import AdminBlogs from "./pages/admin/AdminBlogs.tsx";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor.tsx";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions.tsx";
import AdminPlans from "./pages/admin/AdminPlans.tsx";
import AdminCredits from "./pages/admin/AdminCredits.tsx";
import AdminRevenue from "./pages/admin/AdminRevenue.tsx";
import AdminSupport from "./pages/admin/AdminSupport.tsx";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,          // 60s — data is fresh; navigating pages won't re-trigger loads
      gcTime: 300_000,            // 5min — keep cache alive while switching pages
      refetchOnWindowFocus: false, // Admin dashboard doesn't need aggressive refetching
      retry: 1,
    },
  },
});

// Public animated routes — Navbar is visible here
const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 14, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, filter: "blur(8px)" }}
        transition={{ duration: 0.52, ease: [0.22, 1, 0.36, 1] }}
        className="flex-1 flex flex-col"
      >
        <Routes location={location}>
          <Route path="/" element={<Index />} />
          <Route path="/about" element={<About />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/capabilities" element={<Capabilities />} />
          <Route path="/workflow" element={<Workflow />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/docs" element={<Docs />} />
          <Route path="/api-reference" element={<ApiReference />} />
          <Route path="/case-studies" element={<CaseStudies />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/sample-report" element={<SampleReport />} />
          <Route path="/report" element={<Report />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/blog/:slug" element={<BlogPost />} />
          <Route path="/support" element={<Support />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

// Wrapper that conditionally hides Navbar on /admin/* paths
const NavbarConditional = () => {
  const location = useLocation();
  if (location.pathname.startsWith("/admin")) return null;
  return <Navbar />;
};

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <SmoothScroll>
            <ScrollToTop />
            <Routes>
              {/* ── Admin routes (no Navbar, no PageTransition, own layout) ── */}
              <Route
                path="/admin/*"
                element={
                  <AdminAuthProvider>
                    <Routes>
                      <Route path="login" element={<AdminLogin />} />
                      <Route
                        path="*"
                        element={
                          <AdminGuard>
                            <AdminShell>
                              <Routes>
                                <Route index element={<AdminDashboard />} />
                                <Route path="dashboard" element={<AdminDashboard />} />
                                
                                {/* Platform */}
                                <Route path="users" element={<PermissionGuard permission="users.view"><AdminUsers /></PermissionGuard>} />
                                <Route path="users/:userId" element={<PermissionGuard permission="users.view"><AdminUserProfile /></PermissionGuard>} />
                                <Route path="activity" element={<PermissionGuard permission="audit.view"><AdminActivity /></PermissionGuard>} />
                                <Route path="activity/logs" element={<PermissionGuard permission="audit.view"><AdminActivityLogs /></PermissionGuard>} />
                                <Route path="reports" element={<PermissionGuard permission="reports.view"><AdminReports /></PermissionGuard>} />
                                <Route path="reports/:id" element={<PermissionGuard permission="reports.view"><AdminReportDetail /></PermissionGuard>} />
                                <Route path="scans" element={<PermissionGuard permission="reports.view"><AdminScans /></PermissionGuard>} />
                                <Route path="scans/:id" element={<PermissionGuard permission="reports.view"><AdminScanDetail /></PermissionGuard>} />
                                <Route path="pdfs" element={<PermissionGuard permission="reports.view"><AdminPDFs /></PermissionGuard>} />
                                <Route path="ai" element={<PermissionGuard permission="reports.view"><AdminAI /></PermissionGuard>} />
                                <Route path="blogs" element={<PermissionGuard permission="settings.edit"><AdminBlogs /></PermissionGuard>} />
                                <Route path="blogs/editor/:id" element={<PermissionGuard permission="settings.edit"><AdminBlogEditor /></PermissionGuard>} />
                                
                                {/* Financial Ops */}
                                <Route path="subscriptions" element={<PermissionGuard permission="credits.view"><AdminSubscriptions /></PermissionGuard>} />
                                <Route path="plans" element={<PermissionGuard permission="settings.edit"><AdminPlans /></PermissionGuard>} />
                                <Route path="credits" element={<PermissionGuard permission="credits.view"><AdminCredits /></PermissionGuard>} />
                                <Route path="revenue" element={<PermissionGuard permission="analytics.view"><AdminRevenue /></PermissionGuard>} />
                                
                                {/* System */}
                                <Route path="logs" element={<PermissionGuard permission="audit.view"><AdminLogs /></PermissionGuard>} />
                                <Route path="support" element={<AdminSupport />} /> {/* Support accessible to all admins */}
                                <Route path="settings" element={<PermissionGuard permission="settings.view"><AdminSettings /></PermissionGuard>} />
                                
                                {/* Shared */}
                                <Route path="forbidden" element={<AdminForbidden />} />
                                <Route path="*" element={<AdminForbidden />} />
                              </Routes>
                            </AdminShell>
                          </AdminGuard>
                        }
                      />
                    </Routes>
                  </AdminAuthProvider>
                }
              />

              {/* ── Public routes (with Navbar + PageTransition) ── */}
              <Route
                path="/*"
                element={
                  <>
                    <NavbarConditional />
                    <AnimatedRoutes />
                  </>
                }
              />
            </Routes>
          </SmoothScroll>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;

