#!/usr/bin/env python3
"""
Build a SCORM 1.2 package from the AI at SETU student course.

The website (index.html + assets/) is the single source of truth. This script
bundles it, unchanged, with a generated imsmanifest.xml and zips it into a
package your LMS can import. The standalone HTML version keeps working exactly
as before — the SCORM adapter (assets/js/scorm.js) is inert without an LMS.

Usage:
    python3 scorm/build_scorm.py

Output:
    dist/setu-ai-student-scorm-1.2.zip
"""

import os
import zipfile
from xml.sax.saxutils import escape

# ---- Package metadata -------------------------------------------------------
IDENTIFIER   = "SETU_AI_STUDENT"
COURSE_TITLE = "AI at SETU: Using GenAI to Support Your Learning"
ORG_TITLE    = "AI at SETU — Student Course"
VERSION      = "1.0"
LAUNCH       = "index.html"
OUTPUT_NAME  = "setu-ai-student-scorm-1.2.zip"

# Files/dirs at repo root to include in the package.
INCLUDE_ROOT_FILES = ["index.html"]
INCLUDE_DIRS       = ["assets"]
# Never bundle these into the SCORM package.
EXCLUDE_NAMES = {".DS_Store", "Thumbs.db", ".gitkeep"}

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DIST = os.path.join(ROOT, "dist")


def collect_files():
    """Return package-relative file paths (posix separators), sorted."""
    files = []
    for f in INCLUDE_ROOT_FILES:
        if os.path.isfile(os.path.join(ROOT, f)):
            files.append(f)
    for d in INCLUDE_DIRS:
        base = os.path.join(ROOT, d)
        for dirpath, _dirnames, filenames in os.walk(base):
            for name in filenames:
                if name in EXCLUDE_NAMES:
                    continue
                full = os.path.join(dirpath, name)
                rel = os.path.relpath(full, ROOT).replace(os.sep, "/")
                files.append(rel)
    return sorted(files)


def build_manifest(files):
    file_tags = "\n".join(
        '      <file href="%s"/>' % escape(f) for f in files
    )
    return """<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="{ident}" version="{version}"
          xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p2.xsd
                              http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd
                              http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-SETU">
    <organization identifier="ORG-SETU">
      <title>{org_title}</title>
      <item identifier="ITEM-1" identifierref="RES-1" isvisible="true">
        <title>{course_title}</title>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-1" type="webcontent" adlcp:scormtype="sco" href="{launch}">
{files}
    </resource>
  </resources>
</manifest>
""".format(
        ident=escape(IDENTIFIER),
        version=escape(VERSION),
        org_title=escape(ORG_TITLE),
        course_title=escape(COURSE_TITLE),
        launch=escape(LAUNCH),
        files=file_tags,
    )


def main():
    files = collect_files()
    if LAUNCH not in files:
        raise SystemExit("ERROR: launch file %r not found — run from the repo." % LAUNCH)

    manifest = build_manifest(files)
    os.makedirs(DIST, exist_ok=True)
    out = os.path.join(DIST, OUTPUT_NAME)

    with zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED) as zf:
        # imsmanifest.xml MUST sit at the zip root.
        zf.writestr("imsmanifest.xml", manifest)
        for rel in files:
            zf.write(os.path.join(ROOT, rel), rel)

    size_kb = os.path.getsize(out) // 1024
    print("Built SCORM 1.2 package:")
    print("  %s  (%d files, %d KB)" % (out, len(files) + 1, size_kb))
    print("  launch file: %s" % LAUNCH)
    print("\nUpload this .zip to your LMS as a SCORM package.")


if __name__ == "__main__":
    main()
