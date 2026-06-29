# patentgogo.com setup

## Current target

- Domain: `patentgogo.com`
- Registrar: Dynadot
- Site host: Vercel
- App env URL: `NEXT_PUBLIC_SITE_URL=https://patentgogo.com`

## Pre-purchase evidence

- RDAP: `not-found`
- DNS: no records resolved
- Internet Archive sample: 0 successful 200 captures
- Dynadot `.com` reference price: regular 1-year registration `$10.88`, renewal `$10.88`
- Caveat: premium-domain pricing can differ and must be checked in the final Dynadot cart/API response.

## Vercel DNS plan

Add both the apex domain and the `www` subdomain to the target Vercel project.

DNS records:

```text
@     A      76.76.21.21
www   CNAME  cname.vercel-dns-0.com
```

After DNS propagates, verify:

```powershell
npx vercel domains inspect patentgogo.com
npx vercel domains inspect www.patentgogo.com
```

## Vercel project commands

Run from the linked project directory after Vercel project selection is correct:

```powershell
npx vercel domains add patentgogo.com
npx vercel domains add www.patentgogo.com
npx vercel env add NEXT_PUBLIC_SITE_URL production
```

Use this value for the production environment variable:

```text
https://patentgogo.com
```

Then redeploy production and verify:

```powershell
npm run check
$env:ALLOW_DEMO_DATA='true'; npm run build
npx vercel --prod
```

## Live purchase stop condition

Do not execute registration until these are all true:

- `DYNADOT_API_KEY` is present in the local environment.
- Final all-in price or max accepted price is confirmed.
- Duration is confirmed.
- Production Dynadot account is confirmed.
- Dynadot final search confirms `patentgogo.com` is available and not premium above budget.
- Target Vercel project is linked or explicitly identified.
