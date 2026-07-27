#!/usr/bin/env bash
# ==============================================================================
# Abstract Fluid Mesh & Noise Background Generator - Custom Brand
# Generates organic, blurred mesh-gradient covers with film grain texture.
# ==============================================================================

set -e

# Configuration Defaults
OUTPUT_DIR="${1:-./abstract_covers}"
COUNT="${2:-10}" # Reduced default count because each iteration generates 4 files

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

# ==============================================================================
# DESIGN SYSTEM PALETTE (From CSS Variables)
# ==============================================================================
# Light Theme
LIGHT_BG="#f5ffe1"
LIGHT_MUTED_BG="#e0eec4"
LIGHT_MUTED_BORDER="#d1ddbb"
LIGHT_MUTED="#5b5b5b"
LIGHT_FG="#1e1e1e"

# Dark Theme
DARK_BG="#1e1e1e"
DARK_MUTED_BG="#343434"
DARK_MUTED_BORDER="#4c4c4c"
DARK_MUTED="#9b9b9b"
DARK_FG="#ececec"

# Vibrant Accent
TEAL="#0d9488" # Teal accent

# ==============================================================================
# RESOLUTIONS
# Format: WIDTHxHEIGHT-NAME
# ==============================================================================
RESOLUTIONS=(
    "1200x630-cover"
    "800x800-square"
    "500x300-grid_landscape"
    "245x135-grid_small"
)

# Helper: Random number generator within range[cite: 1]
rand_range() {
    local min=$1
    local max=$2
    echo $(( min + RANDOM % (max - min + 1) ))
}

# Helper: Pick a random item from array[cite: 1]
rand_choice() {
    local arr=("$@")
    echo "${arr[$(( RANDOM % ${#arr[@]} ))]}"
}

echo "Generating $COUNT abstract fluid background sets into '$OUTPUT_DIR'..."

for (( i=1; i<=COUNT; i++ )); do
    INDEX_PADDED=$(printf "%02d" "$i")

    # Alternate between Light Mode and Dark Mode[cite: 1]
    if [ $(( i % 2 )) -eq 1 ]; then
        THEME="light"
        BG_COLOR="$LIGHT_BG"
        # Pool prioritizes muted greens with occasional foreground/teal accents
        COLOR_POOL=("$LIGHT_MUTED_BG" "$LIGHT_MUTED_BORDER" "$LIGHT_MUTED_BG" "$LIGHT_MUTED" "$LIGHT_FG" "$TEAL")
    else
        THEME="dark"
        BG_COLOR="$DARK_BG"
        # Pool prioritizes dark grays with occasional foreground/teal accents
        COLOR_POOL=("$DARK_MUTED_BG" "$DARK_MUTED_BORDER" "$DARK_MUTED_BG" "$DARK_MUTED" "$DARK_FG" "$TEAL")
    fi

    # Select 4 colors for the mesh shapes[cite: 1]
    # We force one of the colors to be the Teal accent for dynamism, 
    # the rest are chosen from the theme's pool.
    COLOR1=$(rand_choice "${COLOR_POOL[@]}")
    COLOR2=$(rand_choice "${COLOR_POOL[@]}")
    COLOR3=$(rand_choice "${COLOR_POOL[@]}")
    COLOR4="$TEAL"

    # We generate the shape coordinates ONCE per design using a 1000x1000 grid.
    # This ensures consistency across all aspect ratios.
    BLUR_RAD=$(rand_range 80 120)

    # Shape 1
    CX1=$(rand_range 200 800); CY1=$(rand_range 200 800)
    RX1=$(rand_range 300 500); RY1=$(rand_range 200 400)
    ROT1=$(rand_range -45 45); OP1=$(rand_range 75 95)
    
    # Shape 2 (Path)
    P_X1=$(rand_range 100 300); P_Y1=$(rand_range 100 300)
    P_CX1=$(rand_range 400 700); P_CY1=$(rand_range 100 300)
    P_X2=$(rand_range 700 900); P_Y2=$(rand_range 400 600)
    P_CX2=$(rand_range 400 700); P_CY2=$(rand_range 400 700)
    OP2=$(rand_range 70 90)

    # Shape 3
    CX3=$(rand_range 100 400); CY3=$(rand_range 100 400)
    RX3=$(rand_range 250 400); RY3=$(rand_range 250 400)
    ROT3=$(rand_range -30 30); OP3=$(rand_range 65 85)

    # Shape 4 (Teal Accent)
    CX4=$(rand_range 600 900); CY4=$(rand_range 600 900)
    RX4=$(rand_range 200 400); RY4=$(rand_range 200 350)
    ROT4=$(rand_range -40 40); OP4=$(rand_range 40 70) # Slightly more transparent for bright teal

    # Generate images for all requested resolutions
    for RES in "${RESOLUTIONS[@]}"; do
        WIDTH="${RES%%x*}"
        REST="${RES#*x}"
        HEIGHT="${REST%%-*}"
        SUFFIX="${REST#*-}"

        TEMP_SVG="/tmp/fluid_mesh_${INDEX_PADDED}_${SUFFIX}_$$.svg"
        OUTPUT_FILE="$OUTPUT_DIR/abstract_${INDEX_PADDED}_${SUFFIX}.png"

        # Begin SVG generation with preserveAspectRatio to crop smoothly across formats
        cat <<EOF > "$TEMP_SVG"
<svg xmlns="http://www.w3.org/2000/svg" width="$WIDTH" height="$HEIGHT" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
  <defs>
    <!-- High-radius Gaussian blur for fluid mesh gradients[cite: 1] -->
    <filter id="fluidBlur" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="$BLUR_RAD" />
    </filter>
  </defs>

  <!-- Base Canvas Background[cite: 1] -->
  <rect width="1000" height="1000" fill="$BG_COLOR"/>

  <!-- Fluid Organic Blob Group[cite: 1] -->
  <g filter="url(#fluidBlur)">
    <ellipse cx="$CX1" cy="$CY1" rx="$RX1" ry="$RY1" fill="$COLOR1" opacity="0.$OP1" transform="rotate($ROT1 $CX1 $CY1)"/>
    <path d="M $P_X1 $P_Y1 C $P_CX1 $P_CY1, $P_CX2 $P_CY2, $P_X2 $P_Y2 C $(( P_X2 - 100 )) $(( P_Y2 + 100 )), $(( P_X1 + 100 )) $(( P_Y1 + 100 )), $P_X1 $P_Y1 Z" fill="$COLOR2" opacity="0.$OP2"/>
    <ellipse cx="$CX3" cy="$CY3" rx="$RX3" ry="$RY3" fill="$COLOR3" opacity="0.$OP3" transform="rotate($ROT3 $CX3 $CY3)"/>
    <ellipse cx="$CX4" cy="$CY4" rx="$RX4" ry="$RY4" fill="$COLOR4" opacity="0.$OP4" transform="rotate($ROT4 $CX4 $CY4)"/>
  </g>
</svg>
EOF

        # Rasterize SVG and Composite Analog Film Grain[cite: 1]
        $IM_CMD "$TEMP_SVG" \
            \( -size ${WIDTH}x${HEIGHT} xc:gray50 -attenuate 0.28 +noise Gaussian -colorspace Gray \) \
            -compose SoftLight -composite \
            "$OUTPUT_FILE"

        rm -f "$TEMP_SVG"
    done
    echo "  [$INDEX_PADDED/$COUNT] Generated design across all resolutions ($THEME theme)"
done

echo ""
echo "Done! Generated $COUNT abstract background sets in '$OUTPUT_DIR'."
