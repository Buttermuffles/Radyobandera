import { useEffect } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { Footer } from "./components/layout/Footer";
import { Header } from "./components/layout/Header";
import { LiveBar } from "./components/layout/LiveBar";
import { LiveBarFAB } from "./components/layout/LiveBarFAB";
import { AdBanner } from "./components/media/AdBanner";
import { useBreakingNews } from "./hooks/useBreakingNews";
import { useLiveStream } from "./hooks/useLiveStream";
import { Article } from "./pages/Article";
import { Category } from "./pages/Category";
import { Home } from "./pages/Home";
import { Search } from "./pages/Search";
import { General } from "./pages/General";
import { ScrollToTop } from "./components/common/ScrollToTop";

function ScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function RouteTitle() {
  const location = useLocation();

  useEffect(() => {
    const page = location.pathname === "/" ? "Top Stories" : location.pathname.replace("/", "");
    document.title = `Radyo Bandera Surallah 98.1 FM | ${page}`;
  }, [location.pathname]);

  return null;
}

function AppShell() {
  const navigate = useNavigate();
  const { items: breaking } = useBreakingNews();
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
      <RouteTitle />

      <main className="mx-auto w-full max-w-7xl px-4 py-5 pb-24 sm:pb-5 md:pb-5 lg:pb-5">
        <Routes>
          <Route
            path="/"
            element={<Home videoUrl={stream?.videoUrl ?? ""} isLive={stream?.isLive ?? false} audioUrl={stream?.audioUrl ?? ""} />}
          />
          <Route path="/article/:slug" element={<Article />} />
          <Route path="/category/:category" element={<Category />} />
          <Route path="/general" element={<General />} />
          <Route path="/search" element={<Search />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer />
      
      {/* Desktop live bar (lg+) */}
      <div className="hidden lg:block">
        <LiveBar audioUrl={stream?.audioUrl ?? ""} items={breaking} />
      </div>

      {/* Mobile live bar FAB (<lg) */}
      <div className="lg:hidden">
        <LiveBarFAB 
          isLive={stream?.isLive ?? false}
          audioUrl={stream?.audioUrl ?? ""}
          onWatchClick={() => {
            const player = document.getElementById("live-player");
            player?.scrollIntoView({ behavior: "smooth" });
          }}
          onListenClick={() => {
            // Audio plays automatically when button clicked in FAB
          }}
        />
      </div>

      <ScrollToTop />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;
