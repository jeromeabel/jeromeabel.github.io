import {
  w as NOOP_MIDDLEWARE_HEADER,
  x as decodeKey,
} from "./chunks/astro/server_DH1D9XnF.mjs";

const NOOP_MIDDLEWARE_FN = async (_ctx, next) => {
  const response = await next();
  response.headers.set(NOOP_MIDDLEWARE_HEADER, "true");
  return response;
};

const codeToStatusMap = {
  // Implemented from tRPC error code table
  // https://trpc.io/docs/server/error-handling#error-codes
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TIMEOUT: 405,
  CONFLICT: 409,
  PRECONDITION_FAILED: 412,
  PAYLOAD_TOO_LARGE: 413,
  UNSUPPORTED_MEDIA_TYPE: 415,
  UNPROCESSABLE_CONTENT: 422,
  TOO_MANY_REQUESTS: 429,
  CLIENT_CLOSED_REQUEST: 499,
  INTERNAL_SERVER_ERROR: 500,
};
Object.entries(codeToStatusMap).reduce(
  // reverse the key-value pairs
  (acc, [key, value]) => ({ ...acc, [value]: key }),
  {},
);

/* es-module-lexer 1.6.0 */
var ImportType;
!(function (A) {
  (A[(A.Static = 1)] = "Static"),
    (A[(A.Dynamic = 2)] = "Dynamic"),
    (A[(A.ImportMeta = 3)] = "ImportMeta"),
    (A[(A.StaticSourcePhase = 4)] = "StaticSourcePhase"),
    (A[(A.DynamicSourcePhase = 5)] = "DynamicSourcePhase");
})(ImportType || (ImportType = {}));
1 === new Uint8Array(new Uint16Array([1]).buffer)[0];
const E = () => {
  return (
    (A =
      "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"),
    "undefined" != typeof Buffer
      ? Buffer.from(A, "base64")
      : Uint8Array.from(atob(A), (A) => A.charCodeAt(0))
  );
  var A;
};
WebAssembly.compile(E())
  .then(WebAssembly.instantiate)
  .then(({ exports: A }) => {});

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [
          key,
          value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F"),
        ];
      }
      return [key, value];
    }),
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content
    .normalize()
    .replace(/\?/g, "%3F")
    .replace(/#/g, "%23")
    .replace(/%5B/g, "[")
    .replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment
    .map((part) => getParameter(part, params))
    .join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path =
      segments.map((segment) => getSegment(segment, sanitizedParams)).join("") +
      trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(
      rawRouteData.segments,
      rawRouteData._meta.trailingSlash,
    ),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute
      ? deserializeRouteData(rawRouteData.redirectRoute)
      : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex,
    origin: rawRouteData.origin,
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData),
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key,
  };
}

const manifest = deserializeManifest({
  hrefRoot: "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/",
  cacheDir:
    "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/node_modules/.astro/",
  outDir: "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/dist/",
  srcDir: "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/src/",
  publicDir:
    "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/public/",
  buildClientDir:
    "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/dist/",
  buildServerDir:
    "file:///home/jabel/workspace/perso/code/jeromeabel.github.io/.netlify/build/",
  adapterName: "@astrojs/netlify",
  routes: [
    {
      file: "",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        type: "page",
        component: "_server-islands.astro",
        params: ["name"],
        segments: [
          [{ content: "_server-islands", dynamic: false, spread: false }],
          [{ content: "name", dynamic: true, spread: false }],
        ],
        pattern: "^\\/_server-islands\\/([^/]+?)\\/?$",
        prerender: false,
        isIndex: false,
        fallbackRoutes: [],
        route: "/_server-islands/[name]",
        origin: "internal",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "404.html",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/404",
        isIndex: false,
        type: "page",
        pattern: "^\\/404\\/?$",
        segments: [[{ content: "404", dynamic: false, spread: false }]],
        params: [],
        component: "src/pages/404.astro",
        pathname: "/404",
        prerender: true,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "about/index.html",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/about",
        isIndex: false,
        type: "page",
        pattern: "^\\/about\\/?$",
        segments: [[{ content: "about", dynamic: false, spread: false }]],
        params: [],
        component: "src/pages/about.astro",
        pathname: "/about",
        prerender: true,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "work/index.html",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/work",
        isIndex: false,
        type: "page",
        pattern: "^\\/work\\/?$",
        segments: [[{ content: "work", dynamic: false, spread: false }]],
        params: [],
        component: "src/pages/work.astro",
        pathname: "/work",
        prerender: true,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
    {
      file: "index.html",
      links: [],
      scripts: [],
      styles: [],
      routeData: {
        route: "/",
        isIndex: true,
        type: "page",
        pattern: "^\\/$",
        segments: [],
        params: [],
        component: "src/pages/index.astro",
        pathname: "/",
        prerender: true,
        fallbackRoutes: [],
        distURL: [],
        origin: "project",
        _meta: { trailingSlash: "ignore" },
      },
    },
  ],
  site: "https://dev.jeromeabel.net",
  base: "/",
  trailingSlash: "ignore",
  compressHTML: true,
  componentMetadata: [
    ["\u0000astro:content", { propagation: "in-tree", containsHead: false }],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/components/FeatureCard.astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/pages/about.astro",
      { propagation: "in-tree", containsHead: true },
    ],
    [
      "\u0000@astro-page:src/pages/about@_@astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "\u0000@astrojs-ssr-virtual-entry",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/components/work/WorkCard.astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/components/work/WorksPreview.astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/pages/index.astro",
      { propagation: "in-tree", containsHead: true },
    ],
    [
      "\u0000@astro-page:src/pages/index@_@astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/pages/work.astro",
      { propagation: "in-tree", containsHead: true },
    ],
    [
      "\u0000@astro-page:src/pages/work@_@astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/pages/work/[id].astro",
      { propagation: "in-tree", containsHead: true },
    ],
    [
      "\u0000@astro-page:src/pages/work/[id]@_@astro",
      { propagation: "in-tree", containsHead: false },
    ],
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/pages/404.astro",
      { propagation: "none", containsHead: true },
    ],
  ],
  renderers: [],
  clientDirectives: [
    [
      "idle",
      '(()=>{var l=(n,t)=>{let i=async()=>{await(await n())()},e=typeof t.value=="object"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};"requestIdleCallback"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event("astro:idle"));})();',
    ],
    [
      "load",
      '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event("astro:load"));})();',
    ],
    [
      "media",
      '(()=>{var n=(a,t)=>{let i=async()=>{await(await a())()};if(t.value){let e=matchMedia(t.value);e.matches?i():e.addEventListener("change",i,{once:!0})}};(self.Astro||(self.Astro={})).media=n;window.dispatchEvent(new Event("astro:media"));})();',
    ],
    [
      "only",
      '(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event("astro:only"));})();',
    ],
    [
      "visible",
      '(()=>{var a=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value=="object"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let l of e)if(l.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=a;window.dispatchEvent(new Event("astro:visible"));})();',
    ],
  ],
  entryModules: {
    "\u0000noop-middleware": "_noop-middleware.mjs",
    "\u0000@astro-page:src/pages/404@_@astro": "pages/404.astro.mjs",
    "\u0000@astro-page:src/pages/about@_@astro": "pages/about.astro.mjs",
    "\u0000@astro-page:src/pages/work/[id]@_@astro":
      "pages/work/_id_.astro.mjs",
    "\u0000@astro-page:src/pages/work@_@astro": "pages/work.astro.mjs",
    "\u0000@astro-page:src/pages/index@_@astro": "pages/index.astro.mjs",
    "\u0000@astrojs-ssr-virtual-entry": "entry.mjs",
    "\u0000@astro-renderers": "renderers.mjs",
    "\u0000@astrojs-ssr-adapter": "_@astrojs-ssr-adapter.mjs",
    "\u0000@astrojs-manifest": "manifest_BDbhaEC5.mjs",
    "/home/jabel/workspace/perso/code/jeromeabel.github.io/node_modules/.pnpm/astro@5.3.0_@netlify+blobs@8.1.1_@types+node@22.13.5_jiti@2.4.2_lightningcss@1.29.1_rollup@4.34.8_typescript@5.7.3/node_modules/astro/dist/assets/services/sharp.js":
      "chunks/sharp_3pYiVym8.mjs",
    "/home/jabel/workspace/perso/code/jeromeabel.github.io/.astro/content-assets.mjs":
      "chunks/content-assets_CNJw2wzQ.mjs",
    "/home/jabel/workspace/perso/code/jeromeabel.github.io/.astro/content-modules.mjs":
      "chunks/content-modules_Dz-S_Wwv.mjs",
    "\u0000astro:data-layer-content":
      "chunks/_astro_data-layer-content_pvS1Pr9H.mjs",
    "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts":
      "_astro/Layout.astro_astro_type_script_index_0_lang.N54v0ka4.js",
    "/home/jabel/workspace/perso/code/jeromeabel.github.io/node_modules/.pnpm/astro@5.3.0_@netlify+blobs@8.1.1_@types+node@22.13.5_jiti@2.4.2_lightningcss@1.29.1_rollup@4.34.8_typescript@5.7.3/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts":
      "_astro/ClientRouter.astro_astro_type_script_index_0_lang.BScVxmeO.js",
    "astro:scripts/before-hydration.js": "",
  },
  inlinedScripts: [
    [
      "/home/jabel/workspace/perso/code/jeromeabel.github.io/src/layouts/Layout.astro?astro&type=script&index=0&lang.ts",
      'document.addEventListener("astro:page-load",()=>{const a=[...document.querySelectorAll(".reveal")];if(a){const r=e=>{e.forEach(s=>{s.isIntersecting&&!s.target.classList.contains("reveal-anim")&&s.target.classList.add("reveal-anim")})},t=new IntersectionObserver(r,{threshold:.25});a.forEach(e=>t.observe(e))}});',
    ],
  ],
  assets: [
    "/_astro/404.CgzfRCql.svg",
    "/_astro/skills.DynD7OLl.svg",
    "/_astro/skills_design_flat.DvPiR1oU.svg",
    "/_astro/skills_env_flat.taOsc0CV.svg",
    "/_astro/skills_front_flat.DAXWBFwu.svg",
    "/_astro/ibm-plex-sans-cyrillic-ext-300-normal.BDn9f5uP.woff2",
    "/_astro/ibm-plex-sans-cyrillic-300-normal.FkaoFC6f.woff2",
    "/_astro/ibm-plex-sans-latin-ext-300-normal.C43kZZN8.woff2",
    "/_astro/ibm-plex-sans-vietnamese-300-normal.BCPYfhOr.woff2",
    "/_astro/ibm-plex-sans-greek-300-normal.D9jdUMk3.woff2",
    "/_astro/ibm-plex-sans-latin-300-normal.CsRMuZjv.woff2",
    "/_astro/ibm-plex-sans-cyrillic-ext-600-normal.jBHiQjEG.woff2",
    "/_astro/ibm-plex-sans-cyrillic-600-normal.DM9A4i1K.woff2",
    "/_astro/ibm-plex-sans-greek-600-normal.FZrtz_q-.woff2",
    "/_astro/ibm-plex-sans-vietnamese-600-normal.DHNi5J5O.woff2",
    "/_astro/ibm-plex-sans-latin-ext-600-normal.dAZVOL-H.woff2",
    "/_astro/ibm-plex-sans-latin-600-normal.BGOKnPO6.woff2",
    "/_astro/ibm-plex-sans-cyrillic-ext-400-normal.BJItruJi.woff2",
    "/_astro/ibm-plex-sans-cyrillic-400-normal.BPWuI_CM.woff2",
    "/_astro/ibm-plex-sans-greek-400-normal.n6oPB5VF.woff2",
    "/_astro/ibm-plex-sans-vietnamese-400-normal.B97dYap6.woff2",
    "/_astro/ibm-plex-sans-latin-ext-400-normal.BHf956ki.woff2",
    "/_astro/ibm-plex-sans-latin-400-normal.CdZtFfYS.woff2",
    "/_astro/footer_400px.BgVLMCFa.svg",
    "/_astro/hero.dwHkZAU2.svg",
    "/_astro/ibm-plex-sans-cyrillic-ext-300-normal.BxOZ3r-7.woff",
    "/_astro/ibm-plex-sans-cyrillic-300-normal.bVerGvbK.woff",
    "/_astro/ibm-plex-sans-latin-ext-300-normal.DA5vATSE.woff",
    "/_astro/ibm-plex-sans-vietnamese-300-normal.BPvb60WJ.woff",
    "/_astro/ibm-plex-sans-greek-300-normal.-aZSq2sI.woff",
    "/_astro/ibm-plex-sans-latin-300-normal.acDnyfry.woff",
    "/_astro/ibm-plex-sans-cyrillic-ext-600-normal.CJ5MtzOJ.woff",
    "/_astro/ibm-plex-sans-greek-600-normal.BJUfoJTU.woff",
    "/_astro/ibm-plex-sans-cyrillic-600-normal.BuRiwhxF.woff",
    "/_astro/ibm-plex-sans-vietnamese-600-normal.D03elqKW.woff",
    "/_astro/ibm-plex-sans-latin-ext-600-normal.bp4QDljZ.woff",
    "/_astro/ibm-plex-sans-latin-600-normal.ZykYOGKL.woff",
    "/_astro/ibm-plex-sans-cyrillic-ext-400-normal.C1SKuNhx.woff",
    "/_astro/ibm-plex-sans-cyrillic-400-normal.CTUnhTqV.woff",
    "/_astro/ibm-plex-sans-greek-400-normal.DSasf_jt.woff",
    "/_astro/ibm-plex-sans-vietnamese-400-normal.OKGpH0gQ.woff",
    "/_astro/ibm-plex-sans-latin-ext-400-normal.CyDjbWPV.woff",
    "/_astro/ibm-plex-sans-latin-400-normal.BU83cd9M.woff",
    "/_astro/curve_arrow_text.Dl-IA9ud.svg",
    "/_astro/creativity.D9V44SoZ.svg",
    "/_astro/user.q831_IzR.svg",
    "/_astro/quality.CpxF5pET.svg",
    "/_astro/phone.DpBYtH4F.png",
    "/_astro/setup32.CGbsvpLo.png",
    "/_astro/patch.ACLgbhG3.png",
    "/_astro/tech.BZhPP0W-.jpg",
    "/_astro/exhibition.CVeUpJrr.jpg",
    "/_astro/exhibition-small.DbV0kENg.jpg",
    "/_astro/preview.BemKDk93.jpg",
    "/_astro/preview-small.pMCy8kkU.jpg",
    "/_astro/screens.Bbo4viVF.png",
    "/_astro/login.BEBgYrgF.png",
    "/_astro/social.BQjjrfLx.jpg",
    "/_astro/small.C7zbBN7j.png",
    "/_astro/screen.CB53ZJDd.png",
    "/_astro/swagger.mZhgmtLj.jpg",
    "/_astro/preview.C3XiDsyx.png",
    "/_astro/preview-small.DMMv6feq.jpg",
    "/_astro/social.0q3X2HNv.jpg",
    "/_astro/tech.D8oZ-XVf.png",
    "/_astro/craslab-screen.JXQaWoWf.jpg",
    "/_astro/pd-gem-ui.DLTmeuNL.png",
    "/_astro/cover-small.B1wHI7be.jpg",
    "/_astro/preview.B2qCwbDY.jpg",
    "/_astro/valise-screens.DK0hEMQm.jpg",
    "/_astro/preview-small.CwLDcipx.jpg",
    "/_astro/cover.CV_BFKcs.jpg",
    "/_astro/social.BHZXoSep.jpg",
    "/_astro/sceno.D_ckMgMO.png",
    "/_astro/code.DLwQ4UjW.png",
    "/_astro/cover.DaMj69W_.jpg",
    "/_astro/cover-small.By2fbmYQ.jpg",
    "/_astro/preview-small.DkcsghBG.jpg",
    "/_astro/preview.BNGYQFEj.jpg",
    "/_astro/social.B9YKwqzX.jpg",
    "/_astro/php.XJvE4sfe.jpg",
    "/_astro/python.DCUUYGqT.jpg",
    "/_astro/cover-small.CUOrFJT0.jpg",
    "/_astro/xbee.Bh-GSZBv.jpg",
    "/_astro/workshops.Ctk0RKvt.jpg",
    "/_astro/cover.BlMyfLXb.jpg",
    "/_astro/preview-small.DXatCthe.jpg",
    "/_astro/contact.Bh71uitv.jpg",
    "/_astro/slideshow.BDMrlakB.jpg",
    "/_astro/social.D1M-D3Mk.jpg",
    "/_astro/preview.oOPRS5YO.jpg",
    "/_astro/screen.CxiExmXO.jpg",
    "/_astro/small.DAkxelKz.jpg",
    "/_astro/preview.DzSoUqDI.jpg",
    "/_astro/preview-small.tJ7s4GhU.jpg",
    "/_astro/social.DKk4B-vk.jpg",
    "/_astro/screens.DW8NmUN0.png",
    "/_astro/valise.Bb-SlPQh.jpg",
    "/_astro/table.B3JhygQ_.png",
    "/_astro/coverage.DTrrBSCJ.png",
    "/_astro/performance.DXwQ_UC8.png",
    "/_astro/small.BOECW_Gy.jpg",
    "/_astro/preview-small.D4PhFSDM.jpg",
    "/_astro/screen.BKalEwvY.jpg",
    "/_astro/preview.BHwX_nfq.jpg",
    "/_astro/social.B03kc8T1.jpg",
    "/_astro/cover-small.BfrXfgM4.jpg",
    "/_astro/web.Do5snadL.jpg",
    "/_astro/cover.CLPnWzOK.jpg",
    "/_astro/preview-small.rH27mC1o.jpg",
    "/_astro/social.1eIiUoxm.jpg",
    "/_astro/preview.CMJ0q4GE.jpg",
    "/_astro/figma.Wh9aFN60.jpg",
    "/_astro/pagespeed.DvRF1joC.png",
    "/_astro/menu.Djq3XmxE.jpg",
    "/_astro/userstory.eqsGa29W.jpg",
    "/_astro/mermaid.DdJv88td.jpg",
    "/_astro/screens-small.VBX0mDz1.jpg",
    "/_astro/screens.Ca7RwsPL.jpg",
    "/_astro/preview-small.WTSdnVhL.jpg",
    "/_astro/social.BmgYeIYB.jpg",
    "/_astro/preview.D8OLtu15.jpg",
    "/_astro/tech.C9H7So9V.jpg",
    "/_astro/tracking.ZLj9mmCk.jpg",
    "/_astro/screen.aOFgtiLy.jpg",
    "/_astro/small.DJ5xWahL.jpg",
    "/_astro/preview-small.B6msG9UC.jpg",
    "/_astro/preview.DezV-Nqh.jpg",
    "/_astro/sensors.BY_z1mAL.png",
    "/_astro/social.8ASWfzmo.jpg",
    "/_astro/pymotion.7cCT3hKt.jpg",
    "/_astro/feedback.CWLjsdJ1.gif",
    "/_astro/wiring.CJaN6LTI.png",
    "/_astro/screen.BRztMgnv.png",
    "/_astro/lithica.CRI_7fGD.jpg",
    "/_astro/lithica-small.VIjQnL41.jpg",
    "/_astro/preview.B07PyBvO.jpg",
    "/_astro/preview-small.CB-amXoT.jpg",
    "/_astro/social.iEC4ICBY.jpg",
    "/_astro/tech.CfbDzKf-.png",
    "/_astro/screens.DvIWVNw3.jpg",
    "/_astro/screen.CFtUypCd.jpg",
    "/_astro/preview.BvNUdSlW.jpg",
    "/_astro/small2.DiQH4Ccp.jpg",
    "/_astro/preview-small.C1fpKT13.jpg",
    "/_astro/social.uqFlGRqh.jpg",
    "/_astro/screen.CEICDVcc.jpg",
    "/_astro/supabase.Dsi7chnr.png",
    "/_astro/stripe.BMLANi5I.jpg",
    "/_astro/thanks.BwMhjXbY.jpg",
    "/_astro/screens.CrCKaepC.jpg",
    "/_astro/screens-small.BOPJniGV.jpg",
    "/_astro/preview.CVceyp_8.jpg",
    "/_astro/preview-small.DwzeR9Ej.jpg",
    "/_astro/social.CeYiYRe9.jpg",
    "/_astro/workshop.Jlp-QnMw.jpg",
    "/_astro/brutbox.gNTNWqk_.jpg",
    "/_astro/kit.DjwyYtU3.jpg",
    "/_astro/objects.iLnTzvNe.png",
    "/_astro/pd2png.DAyEVB8o.png",
    "/_astro/small.CxqJc9a7.jpg",
    "/_astro/malinette.CROXwVf8.png",
    "/_astro/hub.Cw90pSXp.jpg",
    "/_astro/preview.B3nu3zSv.png",
    "/_astro/preview-small.CEBuOCD5.jpg",
    "/_astro/social.C2jLgbpX.jpg",
    "/_astro/screen.BHzQ-5a9.jpg",
    "/_astro/small.BS5jwPdM.jpg",
    "/_astro/preview.Hivp2_Pk.jpg",
    "/_astro/preview-small.BYQVz3_F.jpg",
    "/_astro/social.DsjTgY4m.jpg",
    "/_astro/identity.Dypcc6Wr.jpg",
    "/_astro/jeromeabel.CN8n3ntT.png",
    "/_astro/mockup.BKPZ_jdv.png",
    "/_astro/lighthouse.C_ToXu3O.png",
    "/_astro/screens.CE4ntzM6.png",
    "/_astro/screens-small.fWAETTvw.jpg",
    "/_astro/preview.Bih8YPjF.png",
    "/_astro/preview-small.D14yJ-rj.jpg",
    "/_astro/social.DUvcArAm.png",
    "/_astro/screens.DoH1qZxS.png",
    "/_astro/screens-small.DZwhkLxX.jpg",
    "/_astro/preview-small.Bd0ULJyf.jpg",
    "/_astro/preview.CKob2zFy.png",
    "/_astro/social.CZ8zm1he.png",
    "/_astro/screen.COsU6kwl.jpg",
    "/_astro/small.BfypcfaQ.jpg",
    "/_astro/preview-small.BgXtqnkd.jpg",
    "/_astro/preview.CV_pLxHb.jpg",
    "/_astro/social.CUoCJOZb.jpg",
    "/_astro/about.DfFsWhLR.css",
    "/CV_JeromeAbel_en.pdf",
    "/android-chrome-192x192.png",
    "/android-chrome-512x512.png",
    "/apple-touch-icon.png",
    "/bubbler-one-latin-400-normal.woff",
    "/bubbler-one-latin-400-normal.woff2",
    "/favicon-16x16.png",
    "/favicon-32x32.png",
    "/favicon.ico",
    "/favicon.svg",
    "/jeromeabel-social.png",
    "/robots.txt",
    "/site.webmanifest",
    "/_astro/ClientRouter.astro_astro_type_script_index_0_lang.BScVxmeO.js",
    "/404.html",
    "/about/index.html",
    "/work/index.html",
    "/index.html",
    "/~partytown/partytown-atomics.js",
    "/~partytown/partytown-media.js",
    "/~partytown/partytown-sw.js",
    "/~partytown/partytown.js",
  ],
  buildFormat: "directory",
  checkOrigin: true,
  serverIslandNameMap: [],
  key: "IFEhkWFrLIa0+ARG0qbn9MF6j08AzPs+LiyeOXf9JMM=",
});
if (manifest.sessionConfig) manifest.sessionConfig.driverModule = null;

export { manifest };
