import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { de } from "@payloadcms/translations/languages/de";
import path from "path";
import { buildConfig } from "payload";
import { fileURLToPath } from "url";
import sharp from "sharp";

// System
import { Users } from "./collections/system/users";
import { Media } from "./collections/system/media";
import { EditHistory } from "./collections/system/edit-history";
import { Nummernkreise } from "./collections/system/nummernkreise";
import { EmailQueue } from "./collections/system/email-queue";

// Produkte
import { Produkttypen } from "./collections/produkte/produkttypen";
import { Materialien } from "./collections/produkte/materialien";
import { Profile } from "./collections/produkte/profile";
import { Fluegelanzahl } from "./collections/produkte/fluegelanzahl";
import { Zusatzlichter } from "./collections/produkte/zusatzlichter";
import { Oeffnungsarten } from "./collections/produkte/oeffnungsarten";
import { Fensterformen } from "./collections/produkte/fensterformen";

// Business
import { Preisregeln } from "./collections/business/preisregeln";
import { Rabattcodes } from "./collections/business/rabattcodes";
import { Anfragen } from "./collections/business/anfragen";
import { StatusHistorie } from "./collections/business/status-historie";
import { Rechnungen } from "./collections/business/rechnungen";
import { Angebote } from "./collections/business/angebote";
import { PDFUploads } from "./collections/business/pdf-uploads";
import { Reklamationen } from "./collections/business/reklamationen";

// Ausstattung
import { Farben } from "./collections/ausstattung/farben";
import { Dichtungsfarben } from "./collections/ausstattung/dichtungsfarben";
import { Verglasungen } from "./collections/ausstattung/verglasungen";
import { Schallschutz } from "./collections/ausstattung/schallschutz";
import { Sicherheitsglas } from "./collections/ausstattung/sicherheitsglas";
import { Glasdekore } from "./collections/ausstattung/glasdekore";
import { Sprossen } from "./collections/ausstattung/sprossen";
import { Extras } from "./collections/ausstattung/extras";

// Globals
import { Navigation } from "./payload-globals/navigation";
import { Footer } from "./payload-globals/footer";
import { Settings } from "./payload-globals/settings";

// Plugins
import { createPuckPlugin } from "@delmaredigital/payload-puck/plugin";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    theme: "dark",
    importMap: {
      baseDir: path.resolve(dirname),
    },
    components: {
      Nav: "@/components/admin/custom-nav#default",
      graphics: {
        Logo: "@/components/admin/logo#default",
        Icon: "@/components/admin/logo-icon#default",
      },
      providers: ["@/components/admin/undo-redo-provider#UndoRedoProvider"],
      views: {
        dashboard: {
          Component: "@/components/admin/dashboard-view#default",
        },
        einstellungen: {
          Component: "@/components/admin/settings-view#default",
          path: "/einstellungen",
        },
        puckEditorWithViewports: {
          Component:
            "@/components/admin/puck-editor-wrapper#PuckEditorViewWithViewports",
          path: "/puck-editor/:segments*",
        },
      },
    },
  },
  collections: [
    // System
    Users,
    Media,
    EditHistory,
    Nummernkreise,
    EmailQueue,
    PDFUploads,
    // Produkte
    Produkttypen,
    Materialien,
    Profile,
    Fluegelanzahl,
    Zusatzlichter,
    Oeffnungsarten,
    Fensterformen,
    // Ausstattung
    Farben,
    Dichtungsfarben,
    Verglasungen,
    Schallschutz,
    Sicherheitsglas,
    Glasdekore,
    Sprossen,
    Extras,
    // Business
    Preisregeln,
    Rabattcodes,
    Anfragen,
    StatusHistorie,
    Rechnungen,
    Angebote,
    Reklamationen,
  ],
  globals: [Navigation, Footer, Settings],
  localization: {
    locales: [
      { label: "Deutsch", code: "de" },
      { label: "English", code: "en" },
    ],
    defaultLocale: "de",
    fallback: true,
  },
  i18n: {
    fallbackLanguage: "de",
    supportedLanguages: { de },
  },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || "",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL || "" },
    idType: "uuid",
    push: true,
  }),
  sharp,
  plugins: [
    createPuckPlugin({
      pagesCollection: "pages",
      autoGenerateCollection: true,
      access: {
        read: () => true,
        create: ({ req }) =>
          ["admin", "mitarbeiter"].includes(req.user?.rolle || ""),
        update: ({ req }) =>
          ["admin", "mitarbeiter"].includes(req.user?.rolle || ""),
        delete: ({ req }) => req.user?.rolle === "admin",
      },
      editorStylesheet: "src/app/(frontend)/styles.css",
      previewUrl: "/",
    }),
  ],
});
