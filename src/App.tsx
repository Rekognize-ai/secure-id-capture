import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { EnrollmentProvider } from "@/context/EnrollmentContext";

import Home from "./pages/Home";
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
            <Route path="/" element={<Home />} />
            <Route path="/enrollment-form" element={<EnrollmentForm />} />
            <Route path="/facial-capture" element={<FacialCapture />} />
            <Route path="/liveness-check" element={<LivenessCheck />} />
            <Route path="/enrollment-review" element={<EnrollmentReview />} />
            <Route path="/enrollment-success" element={<EnrollmentSuccess />} />
            <Route path="/sync" element={<SyncScreen />} />
            <Route path="/verify" element={<VerifyIdentity />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </EnrollmentProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
