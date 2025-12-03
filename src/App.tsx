import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EnrollmentProvider } from "@/context/EnrollmentContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

import Auth from "./pages/Auth";
import Home from "./pages/Home";
import AdminDashboard from "./pages/AdminDashboard";
import { AdminRoute } from "./components/AdminRoute";
import Profile from "./pages/Profile";
import EnrollmentForm from "./pages/EnrollmentForm";
import FacialCapture from "./pages/FacialCapture";
import LivenessCheck from "./pages/LivenessCheck";
import EnrollmentReview from "./pages/EnrollmentReview";
import EnrollmentSuccess from "./pages/EnrollmentSuccess";
import SyncScreen from "./pages/SyncScreen";
import VerifyIdentity from "./pages/VerifyIdentity";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <EnrollmentProvider>
        <Toaster />
        <Sonner position="top-center" />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/enrollment-form" element={<ProtectedRoute><EnrollmentForm /></ProtectedRoute>} />
            <Route path="/facial-capture" element={<ProtectedRoute><FacialCapture /></ProtectedRoute>} />
            <Route path="/liveness-check" element={<ProtectedRoute><LivenessCheck /></ProtectedRoute>} />
            <Route path="/enrollment-review" element={<ProtectedRoute><EnrollmentReview /></ProtectedRoute>} />
            <Route path="/enrollment-success" element={<ProtectedRoute><EnrollmentSuccess /></ProtectedRoute>} />
            <Route path="/sync" element={<ProtectedRoute><SyncScreen /></ProtectedRoute>} />
            <Route path="/verify" element={<ProtectedRoute><VerifyIdentity /></ProtectedRoute>} />
            <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </EnrollmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
