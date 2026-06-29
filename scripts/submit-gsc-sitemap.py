import argparse
import json
import sys
from pathlib import Path

from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError


SCOPES = ["https://www.googleapis.com/auth/webmasters"]


def normalize_site(site: str) -> str:
    if site.startswith("sc-domain:"):
        return site
    return site.rstrip("/") + "/"


def pick_site(available: list[str], preferred: str) -> str:
    preferred = normalize_site(preferred)
    candidates = [
        preferred,
        "sc-domain:patentgogo.com",
        "https://patentgogo.com/",
        "https://www.patentgogo.com/",
    ]
    for candidate in candidates:
        if candidate in available:
            return candidate
    raise RuntimeError(
        "GSC property for patentgogo.com was not available to this credential. "
        f"Visible property count: {len(available)}"
    )


def main() -> int:
    parser = argparse.ArgumentParser(description="Submit and verify a sitemap through Search Console API.")
    parser.add_argument("--credentials", default=r"D:\env\gsc_credentials.json")
    parser.add_argument("--site", default="https://patentgogo.com/")
    parser.add_argument("--sitemap", default="https://patentgogo.com/sitemap.xml")
    parser.add_argument("--json", action="store_true", help="Print machine-readable status.")
    parser.add_argument("--status-only", action="store_true", help="Only read the current sitemap status without submitting again.")
    args = parser.parse_args()

    credential_path = Path(args.credentials)
    if not credential_path.exists():
        raise FileNotFoundError(f"GSC credential file not found: {credential_path}")

    creds = service_account.Credentials.from_service_account_file(str(credential_path), scopes=SCOPES)
    service = build("searchconsole", "v1", credentials=creds, cache_discovery=False)

    sites = service.sites().list().execute().get("siteEntry", [])
    visible = [site["siteUrl"] for site in sites]
    site_url = pick_site(visible, args.site)

    sitemaps = service.sitemaps()
    if not args.status_only:
        sitemaps.submit(siteUrl=site_url, feedpath=args.sitemap).execute()

    sitemap = sitemaps.get(siteUrl=site_url, feedpath=args.sitemap).execute()
    errors = int(sitemap.get("errors", 0))
    warnings = int(sitemap.get("warnings", 0))
    pending = bool(sitemap.get("isPending", False))
    status = "success" if errors == 0 and warnings == 0 and not pending else "submitted_pending_or_attention"

    output = {
        "siteUrl": site_url,
        "sitemap": args.sitemap,
        "status": status,
        "isPending": pending,
        "errors": errors,
        "warnings": warnings,
        "lastSubmitted": sitemap.get("lastSubmitted"),
        "lastDownloaded": sitemap.get("lastDownloaded"),
        "type": sitemap.get("type"),
        "contents": sitemap.get("contents", []),
    }
    if args.json:
        print(json.dumps(output, ensure_ascii=False, indent=2))
    else:
        print(f"GSC sitemap {'status checked' if args.status_only else 'submitted'}: {args.sitemap}")
        print(f"Property: {site_url}")
        print(f"Status: {status} (pending={pending}, errors={errors}, warnings={warnings})")
        if output["lastSubmitted"]:
            print(f"Last submitted: {output['lastSubmitted']}")
        if output["lastDownloaded"]:
            print(f"Last downloaded: {output['lastDownloaded']}")
    return 0 if status == "success" else 2


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except HttpError as exc:
        print(f"GSC API error: {exc.status_code} {exc.reason}", file=sys.stderr)
        print(exc, file=sys.stderr)
        raise SystemExit(1)
