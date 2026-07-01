import React, { useEffect } from "react";
import { Route, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { Layout } from "@/components/layout";
import { Loader2 } from "lucide-react";

export function ProtectedRoute({ component: Component, path }: { component: React.ComponentType<any>, path: string }) {
  const { token, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !token) {
      setLocation("/login");
    }
  }, [token, isLoading, setLocation]);

  return (
    <Route path={path}>
      {(params) => {
        if (isLoading) {
          return (
            <div className="flex h-screen w-full items-center justify-center bg-background text-primary">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          );
        }

        if (!token) {
          return null;
        }

        return (
          <Layout>
            <Component {...params} />
          </Layout>
        );
      }}
    </Route>
  );
}
