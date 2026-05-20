import { PasswortResetForm } from "@/components/kunden/passwort-reset-form";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Neues Passwort setzen | Muster Fenster",
};

export default async function PasswortResetPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <div className="mx-auto w-full max-w-md">
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <h1 className="text-center text-2xl font-bold text-foreground">
            Neues Passwort setzen
          </h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">
            Geben Sie Ihr neues Passwort ein.
          </p>
          <div className="mt-6">
            <PasswortResetForm token={token} />
          </div>
        </div>
      </div>
    </div>
  );
}
