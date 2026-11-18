import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { EventCollectionsProvider } from "@/hooks/useEventCollections";
import { CmsProvider } from "@/cms/CmsProvider";
import { AuthProvider } from "@/cms/AuthProvider";
import { RequireAuth } from "@/components/admin/RequireAuth";
import Index from "./pages/Index.tsx";
import Give from "./pages/Give.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import Contact from "./pages/Contact.tsx";
import MemberAccount from "./pages/MemberAccount.tsx";
import DashboardLayout from "./pages/dashboard/DashboardLayout.tsx";
import Overview from "./pages/dashboard/Overview.tsx";
import PostersPage from "./pages/dashboard/PostersPage.tsx";
import SliderPage from "./pages/dashboard/SliderPage.tsx";
import ValuesPage from "./pages/dashboard/ValuesPage.tsx";
import CommitteePage from "./pages/dashboard/CommitteePage.tsx";
import HomepageHubPage from "./pages/dashboard/homepage/HomepageHubPage.tsx";
import HeroContentPage from "./pages/dashboard/homepage/HeroContentPage.tsx";
import HomepageHighlightsPage from "./pages/dashboard/homepage/HomepageHighlightsPage.tsx";
import {
  AnnouncementsPage,
  EventsPage,
  GalleryPage,
  GivingCategoriesPage,
  MinistriesPage,
} from "./pages/dashboard/ContentPages.tsx";
import SiteSettingsPage from "./pages/dashboard/SiteSettingsPage.tsx";
import BudgetSettingsPage from "./pages/dashboard/BudgetSettingsPage.tsx";
import UsersPage from "./pages/dashboard/UsersPage.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <CmsProvider>
      <AuthProvider>
        <EventCollectionsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/give" element={<Give />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/contact" element={<Contact />} />
                <Route
                  path="/account"
                  element={
                    <RequireAuth>
                      <MemberAccount />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <RequireAuth role="admin">
                      <DashboardLayout />
                    </RequireAuth>
                  }
                >
                  <Route index element={<Overview />} />
                  <Route path="homepage" element={<HomepageHubPage />} />
                  <Route path="homepage/hero" element={<HeroContentPage />} />
                  <Route path="homepage/highlights" element={<HomepageHighlightsPage />} />
                  <Route path="posters" element={<PostersPage />} />
                  <Route path="slider" element={<Navigate to="/dashboard/homepage/highlights" replace />} />
                  <Route path="scripture-cards" element={<SliderPage placement="scripture" />} />
                  <Route path="values" element={<ValuesPage />} />
                  <Route path="committee" element={<CommitteePage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="gallery" element={<GalleryPage />} />
                  <Route path="ministries" element={<MinistriesPage />} />
                  <Route path="giving-categories" element={<GivingCategoriesPage />} />
                  <Route path="budget" element={<BudgetSettingsPage />} />
                  <Route path="settings" element={<SiteSettingsPage />} />
                  <Route path="users" element={<UsersPage />} />
                </Route>
                <Route path="/admin" element={<Navigate to="/login" replace />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </EventCollectionsProvider>
      </AuthProvider>
    </CmsProvider>
  </QueryClientProvider>
);

export default App;
