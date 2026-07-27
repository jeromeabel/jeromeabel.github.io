#!/usr/bin/env bash
# ==============================================================================
# Abstract Node Graph Cover Generator
# Generates abstract, textured dark covers with node network graphics & grain.
# ==============================================================================

set -e

OUTPUT_FILE="${1:-./abstract_cover.png}"
WIDTH=1200
HEIGHT=630
TEMP_SVG="/tmp/temp_graph_$$.svg"

# Palette Tokens
INK="#1e1e1e"
PAPER="#f5ffe1"
CORAL="#ff5a3c"
BLUE="#2b6cff"
TEAL="#2dd4bf"

# Generate random numbers within range
rand_range() {
    local min=$1
    local max=$2
    echo $(( min + RANDOM % (max - min + 1) ))
}

echo "Generating vector abstract art..."

# Start SVG header
cat <<EOF > "$TEMP_SVG"
<svg xmlns="http://www.w3.org/2000/svg" width="$WIDTH" height="$HEIGHT" viewBox="0 0 $WIDTH $HEIGHT">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGlow" cx="70%" cy="30%" r="80%">
      <stop offset="0%" stop-color="#2a2a2a"/>
      <stop offset="100%" stop-color="$INK"/>
    </radialGradient>
    <!-- Node Glow Filter -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>
  </defs>

  <!-- Background Layer -->
  <rect width="$WIDTH" height="$HEIGHT" fill="url(#bgGlow)"/>

  <!-- Abstract Grid/Guide Lines -->
  <line x1="100" y1="0" x2="100" y2="$HEIGHT" stroke="#282828" stroke-width="1" stroke-dasharray="4,8"/>
  <line x1="1100" y1="0" x2="1100" y2="$HEIGHT" stroke="#282828" stroke-width="1" stroke-dasharray="4,8"/>
  <line x1="0" y1="530" x2="$WIDTH" y2="530" stroke="#282828" stroke-width="1"/>

EOF

# Generate random nodes
NODE_COUNT=$(rand_range 5 8)
declare -a node_x
declare -a node_y

for (( i=0; i<$NODE_COUNT; i++ )); do
    node_x[$i]=$(rand_range 250 950)
    node_y[$i]=$(rand_range 120 500)
done

# Draw Edges/Connections
echo "  <!-- Connecting Edges -->" >> "$TEMP_SVG"
for (( i=0; i<$NODE_COUNT; i++ )); do
    for (( j=i+1; j<$NODE_COUNT; j++ )); do
        # Randomly connect ~40% of nodes
        if [ $(( RANDOM % 100 )) -lt 45 ]; then
            cat <<EOF >> "$TEMP_SVG"
  <line x1="${node_x[$i]}" y1="${node_y[$i]}" x2="${node_x[$j]}" y2="${node_y[$j]}" 
        stroke="$PAPER" stroke-opacity="0.25" stroke-width="1.5" stroke-dasharray="2,4"/>
EOF
        fi
    done
done

# Draw Geometric Accent Shapes & Nodes
echo "  <!-- Nodes and Accents -->" >> "$TEMP_SVG"
COLORS=("$CORAL" "$BLUE" "$TEAL" "$PAPER")

for (( i=0; i<$NODE_COUNT; i++ )); do
    color="${COLORS[$(( RANDOM % ${#COLORS[@]} ))]}"
    radius=$(rand_range 6 18)
    
    # Outer ring
    cat <<EOF >> "$TEMP_SVG"
  <circle cx="${node_x[$i]}" cy="${node_y[$i]}" r="$(( radius + 8 ))" 
          fill="none" stroke="$color" stroke-width="1" stroke-opacity="0.4"/>
  <circle cx="${node_x[$i]}" cy="${node_y[$i]}" r="$radius" 
          fill="$color" filter="url(#glow)"/>
EOF
done

# Close SVG
echo "</svg>" >> "$TEMP_SVG"

echo "Rasterizing SVG and adding dither noise layer..."

# Convert SVG to PNG + Add Noise Grain Overlay
convert "$TEMP_SVG" \
    \( -size ${WIDTH}x${HEIGHT} xc: -attenuate 0.22 +noise Gaussian -colorspace Gray \) \
    -compose Multiply -composite \
    "$OUTPUT_FILE"

rm -f "$TEMP_SVG"
echo "Abstract background saved to: $OUTPUT_FILE"
