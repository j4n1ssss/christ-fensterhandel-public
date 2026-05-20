/**
 * Custom PuckEditorView wrapper that enables viewport breakpoints (Mobile/Tablet/Desktop).
 *
 * The @delmaredigital/payload-puck plugin's default PuckEditorView does NOT pass
 * enableViewports to the PuckEditor component. This wrapper duplicates the view logic
 * and adds enableViewports={true} so the breakpoint toggle appears in the admin editor.
 *
 * Registered in payload.config.ts admin.components.views at path '/puck-editor/:segments*'
 * to override the plugin's default view registration.
 *
 * WEB-03: Enables Mobile (360px), Tablet (768px), Desktop (1280px) breakpoint toggle.
 */
import React from 'react'
import { DefaultTemplate } from '@payloadcms/next/templates'
import { getVisibleEntities } from '@payloadcms/ui/shared'
import { PuckEditor } from '@delmaredigital/payload-puck/editor'
// mapPayloadFieldsToRootProps is not publicly exported by the plugin.
// Inline the essential logic: extract standard page fields from Payload doc to root.props.
function mapPayloadFieldsToRootProps(doc: any): Record<string, any> {
  const FIELD_MAPPINGS: Array<{ from: string; to: string }> = [
    { from: 'title', to: 'title' },
    { from: 'slug', to: 'slug' },
    { from: 'pageLayout', to: 'pageLayout' },
    { from: 'pageType', to: 'pageType' },
    { from: 'isHomepage', to: 'isHomepage' },
    { from: 'folder', to: 'folder' },
    { from: 'pageSegment', to: 'pageSegment' },
  ]
  const result: Record<string, any> = {}
  for (const mapping of FIELD_MAPPINGS) {
    const value = doc?.[mapping.to]
    if (value !== undefined) {
      result[mapping.from] = value
    }
  }
  return result
}
import type { AdminViewProps } from 'payload'

export async function PuckEditorViewWithViewports({
  initPageResult,
  params,
  searchParams,
}: AdminViewProps) {
  const { req } = initPageResult
  const { payload } = req

  const adminRoute = req.payload.config.routes?.admin || '/admin'

  const segments = (await params)?.segments
  const requested = segments?.[1] || 'pages'
  const allowedCollections = new Set(['pages'])
  const collection = allowedCollections.has(requested) ? requested : 'pages'
  const pageId = segments?.[2]

  if (!pageId) {
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
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            color: 'var(--theme-elevation-500)',
          }}
        >
          <p>No page ID provided. Please navigate from the collection view.</p>
        </div>
      </DefaultTemplate>
    )
  }

  const visibleEntities = getVisibleEntities({ req })

  const puckConfig = payload.config.custom?.puck?.config
  const layouts = payload.config.custom?.puck?.layouts
  const explicitPageTreeConfig = payload.config.custom?.puck?.pageTree
  const aiConfig = payload.config.custom?.puck?.ai
  const editorStylesheets = payload.config.custom?.puck?.editorStylesheets
  const previewUrlConfig = payload.config.custom?.puck?.previewUrl

  let page: any = null
  let error: string | null = null
  const needsRelationships = typeof previewUrlConfig === 'function'

  try {
    page = await payload.findByID({
      collection: collection as any,
      id: pageId,
      draft: true,
      depth: needsRelationships ? 1 : 0,
    })
  } catch (err) {
    console.error('[PuckEditorViewWithViewports] Error fetching page:', err)
    error = err instanceof Error ? err.message : 'Failed to load page'
  }

  let previewUrlPrefix: string | undefined
  if (previewUrlConfig && page) {
    if (typeof previewUrlConfig === 'function') {
      const result = previewUrlConfig(page)
      if (typeof result === 'string') {
        previewUrlPrefix = result
      } else if (typeof result === 'function') {
        previewUrlPrefix = result('')
      }
    } else {
      previewUrlPrefix = previewUrlConfig
    }
  }

  let aiExamplePrompts = aiConfig?.examplePrompts || []
  if (aiConfig?.enabled && aiConfig?.promptsCollection) {
    try {
      const promptsResult = await payload.find({
        collection: 'puck-ai-prompts' as any,
        sort: 'order',
        limit: 50,
      })
      const collectionPrompts = promptsResult.docs.map((doc: any) => ({
        label: doc.label,
        prompt: doc.prompt,
      }))
      aiExamplePrompts = [...collectionPrompts, ...aiExamplePrompts]
    } catch {
      // Collection might not exist yet
    }
  }

  let pageTreeConfig: any = null
  if (explicitPageTreeConfig === false) {
    pageTreeConfig = null
  } else if (explicitPageTreeConfig) {
    pageTreeConfig = explicitPageTreeConfig
  } else {
    const collectionConfig = (payload.collections as any)[collection]?.config
    const hasPageTreeFields = collectionConfig?.fields?.some(
      (field: any) => field.name === 'pageSegment',
    )
    if (hasPageTreeFields) {
      pageTreeConfig = {
        folderSlug: 'payload-folders',
        pageSegmentFieldName: 'pageSegment',
        folderFieldName: 'folder',
      }
    }
  }

  const backUrl = `${adminRoute}/collections/${collection}/${pageId}`

  let initialData = page?.puckData || {
    content: [],
    root: { props: {} },
  }
  if (page) {
    const syncedRootProps = mapPayloadFieldsToRootProps(page)
    if (pageTreeConfig && page.folder !== undefined) {
      const folderId =
        typeof page.folder === 'object' ? page.folder?.id : page.folder
      ;(syncedRootProps as any).folder = folderId || null
    }
    initialData = {
      ...initialData,
      root: {
        ...initialData.root,
        props: {
          ...initialData.root?.props,
          ...syncedRootProps,
        },
      },
    }
  }

  return (
    <DefaultTemplate
      i18n={req.i18n}
      locale={req.locale as any}
      params={params}
      payload={payload}
      permissions={initPageResult.permissions}
      searchParams={searchParams}
      user={req.user ?? undefined}
      visibleEntities={visibleEntities}
    >
      {error ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '50vh',
            color: 'var(--theme-error-500)',
          }}
        >
          <p>Error: {error}</p>
        </div>
      ) : (
        <div
          style={{
            height: 'calc(100vh - 60px)',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <PuckEditor
            pageId={pageId}
            initialData={initialData}
            pageTitle={page?.title || 'Untitled'}
            pageSlug={page?.slug || ''}
            apiEndpoint={`/api/puck/${collection}`}
            initialStatus={page?._status}
            backUrl={backUrl}
            previewUrlPrefix={previewUrlPrefix}
            layouts={layouts}
            hasPageTree={!!pageTreeConfig}
            folder={
              pageTreeConfig
                ? typeof page?.folder === 'object'
                  ? page?.folder?.id
                  : page?.folder
                : undefined
            }
            pageSegment={pageTreeConfig ? page?.pageSegment : undefined}
            enableViewports={true}
            enableAi={aiConfig?.enabled}
            aiExamplePrompts={aiExamplePrompts}
            hasPromptsCollection={!!aiConfig?.promptsCollection}
            hasContextCollection={!!aiConfig?.contextCollection}
            aiComponentInstructions={aiConfig?.componentInstructions}
            editorStylesheets={editorStylesheets}
          />
        </div>
      )}
    </DefaultTemplate>
  )
}

export default PuckEditorViewWithViewports
