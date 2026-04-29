import { cookies } from "next/headers";
import {
  AppShellHeaderBar,
  AppShellMain,
  AppShellRoot,
} from "../../components/organisms/app-shell";
import { PELADAS_ACCESS_COOKIE } from "../../lib/cookie-name";
import { verifyJwtHs256 } from "../../lib/edge-jwt";
import { getJwtSecretKey } from "../../lib/jwt-secret";

export default async function AppSegmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const token = jar.get(PELADAS_ACCESS_COOKIE)?.value;
  let name = "";
  let email = "";
  if (token) {
    const payload = await verifyJwtHs256(token, getJwtSecretKey());
    if (payload) {
      name = String(payload.name ?? "");
      email = String(payload.email ?? "");
    }
  }
  return (
    <AppShellRoot user={{ name, email }}>
      <AppShellHeaderBar />
      <AppShellMain>{children}</AppShellMain>
    </AppShellRoot>
  );
}
