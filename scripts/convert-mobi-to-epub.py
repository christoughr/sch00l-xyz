"""Extract MOBI to HTML folder for ingest. Usage: python scripts/convert-mobi-to-epub.py [mobi-path]"""
import glob
import os
import shutil
import sys

import mobi

def main():
    if len(sys.argv) < 2:
        downloads = os.path.join(os.environ.get("USERPROFILE", ""), "Downloads")
        candidates = glob.glob(os.path.join(downloads, "*Biology*.mobi"))
        if not candidates:
            print("Usage: python scripts/convert-mobi-to-epub.py <file.mobi>")
            sys.exit(1)
        src = candidates[0]
    else:
        src = sys.argv[1]

    out_dir = os.path.normpath(
        os.path.join(os.path.dirname(__file__), "..", "content", "ingest", "ap-bio", "mobi-princeton-2023")
    )
    if os.path.exists(out_dir):
        shutil.rmtree(out_dir)

    print("Extracting", src)
    tempdir, filepath = mobi.extract(src)

    if filepath and os.path.isfile(filepath) and filepath.lower().endswith(".epub"):
        dest = os.path.join(os.path.dirname(out_dir), "Princeton-AP-Biology-2023-converted.epub")
        shutil.copy2(filepath, dest)
        print("OK (epub):", dest)
        return

    if tempdir and os.path.isdir(tempdir):
        shutil.copytree(tempdir, out_dir)
        print("OK (html extract):", out_dir)
        return

    print("Extract failed")
    sys.exit(2)

if __name__ == "__main__":
    main()
