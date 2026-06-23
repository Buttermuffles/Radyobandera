import { lazy, Suspense, useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { LiveBarFAB } from "./components/layout/LiveBarFAB";
import { AdBanner } from "./components/media/AdBanner";
import { useLiveStream } from "./hooks/useLiveStream";
import { ScrollToTop } from "./components/common/ScrollToTop";
import { ErrorBoundary } from "./components/common/ErrorBoundary";
import { SEO } from "./components/common/SEO";

const Article = lazy(() => import("./pages/Article").then((m) => ({ default: m.Article })));
const Category = lazy(() => import("./pages/Category").then((m) => ({ default: m.Category })));
const Home = lazy(() => import("./pages/Home").then((m) => ({ default: m.Home })));
const Search = lazy(() => import("./pages/Search").then((m) => ({ default: m.Search })));
const General = lazy(() => import("./pages/General").then((m) => ({ default: m.General })));

function PageLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-red border-t-transparent" />
    </div>
  );
}

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteMeta() {
  const location = useLocation();
  const path = location.pathname === "/" ? "Top Stories" : location.pathname.replace("/", "").replace("-", " ");

  return <SEO title={path === "Top Stories" ? undefined : path} />;
}

function AppShell() {
  const navigate = useNavigate();
  const { stream } = useLiveStream();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(204,0,0,0.08),_transparent_30%),linear-gradient(180deg,_#fff_0%,_#f4f4f4_100%)] pt-[72px] sm:pt-[80px]">
      <AdBanner />
      <Header
        onSearch={(query) => {
          if (query) {
            navigate(`/search?q=${encodeURIComponent(query)}`);
          }
        }}
      />

      <ScrollToTopOnRouteChange />
      <RouteMeta />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-5 sm:pb-5 md:pb-5 lg:pb-5">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route
              path="/"
              element={
                <ErrorBoundary>
                  <Home videoUrl={stream?.videoUrl ?? ""} isLive={stream?.isLive ?? false} embedHtml={stream?.embedHtml ?? ""} permalinkUrl={stream?.permalinkUrl ?? ""} />
                </ErrorBoundary>
              }
            />
            <Route
              path="/article/:slug"
              element={
                <ErrorBoundary>
                  <Article />
                </ErrorBoundary>
              }
            />
            <Route
              path="/category/:category"
              element={
                <ErrorBoundary>
                  <Category />
                </ErrorBoundary>
              }
            />
            <Route
              path="/general"
              element={
                <ErrorBoundary>
                  <General />
                </ErrorBoundary>
              }
            />
            <Route
              path="/search"
              element={
                <ErrorBoundary>
                  <Search />
                </ErrorBoundary>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      <Footer />

      <div className="lg:hidden">
        <LiveBarFAB
          isLive={stream?.isLive ?? false}
          onWatchClick={() => {
            const player = document.getElementById("live-player");
            player?.scrollIntoView({ behavior: "smooth" });
          }}
        />
      </div>

      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
