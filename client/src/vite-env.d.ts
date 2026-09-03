/// <reference types="vite/client" />

interface ImportMetaEnv {
    /** Base URL of the Recovr NestJS API, e.g. http://localhost:5000 (no trailing slash). */
    readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
