/// <reference types="vite/client" />
/// <reference types="google.maps" />

interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string
    readonly VITE_SUPABASE_ANON_KEY: string
    readonly VITE_GEMINI_API_KEY: string
    readonly VITE_GOOGLE_MAPS_API_KEY: string
    // add more env variables here if needed...
}

interface ImportMeta {
    readonly env: ImportMetaEnv
}