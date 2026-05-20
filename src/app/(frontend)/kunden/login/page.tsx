import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/kunden/login-form";

export const metadata = {
  title: "Anmelden | Muster Fenster",
  description: "Melden Sie sich an, um Ihre Anfragen zu verwalten.",
};

export default async function LoginPage() {
  const user = await getCurrentUser();

  if (user && user.rolle === "kunde") {
    redirect("/kunden/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <LoginForm />
    </div>
  );
}
