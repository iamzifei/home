#!/usr/bin/env python3
"""Admin for jamesai.dev/mac profiles (uses the Blob token in mac-api/.env.local).

    python3 scripts/mac-admin.py list               # every published handle
    python3 scripts/mac-admin.py delete <handle>    # take a page down
    python3 scripts/mac-admin.py reindex            # rebuild the hub rankings

Get the token first if mac-api/.env.local is missing:
    cd mac-api && vercel env pull .env.local --scope orris
"""
import sys
from pathlib import Path

API_DIR = Path(__file__).resolve().parent.parent / "mac-api"
sys.path.insert(0, str(API_DIR))
from macapi.blob import Blob  # noqa: E402
from macapi.service import rebuild_index, remove  # noqa: E402


def token():
    for line in (API_DIR / ".env.local").read_text().splitlines():
        if line.startswith("BLOB_READ_WRITE_TOKEN="):
            return line.split("=", 1)[1].strip().strip('"')
    sys.exit("BLOB_READ_WRITE_TOKEN not found in mac-api/.env.local")


def main():
    if len(sys.argv) < 2:
        sys.exit(__doc__)
    store, cmd = Blob(token()), sys.argv[1]
    if cmd == "list":
        for b in store.list("u/"):
            print(b["pathname"][2:-5], b["uploadedAt"])
    elif cmd == "delete" and len(sys.argv) == 3:
        print(f"removed {remove(store, sys.argv[2].lower())} blobs")
    elif cmd == "reindex":
        rebuild_index(store)
        print("index rebuilt")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
