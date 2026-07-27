// Three-tier settings resolution: SETTINGS → types[entry.type] → image entry
// (studio-design.md §5). Pure, zero imports — served to the browser verbatim
// by the studio so the UI's inherited/overridden markers use THIS logic.

export const RESERVED = ["type", "style", "mix", "accent", "seed", "mesh"];

const isObj = (v) => v !== null && typeof v === "object" && !Array.isArray(v);

// Tag every leaf path of `obj` with `tier` in `source`.
function tagLeaves(obj, tier, source, prefix) {
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isObj(v)) tagLeaves(v, tier, source, path);
    else source[path] = tier;
  }
}

// Deep-merge `over` into `target`, recording each written leaf as `tier`.
function mergeInto(target, over, tier, source, prefix) {
  for (const [k, v] of Object.entries(over)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (isObj(v) && isObj(target[k])) {
      mergeInto(target[k], v, tier, source, path);
    } else {
      target[k] = isObj(v) || Array.isArray(v) ? structuredClone(v) : v;
      if (isObj(v)) tagLeaves(v, tier, source, path);
      else source[path] = tier;
    }
  }
}

export function resolveSettings(slug, illustration, settings) {
  const img = illustration.images?.[slug] ?? {};
  const type = img.type ?? null;
  const typeRec = (type && illustration.types?.[type]) || {};

  const source = {};
  const groups = structuredClone(settings);
  tagLeaves(groups, "global", source, "");

  const overlayGroups = (entry, tier) => {
    for (const [k, v] of Object.entries(entry)) {
      if (RESERVED.includes(k)) continue;
      if (isObj(v) && isObj(groups[k])) {
        mergeInto(groups[k], v, tier, source, k);
      } else {
        groups[k] = structuredClone(v);
        source[k] = tier;
      }
    }
  };
  overlayGroups(typeRec, "type");
  overlayGroups(img, "image");

  const effective = { type, settings: groups };
  for (const k of ["style", "mix", "accent", "seed", "mesh"]) {
    const fromImage = img[k] !== undefined;
    const fromType = typeRec[k] !== undefined;
    effective[k] = structuredClone(
      fromImage ? img[k] : fromType ? typeRec[k] : null,
    );
    source[k] = fromImage ? "image" : fromType ? "type" : "global";
  }
  effective.seed = effective.seed ?? slug;
  return { effective, source };
}
