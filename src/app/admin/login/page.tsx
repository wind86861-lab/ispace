import { notFound, redirect } from "next/navigation";
import { hasValidSession, isAdminConfigured } from "@/lib/admin-auth";
import { SetupNotice } from "../SetupNotice";
import { LoginForm } from "./LoginForm";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  if (!isAdminConfigured()) {
    if (process.env.NODE_ENV === "production") notFound();
    return <SetupNotice />;
  }
  if (await hasValidSession()) redirect("/admin");
  return <LoginForm />;
}
