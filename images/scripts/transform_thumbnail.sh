#!/usr/bin/env bash
# ==============================================================================
# Thumbnail Transformer Script
# Applies design system presets to a single image or an entire folder.
# ==============================================================================

set -e

# Palette Tokens
COLOR_INK="#1e1e1e"
COLOR_PAPER="#f5ffe1"
COLOR_TEAL="#2dd4bf"
COLOR_DARK="#121212"
COLOR_FRAME_BG="#18181b"

show_help() {
    echo "Usage: $0 <file-or-folder-path> [output-directory]"
    echo ""
    echo "Examples:"
    echo "  $0 ./my-screenshot.png"
    echo "  $0 ./my-screenshot.png ./output_folder"
    echo "  $0 ./images_dir ./transformed_output"
    exit 1
}

if [ -z "$1" ]; then
    show_help
fi

INPUT_PATH="$1"
OUTPUT_DIR="${2:-./transformed_thumbnails}"

mkdir -p "$OUTPUT_DIR"

transform_file() {
    local file="$1"
    local filename=$(basename -- "$file")
    local name="${filename%.*}"
    local ext="${filename##*.}"

    echo "Processing: $filename -> $OUTPUT_DIR"

    # 1. Preset: Duotone Ink & Paper
    convert "$file" \
        -colorspace Gray \
        +level-colors "$COLOR_INK","$COLOR_PAPER" \
        "$OUTPUT_DIR/${name}_duotone_ink.png"

    # 2. Preset: Duotone Dark Teal
    convert "$file" \
        -colorspace Gray \
        +level-colors "$COLOR_DARK","$COLOR_TEAL" \
        "$OUTPUT_DIR/${name}_duotone_teal.png"

    # 3. Preset: Riso Posterize + Grain
    convert "$file" \
        -colorspace Gray \
        -posterize 4 \
        +level-colors "$COLOR_INK","$COLOR_PAPER" \
        \( -size 1200x630 xc: -attenuate 0.25 +noise Gaussian -colorspace Gray \) \
        -compose Multiply -composite \
        "$OUTPUT_DIR/${name}_riso_posterize.png"

    # 4. Preset: Dithered Stipple (Floyd-Steinberg)
    convert "$file" \
        -colorspace Gray \
        -dither FloydSteinberg \
        -monochrome \
        +level-colors "$COLOR_INK","$COLOR_TEAL" \
        "$OUTPUT_DIR/${name}_dither_stipple.png"

    # 5. Preset: Dark Framed Screenshot (for screenshots/app UI)
    convert "$file" \
        -resize 960x480\> \
        -background none \
        \( +clone -background black -shadow 60x10+0+10 \) \
        +swap -background "$COLOR_FRAME_BG" -layers merge \
        -gravity center -extent 1200x630 \
        "$OUTPUT_DIR/${name}_dark_framed.png"
}

# Check if input is directory or file
if [ -d "$INPUT_PATH" ]; then
    echo "Processing directory: $INPUT_PATH"
    shopt -s nullglob
    for img in "$INPUT_PATH"/*.{jpg,jpeg,png,JPG,JPEG,PNG}; do
        [ -f "$img" ] || continue
        transform_file "$img"
    done
    echo "Done processing all images in directory!"
elif [ -f "$INPUT_PATH" ]; then
    transform_file "$INPUT_PATH"
    echo "Done processing $INPUT_PATH!"
else
    echo "Error: Path '$INPUT_PATH' is neither a file nor a directory."
    exit 1
fi
