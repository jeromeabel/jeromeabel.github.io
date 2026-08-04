// fig-decode.mjs — reads a local Figma `.fig` export into its raw node graph.
//
// A `.fig` file is a zip whose `canvas.fig` member is Figma's "fig-kiwi" binary:
// an 8-byte magic + version, then length-prefixed chunks. Chunk 0 is the kiwi
// *schema* (deflate), chunk 1 is the message *data* (zstd on current exports,
// deflate on older ones). The schema is self-describing, so the decoder below is
// generic — it does not hardcode any Figma field name and keeps working when
// Figma adds fields.
//
// This is the only scriptable path to bulk Figma state: the Plugin API is
// reachable only through `use_figma` (interactive, ~20KB response cap), while a
// File > Export gives the whole document offline in one shot.
//
// Exports `readFig()` (the graph) plus the small helpers every consumer needs.
// Shaping that graph into a comparable dump is the caller's job — see
// `extract-fig-tokens.mjs`.
import { execFileSync } from "node:child_process";
import zlib from "node:zlib";

const ZSTD_MAGIC = 0xfd2fb528;

// kiwi primitive types, indexed by ~fieldType (-1 → bool … -8 → uint64).
const PRIMITIVES = [
  "bool",
  "byte",
  "int",
  "uint",
  "float",
  "string",
  "int64",
  "uint64",
];

/** Cursor over a kiwi byte buffer. */
class ByteBuffer {
  constructor(buf) {
    this.b = buf;
    this.i = 0;
  }
  byte() {
    return this.b[this.i++];
  }
  bool() {
    return !!this.byte();
  }
  varuint() {
    let value = 0,
      shift = 0,
      b;
    do {
      b = this.b[this.i++];
      value |= (b & 127) << shift;
      shift += 7;
    } while (b & 128 && shift < 35);
    return value >>> 0;
  }
  varint() {
    const v = this.varuint();
    return v & 1 ? ~(v >>> 1) : v >>> 1;
  }
  varuint64() {
    let value = 0n,
      shift = 0n,
      b;
    do {
      b = this.b[this.i++];
      if (shift < 56n) {
        value |= BigInt(b & 127) << shift;
        shift += 7n;
      } else {
        value |= BigInt(b) << shift;
        break;
      }
    } while (b & 128);
    return value;
  }
  varint64() {
    const v = this.varuint64();
    return v & 1n ? ~(v >> 1n) : v >> 1n;
  }
  // kiwi stores float32 rotated left by 9 bits so that zero/denormals collapse
  // to a single 0 byte; a leading 0 therefore means the value 0, not a prefix.
  float() {
    if (this.b[this.i] === 0) {
      this.i++;
      return 0;
    }
    const bits = this.b.readUInt32LE(this.i);
    this.i += 4;
    const rotated = ((bits << 23) | (bits >>> 9)) >>> 0;
    const dv = new DataView(new ArrayBuffer(4));
    dv.setUint32(0, rotated, true);
    return dv.getFloat32(0, true);
  }
  string() {
    const start = this.i;
    while (this.b[this.i] !== 0) this.i++;
    const s = this.b.toString("utf8", start, this.i);
    this.i++;
    return s;
  }
}

/** Decode the kiwi schema chunk into definitions (ENUM / STRUCT / MESSAGE). */
function decodeSchema(buf) {
  const bb = new ByteBuffer(buf);
  const defs = [];
  const definitionCount = bb.varuint();
  for (let i = 0; i < definitionCount; i++) {
    const name = bb.string();
    const kind = ["ENUM", "STRUCT", "MESSAGE"][bb.byte()];
    const fields = [];
    const fieldCount = bb.varuint();
    for (let j = 0; j < fieldCount; j++) {
      fields.push({
        name: bb.string(),
        type: bb.varint(),
        isArray: !!(bb.byte() & 1),
        value: bb.varuint(),
      });
    }
    defs.push({ name, kind, fields });
  }
  return defs;
}

/** Decode the data chunk against the schema, starting at the `Message` root. */
function decodeMessage(defs, buf) {
  const bb = new ByteBuffer(buf);

  const readValue = (field) => {
    if (field.type >= 0) return readDefinition(defs[field.type]);
    switch (PRIMITIVES[~field.type]) {
      case "bool":
        return bb.bool();
      case "byte":
        return bb.byte();
      case "int":
        return bb.varint();
      case "uint":
        return bb.varuint();
      case "float":
        return bb.float();
      case "string":
        return bb.string();
      // 64-bit ids exceed Number's safe range; keep them as strings.
      case "int64":
        return String(bb.varint64());
      case "uint64":
        return String(bb.varuint64());
      default:
        throw new Error(`unknown primitive type ${field.type}`);
    }
  };

  const readField = (field) => {
    if (!field.isArray) return readValue(field);
    const out = [];
    const n = bb.varuint();
    for (let i = 0; i < n; i++) out.push(readValue(field));
    return out;
  };

  const readDefinition = (def) => {
    if (!def) throw new Error("schema references a missing definition");
    if (def.kind === "ENUM") {
      const v = bb.varuint();
      return def.fields.find((f) => f.value === v)?.name ?? v;
    }
    const out = {};
    if (def.kind === "STRUCT") {
      // STRUCTs are positional: every field, in order, no terminator.
      for (const f of def.fields) out[f.name] = readField(f);
      return out;
    }
    // MESSAGEs are tagged: field id, then value, until an id of 0.
    for (;;) {
      const id = bb.varuint();
      if (id === 0) return out;
      const f = def.fields.find((x) => x.value === id);
      // An unknown id means the cursor has drifted — the remaining bytes would
      // decode as garbage, so fail loudly instead of returning a partial graph.
      if (!f) throw new Error(`unknown field id ${id} in ${def.name}`);
      out[f.name] = readField(f);
    }
  };

  const root = defs.find((d) => d.name === "Message");
  if (!root) throw new Error("schema has no `Message` root");
  return { message: readDefinition(root), consumed: bb.i, total: bb.b.length };
}

function inflateChunk(raw) {
  if (raw.readUInt32LE(0) === ZSTD_MAGIC) {
    if (typeof zlib.zstdDecompressSync !== "function")
      throw new Error("this .fig uses zstd — needs Node >= 22.15");
    return zlib.zstdDecompressSync(raw);
  }
  try {
    return zlib.inflateRawSync(raw);
  } catch {
    return zlib.inflateSync(raw);
  }
}

/**
 * Read a `.fig` export.
 * @returns {{nodes: object[], message: object}} `nodes` is `message.nodeChanges`:
 *   the flat node graph (documents, canvases, frames, variables, styles, …).
 */
export function readFig(figPath) {
  // `unzip -p` streams one member to stdout — no temp dir, no zip dependency.
  const canvas = execFileSync("unzip", ["-p", figPath, "canvas.fig"], {
    maxBuffer: 512 * 1024 * 1024,
  });
  if (canvas.subarray(0, 8).toString() !== "fig-kiwi")
    throw new Error(`${figPath}: canvas.fig is not fig-kiwi`);

  const chunks = [];
  let offset = 12; // 8-byte magic + 4-byte version
  while (offset + 4 <= canvas.length) {
    const len = canvas.readUInt32LE(offset);
    offset += 4;
    if (len === 0 || offset + len > canvas.length) break;
    chunks.push(inflateChunk(canvas.subarray(offset, offset + len)));
    offset += len;
  }
  if (chunks.length < 2)
    throw new Error(`${figPath}: expected schema + data chunks`);

  const defs = decodeSchema(chunks[0]);
  const { message, consumed, total } = decodeMessage(defs, chunks[1]);
  // A clean decode consumes the data chunk exactly. Anything short means the
  // graph is truncated, which would silently look like "these nodes don't exist".
  if (consumed !== total)
    throw new Error(
      `${figPath}: decoded ${consumed}/${total} bytes — graph is incomplete`,
    );
  return { nodes: message.nodeChanges ?? [], message };
}

/** Stable string key for a node GUID (`sessionID:localID`). */
export const guidKey = (guid) =>
  guid ? `${guid.sessionID}:${guid.localID}` : null;

/** Figma 0–1 RGB → `#rrggbb`. Alpha is dropped, matching `dump-tokens.md`. */
export const hex = (c) =>
  "#" +
  ["r", "g", "b"]
    .map((k) =>
      Math.round((c?.[k] ?? 0) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");

/**
 * Local, live nodes only — the `.fig` graph also carries soft-deleted nodes and
 * copies of variables subscribed from other libraries, neither of which the
 * Plugin API's `getLocal*` calls return. Without this filter a dump reports
 * deleted and third-party tokens as if they were the file's own.
 */
export const isLocalLive = (node) =>
  !node.isSoftDeleted && !node.sourceLibraryKey;

export { decodeSchema, decodeMessage, ByteBuffer };
export default readFig;
