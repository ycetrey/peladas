"use client";

import { FIXTURE_SCENARIO_LABEL } from "@peladas/fixtures";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useMemo } from "react";

import { Button } from "@/components/ui/button";

export type AppShellUser = { name: string; email: string };

const ShellContext = createContext<AppShellUser | null>(null);

function useShellUser(): AppShellUser {
  const v = useContext(ShellContext);
  if (!v) {
    throw new Error("AppShellHeaderBar e AppShellMain devem estar dentro de AppShellRoot.");
  }
  return v;
}

/** Provider + contexto do shell (usar com `AppShellHeaderBar` e `AppShellMain`). */
export function AppShellRoot({
  user,
  children,
}: {
  user: AppShellUser;
  children: React.ReactNode;
}) {
  const value = useMemo(() => user, [user]);
  return <ShellContext.Provider value={value}>{children}</ShellContext.Provider>;
}

AppShellRoot.displayName = "AppShellRoot";

export function AppShellHeaderBar() {
  const user = useShellUser();
  const router = useRouter();
  const logout = useCallback(async () => {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    router.push("/login");
    router.refresh();
  }, [router]);

  return (
    <header className="app-header" title={FIXTURE_SCENARIO_LABEL}>
      <h1 className="app-title">
        <Link href="/">Peladas</Link>
      </h1>
      <nav className="app-nav">
        <Link href="/">Dashboard</Link>
      </nav>
      <div className="row" style={{ marginLeft: "auto", gap: "0.75rem", alignItems: "center" }}>
        <span className="muted" style={{ fontSize: "0.875rem" }}>
          {user.name}
          <br />
          <span style={{ fontSize: "0.75rem" }}>{user.email}</span>
        </span>
        <Button type="button" variant="outline" size="sm" onClick={() => void logout()}>
          Sair
        </Button>
      </div>
    </header>
  );
}

AppShellHeaderBar.displayName = "AppShellHeaderBar";

export function AppShellMain({ children }: { children: React.ReactNode }) {
  return <div className="shell-main">{children}</div>;
}

AppShellMain.displayName = "AppShellMain";

/** Agrupador só para convenção “compound” em código; preferir imports nomeados em Server Components. */
export const AppShell = {
  Root: AppShellRoot,
  HeaderBar: AppShellHeaderBar,
  Main: AppShellMain,
};
