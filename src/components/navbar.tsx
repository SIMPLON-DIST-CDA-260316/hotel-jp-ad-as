import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import NavbarClient from "./navbar-client";

export default async function Navbar() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return <NavbarClient session={session} />;
}
