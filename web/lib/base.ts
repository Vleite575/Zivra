/** App base path (Apache serves the app under /zivra). Plain module so server components get the real value. */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
