# ZUSDA Frontend

The browser uses the same-origin `/api/*` path. Vercel handles those requests
through the serverless proxy in `api/[...path].ts`; set `BACKEND_API_URL` in the
Vercel project environment to the backend origin (for example,
`https://your-backend.onrender.com`). The browser never needs the backend
origin. Local Vite development proxies requests to `http://localhost:5000` by
default; set `API_PROXY_TARGET` locally to use a different backend.

Do not place private credentials in `VITE_*` variables or the frontend
repository. Third-party service credentials belong in the backend deployment's
environment variables. The proxy forwards the CMS bearer token for authenticated
API calls but does not forward cookies or other request headers.
