from pathlib import Path
from zipfile import ZipFile, BadZipFile

ROOT = Path(__file__).resolve().parent
ASSETS = ROOT / "assets"

# These mappings match the original PPTs you uploaded.
SOURCES = {
    "Rajkumar FCFO and Transformation Leader 4 Jan 26.pptx": {
        "ppt/media/image1.jpeg": "rajkumar.jpg",
        "ppt/media/image4.png": "logo.png",
    },
    "Maathavam Consulting P Ltd Partners in transformation - July 2026.pptx": {
        "ppt/media/image2.png": "srinivas.png",
        "ppt/media/image3.png": "deepa.png",
        "ppt/media/image4.jpeg": "sinduja.jpg",
    },
}


def main():
    missing = [
        filename
        for filename in SOURCES
        if not (ROOT / filename).is_file()
    ]

    if missing:
        raise SystemExit(
            "Place these PPT files beside this script:\n\n"
            + "\n".join(missing)
        )

    # Validate and read everything before writing.
    extracted = {}

    for filename, mapping in SOURCES.items():
        try:
            with ZipFile(ROOT / filename) as deck:
                for internal_path, output_name in mapping.items():
                    try:
                        extracted[output_name] = deck.read(internal_path)
                    except KeyError:
                        raise SystemExit(
                            f"Missing image: {internal_path}\n"
                            f"In: {filename}\n"
                            "Use the original uploaded PPT. Edited decks "
                            "may have different internal image names."
                        )
        except BadZipFile:
            raise SystemExit(f"Invalid or damaged PPTX: {filename}")

    # Protect any existing, different images.
    conflicts = [
        name
        for name, content in extracted.items()
        if (ASSETS / name).exists()
        and (
            not (ASSETS / name).is_file()
            or (ASSETS / name).read_bytes() != content
        )
    ]

    if conflicts:
        raise SystemExit(
            "These asset names already exist with different content.\n"
            "Rename or back them up before running again:\n\n"
            + "\n".join(conflicts)
        )

    ASSETS.mkdir(parents=True, exist_ok=True)

    for name, content in extracted.items():
        destination = ASSETS / name

        if destination.exists():
            print(f"Already available: assets/{name}")
            continue

        destination.write_bytes(content)
        print(f"Extracted: assets/{name}")

    print("\nDone! Refresh your website to see the images.")


if __name__ == "__main__":
    main()