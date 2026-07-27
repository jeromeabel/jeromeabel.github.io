#!/usr/bin/env bash
# ==============================================================================
# Abstract Fluid Mesh & Noise Background Generator
# Generates organic, blurred mesh-gradient covers with film grain texture.
# Based on design system tokens: ink, paper, coral, riso blue, muted greens.
# ==============================================================================

set -e

# Configuration Defaults
OUTPUT_DIR="${1:-./abstract_covers}"
COUNT="${2:-20}"
WIDTH=1200
HEIGHT=630

# Ensure ImageMagick is installed
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
    echo "Error: ImageMagick (convert or magick) is required."
    echo "Install it via: sudo apt update && sudo apt install -y imagemagick"
    exit 1
fi

# Detect ImageMagick command
IM_CMD="convert"
if command -v magick &> /dev/null; then
    IM_CMD="magick"
fi

mkdir -p "$OUTPUT_DIR"

# Design System Palette Tokens
INK="#1e1e1e"
PAPER="#f5ffe1"
CORAL="#ff5a3c"
BLUE="#2b6cff"
GREEN_LIGHT="#e0eec4"
GREEN_MUTED="#d1ddbb"
WARM_AMBER="#f97316"
DEEP_CRIMSON="#991b1b"

# Helper: Random number generator within range
rand_range() {
    local min=$1
    local max=$2
    echo $(( min + RANDOM % (max - min + 1) ))
}

# Helper: Pick a random item from array
rand_choice() {
    local arr=("$@")
    echo "${arr[$(( RANDOM % ${#arr[@]} ))]}"
}

echo "Generating $COUNT abstract fluid backgrounds into '$OUTPUT_DIR'..."

for (( i=1; i<=COUNT; i++ )); do
    INDEX_PADDED=$(printf "%02d" "$i")
    TEMP_SVG="/tmp/fluid_mesh_${INDEX_PADDED}_$$.svg"
    OUTPUT_FILE="$OUTPUT_DIR/abstract_${INDEX_PADDED}.png"

    # Alternate between Light Mode (Warm Riso Paper) and Dark Mode (Ink)
    if [ $(( i % 2 )) -eq 1 ]; then
        THEME="light"
        BG_COLOR="$PAPER"
        COLOR_POOL=("$CORAL" "$BLUE" "$GREEN_LIGHT" "$WARM_AMBER" "$DEEP_CRIMSON")
    else
        THEME="dark"
        BG_COLOR="$INK"
        COLOR_POOL=("$CORAL" "$BLUE" "$GREEN_MUTED" "#3b82f6" "#0d9488")
    fi

    # Select 3 to 4 distinct vibrant colors for the mesh shapes
    COLOR1=$(rand_choice "${COLOR_POOL[@]}")
    COLOR2=$(rand_choice "${COLOR_POOL[@]}")
    COLOR3=$(rand_choice "${COLOR_POOL[@]}")
    COLOR4=$(rand_choice "${COLOR_POOL[@]}")

    # Gaussian blur radius for fluid blending (80px - 140px)
    BLUR_RAD=$(rand_range 90 130)

    # Begin SVG generation with heavy Gaussian blur filters
    cat <<EOF > "$TEMP_SVG"
<svg xmlns="http://www.w3.org/2000/svg" width="$WIDTH" height="$HEIGHT" viewBox="0 0 $WIDTH $HEIGHT">
  <defs>
    <!-- High-radius Gaussian blur for fluid mesh gradients -->
    <filter id="fluidBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="$BLUR_RAD" />
    </filter>
  </defs>

  <!-- Base Canvas Background -->
  <rect width="$WIDTH" height="$HEIGHT" fill="$BG_COLOR"/>

  <!-- Fluid Organic Blob Group -->
  <g filter="url(#fluidBlur)">
EOF

    # Shape 1: Primary Center Curved Bezier Blob
    CX1=$(rand_range 300 900)
    CY1=$(rand_range 150 450)
    RX1=$(rand_range 350 550)
    RY1=$(rand_range 200 350)
    ROT1=$(rand_range -45 45)
    OP1=$(rand_range 75 95)
    echo "    <ellipse cx=\"$CX1\" cy=\"$CY1\" rx=\"$RX1\" ry=\"$RY1\" fill=\"$COLOR1\" opacity=\"0.$OP1\" transform=\"rotate($ROT1 $CX1 $CY1)\"/>" >> "$TEMP_SVG"

    # Shape 2: Secondary Wave / Path Blob (Organic Bezier Curve)
    P_X1=$(rand_range 100 400)
    P_Y1=$(rand_range 50 250)
    P_CX1=$(rand_range 500 800)
    P_CY1=$(rand_range 100 300)
    P_X2=$(rand_range 800 1100)
    P_Y2=$(rand_range 350 550)
    P_CX2=$(rand_range 400 700)
    P_CY2=$(rand_range 400 600)
    OP2=$(rand_range 70 90)
    
    cat <<EOF >> "$TEMP_SVG"
    <path d="M $P_X1 $P_Y1 C $P_CX1 $P_CY1, $P_CX2 $P_CY2, $P_X2 $P_Y2 C $(( P_X2 - 200 )) $(( P_Y2 + 100 )), $(( P_X1 + 100 )) $(( P_Y1 + 200 )), $P_X1 $P_Y1 Z" 
          fill="$COLOR2" opacity="0.$OP2"/>
EOF

    # Shape 3: Corner Warm Highlight Blob
    CX3=$(rand_range 100 500)
    CY3=$(rand_range 100 300)
    RX3=$(rand_range 250 400)
    RY3=$(rand_range 180 320)
    ROT3=$(rand_range -30 30)
    OP3=$(rand_range 65 85)
    echo "    <ellipse cx=\"$CX3\" cy=\"$CY3\" rx=\"$RX3\" ry=\"$RY3\" fill=\"$COLOR3\" opacity=\"0.$OP3\" transform=\"rotate($ROT3 $CX3 $CY3)\"/>" >> "$TEMP_SVG"

    # Shape 4: Bottom / Right Gradient Accent Blob
    CX4=$(rand_range 700 1100)
    CY4=$(rand_range 350 550)
    RX4=$(rand_range 300 500)
    RY4=$(rand_range 200 350)
    ROT4=$(rand_range -40 40)
    OP4=$(rand_range 60 85)
    echo "    <ellipse cx=\"$CX4\" cy=\"$CY4\" rx=\"$RX4\" ry=\"$RY4\" fill=\"$COLOR4\" opacity=\"0.$OP4\" transform=\"rotate($ROT4 $CX4 $CY4)\"/>" >> "$TEMP_SVG"

    # Close SVG
    echo "  </g>" >> "$TEMP_SVG"
    echo "</svg>" >> "$TEMP_SVG"

    # Rasterize SVG and Composite Analog Film Grain
    # Grain strength: 0.28 attenuation for textured Riso paper effect
    $IM_CMD "$TEMP_SVG" \
        \( -size ${WIDTH}x${HEIGHT} xc:gray50 -attenuate 0.28 +noise Gaussian -colorspace Gray \) \
        -compose SoftLight -composite \
        "$OUTPUT_FILE"

    rm -f "$TEMP_SVG"
    echo "  [$INDEX_PADDED/$COUNT] Generated: $OUTPUT_FILE ($THEME theme)"
done

echo ""
echo "Done! Generated 20 unique abstract fluid backgrounds in '$OUTPUT_DIR'."
