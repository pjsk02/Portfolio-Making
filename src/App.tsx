import { type ReactNode } from "react";
import { Route, Switch, useLocation, Router as WouterRouter } from "wouter";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer, Nav, ScrollToHash } from "@/components/site";
import Home from "@/pages/home";
import Work from "@/pages/work";
import ProjectPage from "@/pages/project";
import NotFound from "@/pages/not-found";

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  return (
    <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
      <ScrollToHash />
      <div className="flex min-h-[100dvh] flex-col">
        <Nav />
        <div className="flex-1">
          <RoutedErrorBoundary>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/work" component={Work} />
              <Route path="/work/:slug" component={ProjectPage} />
              <Route component={NotFound} />
            </Switch>
          </RoutedErrorBoundary>
        </div>
        <Footer />
      </div>
    </WouterRouter>
  );
}

export default App;
