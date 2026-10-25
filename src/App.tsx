import { type ReactNode } from "react";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer, Nav, ScrollToHash } from "@/components/site";
import { PrefsProvider, useRevealEnabled } from "@/components/prefs";
import { PageMetadata } from "@/components/page-metadata";
import Home from "@/pages/home";
import Work from "@/pages/work";
import ProjectPage from "@/pages/project";
import NotFound from "@/pages/not-found";

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function Shell() {
  useRevealEnabled();
  return (
    <>
      <PageMetadata />
      <ScrollToHash />
      <a href="#main" className="skip-link" data-testid="link-skip">Skip to content</a>
      <div className="flex min-h-[100dvh] flex-col">
        <Nav />
        <main id="main" tabIndex={-1} className="flex-1 outline-none">
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/work" component={Work} />
              <Route path="/work/:slug" component={ProjectPage} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </main>
        <Footer />
      </div>
    </>
  );
}

function App() {
  return (
    <PrefsProvider>
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Shell />
      </WouterRouter>
    </PrefsProvider>
  );
}

export default App;
