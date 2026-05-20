import React from "react";
import { DefaultTemplate } from "@payloadcms/next/templates";
import { getVisibleEntities } from "@payloadcms/ui/shared";
import type { AdminViewProps } from "payload";
import SettingsPage from "./settings-page";

export default async function SettingsView({
  initPageResult,
  params,
  searchParams,
}: AdminViewProps) {
  const { req } = initPageResult;
  const { payload } = req;

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={req.locale as any}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={getVisibleEntities({ req })}
    >
      <SettingsPage />
    </DefaultTemplate>
  );
}
