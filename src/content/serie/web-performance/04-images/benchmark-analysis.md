# Analyse du benchmark mobile/desktop — pourquoi les chiffres semblent incohérents

> Rédigé le 2026-07-01, révisé le 2026-07-02 (réconciliation avec les analyses
> du 25 juin : origine du fondu prouvée dans les rapports desktop, clé de
> cache variante×deploy×edge). Contexte : passage du script de benchmark en dual-mode
> (mobile + desktop, médiane de 5 runs) sur le site live `astro-jeromeabel.netlify.app`.
> Les résultats mobiles paraissaient incompréhensibles. Ce document explique
> **pourquoi**, avec les preuves tirées des runs bruts, et propose une méthodologie
> défendable avant de réécrire l'article.

## 1. Les données brutes

### Médianes de 5 runs (`benchmark.mobile.json` / `benchmark.desktop.json`)

| Stratégie | LCP mobile | Octets mobile (KB) | LCP desktop | Octets desktop (KB) |
| --- | --- | --- | --- | --- |
| naive | 2204 | 9136 | 553 | 9136 |
| manual | 1932 | 1274 | 375 | 900 |
| auto | 1150 | 658 | 406 | 729 |
| pixel-perfect | 1214 | **1001** | 336 | **234** |
| lqip | 1303 | 669 | 452 | 741 |
| cropped | 1425 | 672 | 466 | 797 |
| final | **2346** | 958 | 390 | 246 |

CLS = 0 partout, sauf `naive` desktop = 0.004.

### LCP par run (mobile) — ce que la médiane cache

```
naive          5970 4433 2192 2204 2190   -> médiane 2204
manual         1932 2071 1317 2010 1266   -> médiane 1932
auto           1802 1149 1147 1150 1169   -> médiane 1150
pixel-perfect  1700 1214 1880 1154 1144   -> médiane 1214
final          1606 2390 4084 2342 2346   -> médiane 2346
```

## 2. Les quatre confusions, et leur cause vérifiée

### (a) `final` (2346) plus lent que `naive` (2204) — RÉEL, pas un bug

Le fondu *est* le LCP. Décomposition LCP (`lcp-breakdown-insight`) sur un run mobile :

| Sous-partie | `auto` mobile | `final` mobile |
| --- | --- | --- |
| TTFB | 495 | 203 |
| resource load delay | 22 | 22 |
| resource load duration | 79 | 446 |
| **element render delay** | **21** | **1236** |

Ce `1236 ms` ≈ `transition: opacity 1200ms` dans `reveal-img.ts`. Sur un cache
froid mobile, l'image n'est pas `complete` quand le script de révélation tourne →
il prend la branche réseau → l'image réelle (la plus grande) ne devient *visible*
qu'après le fondu de 1,2 s → le LCP compte ce délai.

Sur desktop la connexion rapide fait que `img.complete` est déjà vrai → le garde
snappe l'image → render delay 124 ms, `final` = 424 ms. Pas de pénalité.

**Point clé : ce n'est PAS qu'un artefact de labo.** Un vrai visiteur mobile en
première visite voit lui aussi l'image nette 1,2 s plus tard. Le placeholder LQIP
donne l'illusion d'instantané, mais le LCP-métrique (image réelle visible) est
honnêtement plus tardif. Le fondu appliqué à l'élément LCP retarde le LCP, en
labo comme sur le terrain.

`reveal-img.ts` applique le fondu à **chaque** `.reveal-img`, y compris la carte
above-fold qui contient le LCP. Aucune exemption.

**Pourquoi ce fondu n'apparaissait dans aucune analyse antérieure** (les
rapports du 25 juin dans `.specs/2026-06-25-optimg-lcp/` n'en parlent pas) :
il y était pourtant, mais trop petit pour être vu. Le script de fondu existe
depuis le 23 juin (`b76500a`), donc *avant* ces rapports. Le JSON du 25 juin
(`...221623.json`, `final`, desktop, URL live) montre déjà sa signature :

| Sous-partie | `auto` desktop 25/06 | `final` desktop 25/06 |
| --- | --- | --- |
| element render delay | 36 ms | **218 ms** |

218 ms sur un LCP de 400 ms : réel mais noyé dans le bruit, personne ne l'a
décomposé. Le passage en mode **mobile** (Slow 4G simulé) fait passer
`img.complete` de vrai à faux au moment où le script tourne → la branche
réseau prend le fondu complet → 218 ms deviennent 1236 ms. Ce n'est donc pas
une contradiction avec les analyses passées : c'est un effet présent depuis le
23 juin, sous le seuil de détection en desktop, amplifié ×6 par le throttling
mobile.

### (b) `CLS = 0` pour `naive` — le labo sous-estime

`naive` est un `<img class="block w-full">` nu, sans `width`/`height`, sans
`aspect-ratio` (le commentaire du composant dit lui-même « worst bytes + CLS »).
Il *devrait* décaler. Mesuré : mobile `0.0000`, desktop `0.0043` seulement.
(Le run local antérieur, `netlify serve`, montrait `0.011`.)

Cause : le throttling Lighthouse est *simulé* — la trace est capturée sur un
chargement **non bridé**. Les images eager non dimensionnées arrivent alors assez
vite pour être dimensionnées dès le premier paint → aucun décalage n'est
comptabilisé. Un vrai téléphone lent chargeant 9 MB décalerait franchement.

**Conséquence : le CLS de ce benchmark ne peut pas prouver l'intérêt du
`width`/`height`.** Cette garantie est structurelle, pas quelque chose qu'une
mesure sujette au timing révèle de façon fiable.

### (c) Script ≠ PageSpeed ≠ DevTools — jamais comparables en absolu

Trois environnements d'exécution différents :

| Outil | Où | Throttle | Cache navigateur | Cache CDN |
| --- | --- | --- | --- | --- |
| Script (`lighthouse@13` via `pnpm dlx`) | ma machine | simulé (mobile Slow 4G / desktop) | froid (storage reset chaque run) | chaud après run 1 |
| DevTools in-browser | ma machine | simulé OU appliqué selon réglage | selon profil | selon état |
| PageSpeed Insights | serveurs Google | mobile Slow 4G + CPU ×4 | froid | réseau Google → edge Netlify |

Seuls les **classements au sein d'un même outil / run** sont comparables. Les
chiffres absolus ne le sont jamais d'un outil à l'autre.

### (d) « Prod = chaud » (25 juin) vs « pics froids en prod » (1er juillet) — les deux sont vrais

Contradiction apparente avec `lesson-counter-intuitive-benchmarks.md` (25
juin), qui disait : *local `netlify serve` = transform froid à chaque run ;
prod = CDN déjà chaud, tout ≈ 0,3 s*. Le benchmark du 1er juillet, pourtant
sur l'URL live, montre des pics froids (`naive` mobile :
`5970 4433 2192 2204 2190`, runs 1-2 froids).

La résolution : **« chaud » n'est pas une propriété de l'environnement
(local/prod), c'est une propriété de la clé de cache** = variante exacte ×
deploy × nœud edge.

1. **La variante.** Les URLs de transform diffèrent par form factor : desktop
   demande `w=316`, mobile demande `w=962` (vérifié dans
   `network-requests` des runs bruts). Le 25 juin, les variantes desktop
   `w=316` étaient déjà en cache edge (visites et runs PSI antérieurs) →
   « prod = chaud ». Le 1er juillet, les variantes mobiles `w=962` n'avaient
   **jamais été demandées** → transform froid, sur le même site live.
2. **Le deploy.** Chaque URL de transform contient `dpl=<deploy-id>`. Un
   nouveau deploy change `dpl` → toutes les transforms recachées à zéro. Un
   benchmark lancé juste après deploy est froid par construction.
3. **`naive` n'a pas de transform** (fichiers `_astro/*.jpg` statiques) : ses
   pics froids sont des miss edge sur 9 MB d'originaux, pas du compute — même
   symptôme, autre cause.

La leçon du 25 juin reste vraie *pour les variantes qu'elle testait*. Sa
formulation « prod = chaud » était une surgénéralisation qui explose dès qu'on
change de form factor ou qu'on redéploie.

Conséquence sur la médiane : elle *cache* le pic froid au lieu de le
supprimer (elle choisit 2204 dans la série ci-dessus), et elle ne corrige ni
la pollution du fondu ni celle du timing CLS.

## 3. Quelle mesure pour comparer les stratégies — méthodologie définitive

### Le diagnostic en une phrase

Une colonne LCP unique mélange **quatre variables indépendantes** :

1. **Efficacité du payload** (octets livrés) — ce que l'article veut prouver
   (la thèse `sizes`) ;
2. **Régime de livraison** (transform/edge froid ou chaud, invalidé par
   `dpl` à chaque deploy) ;
3. **Comportement de rendu client** (le fondu de 1,2 s sur l'élément LCP) ;
4. **Artefacts de l'outil** (throttling simulé → CLS sous-estimé, storage
   reset, hardware local).

Comparer des stratégies sur ce mélange n'est pas interprétable. La règle de
l'article (« une seule variable à la fois ») s'applique à la mesure elle-même :
**une métrique par variable, chaque métrique dans un régime contrôlé.**

### Mesure 1 — Octets transférés : le classement principal

Octets d'images par stratégie × form factor, extraits de l'audit
`network-requests` (ou du build). Déterministe : zéro variance entre runs,
insensible au fondu, au cache et au timing. C'est la mesure directe de la
thèse `sizes`, et la seule colonne qui mérite le mot « classement ».
Mesurer mobile et desktop séparément (les variantes demandées diffèrent :
`w=316` vs `w=962`).

### Mesure 2 — LCP labo : valide seulement sous trois conditions

Le LCP ne devient comparable entre stratégies que si :

1. **Même pipeline de rendu.** Corriger d'abord `reveal-img.ts` : exempter
   l'above-fold (`loading="eager"` / `type="cover"`) du fondu — snap
   l'élément LCP, ne faire fondre que le lazy below-fold. Sans ce fix,
   `lqip`/`final` mesurent la durée d'une animation, pas une stratégie
   d'images. (C'est aussi la vraie leçon code : **ne jamais animer l'élément
   LCP** — et ça corrige l'affirmation fausse de l'article « le fondu ne
   déplacera pas un score Lighthouse ».)
2. **Régime de cache déclaré et forcé.** Le seul régime reproductible sur
   Netlify live est le **chaud** : ajouter dans `lighthouse.mjs` un run de
   chauffe jetable *par stratégie et par form factor* (une chauffe desktop ne
   chauffe pas les variantes `w=962` du mobile), puis médiane des runs
   chauds. Le froid n'est PAS mesurable proprement en prod : impossible
   d'évincer le cache edge à la demande, et `dpl` le réinitialise à chaque
   deploy de toute façon. Ne publier aucun chiffre « froid » live.
3. **Même session, même deploy, même outil.** Enregistrer le `dpl` dans les
   résultats et vérifier que tous les runs partagent le même. Jamais de
   comparaison de chiffres absolus entre script, PSI et DevTools (§2c).

Et publier le **min/médiane/max** par stratégie, pas la médiane seule : la
dispersion rend les pics froids visibles au lieu de les maquiller.

### Mesure 3 — CLS : structurel, pas mesuré

Le throttling simulé rend le CLS labo aveugle (§2b) : `naive` sans
`width`/`height` mesure 0. Ne pas citer de CLS labo comme preuve. Présenter
`width`/`height` comme une **garantie structurelle** (l'espace est réservé par
construction), illustrable par DevTools en throttling *appliqué* si besoin
d'une démo.

### Mesure 4 — Le perçu : filmstrip, pas LCP

Ce que le LQIP apporte (image « présente » immédiatement) est invisible — et
même pénalisé — dans le LCP. La mesure honnête du perçu est le
**filmstrip/vidéo** (Lighthouse le fournit) : montrer côte à côte
placeholder-puis-net vs blanc-puis-net. Un chiffre LCP `final` publié sans ce
contexte raconterait le contraire de la réalité perçue.

### Récapitulatif

| Variable | Mesure | Régime | Rôle dans l'article |
| --- | --- | --- | --- |
| Payload (`sizes`) | octets transférés | déterministe | **classement principal** |
| Vitesse de rendu | LCP médian (+ min/max), fondu corrigé | chaud forcé, même deploy | confirmation secondaire |
| Stabilité layout | aucune (structurel) | — | affirmation, pas mesure |
| Perçu (LQIP) | filmstrip | — | illustration |

## 4. Aspect mobile vs desktop : les octets s'inversent (et c'est correct)

| | auto | pixel-perfect | final |
| --- | --- | --- | --- |
| octets desktop (KB) | 746 | **240** | 246 |
| octets mobile (KB) | 673 | **1025** | 958 |

Desktop = grille 3 colonnes → slots miniatures 316 px à DPR 1 → petits fichiers.
Mobile = grille 1 colonne → miniatures pleine largeur à DPR 1.75 → gros fichiers.
`pixel-perfect` s'inverse (240 → 1025) parce qu'il dimensionne honnêtement au
grand slot pleine largeur ; le `sizes` générique d'`auto` le sous-estime (673).
Sur mobile, l'élément LCP est une image pleine largeur lourde, pas une petite
miniature — les octets pèsent beaucoup plus.

## 5. Actions possibles (à décider plus tard)

- [x] **Réécrire l'analyse de l'article** — section « Comparer proprement » +
      section mesure : octets comme classement, LCP fiable seulement pour les
      stratégies sans fondu, corriger les affirmations CLS et « le fondu ne bouge
      pas Lighthouse », introduire le mobile comme révélateur.
- [x] **Corriger le code du fondu** — `reveal-img.ts` / `DemoImage.astro` :
      exempter above-fold / `type="cover"` du fondu opacity (snap le LCP, ne
      faire fondre que le lazy below-fold). Puis re-benchmarker.
- [x] **Ajouter un run de chauffe** — `lighthouse.mjs` : run jetable par
      stratégie *et par form factor*, médiane des seuls runs chauds.
- [x] **Tracer le deploy** — enregistrer le `dpl` des URLs de transform dans
      les résultats ; refuser de comparer des runs de `dpl` différents.
- [x] **Reporter min/médiane/max** — `measure.mjs` : exposer la dispersion au
      lieu de la seule médiane.

### Résultats après correction (2026-07-03, throttling `devtools`)

Fondu exempté de l'above-fold (snap sur `naive`/`cover`, fondu conservé
seulement sur le lazy below-fold), chauffe + garde `dpl` en place, throttling
mobile passé de `simulate` à `devtools` (voir cause ci-dessous). Run live
sur un seul deploy (mobile et desktop partagent le même `dpl`).

**Pourquoi le throttling a changé.** Le premier run post-correction (méthode
`simulate`/Lantern, note précédente) gardait une dispersion bimodale sur
`pixel-perfect` (1121–3531 ms) et `final` (1412–2640 ms) malgré la chauffe.
Investigation : la requête de l'image LCP elle-même était quasi identique
sur les 5 runs (même URL, même `dpl`, ~41 Ko, fin de transfert 325–682 ms) —
la variance ne venait pas du CDN. `simulate` n'est pas une mesure directe :
Lighthouse rejoue la trace observée sur un profil réseau/CPU modélisé
(Lantern), et ce modèle amplifie de façon non linéaire la moindre gigue
réelle. Preuve : un run observé 343→715 ms (×2,1) devenait simulé
1138→3522 ms (×3,1). La chauffe (Task 2) prime le cache CDN, pas la
sensibilité de Lantern à la gigue — deux problèmes distincts qui produisaient
le même symptôme (grande dispersion).

**Effet du passage à `devtools`** (throttling réellement appliqué au réseau/CPU
au lieu de simulé ; desktop inchangé, déjà en profil léger ×1 CPU / 10 Mbps) :

- La dispersion min–max se resserre **sur toutes les stratégies mobiles**,
  pas seulement `pixel-perfect`/`final` : ratio max/min passe de 3,15× à
  1,006× (`pixel-perfect`), 1,87× à 1,025× (`final`), et pour les autres
  stratégies d'une fourchette 1,03–2,57× à 1,00–1,10×. Le diagnostic Lantern
  est confirmé dans son principe, mais l'effet n'était pas spécifique aux
  chaînes de dépendance longues comme supposé : `devtools` resserre la mesure
  partout.
- Les valeurs absolues de LCP **augmentent fortement** sous `devtools` (réseau
  réellement bridé sur toute la fenêtre de mesure, pas juste modélisé) :
  ordre de grandeur ×2 à ×12 selon la stratégie. `naive` passe de 2299 ms à
  28926 ms — cohérent avec son défaut connu (20 images en eager sans
  `loading`, cf. composant) : sous bande passante réellement contrainte, les
  20 requêtes se disputent réellement la bande passante, ce que `simulate`
  sous-estimait.
- **Changement de classement notable : `manual`.** Sous `simulate`, `manual`
  était 3ᵉ plus rapide (1308 ms, devant `final`/`lqip`/`pixel-perfect`). Sous
  `devtools`, il devient 2ᵉ plus lent (6535 ms, derrière `auto`/`cropped`/
  `lqip`/`final`/`pixel-perfect`). Cause probable : `manual` pèse ~1148 Ko
  d'images, environ le double d'`auto`/`lqip`/`cropped` (~590 Ko) — sur un
  réseau réellement bridé le temps de transfert est directement proportionnel
  aux octets, alors que Lantern ne semble pas avoir pondéré ce coût aussi
  lourdement pour une chaîne de dépendance courte (pas de hop de transform
  CDN). Le classement en **octets image** (`naive` ≫ `manual` >
  `pixel-perfect` ≈ `final` > `auto` ≈ `lqip` ≈ `cropped`) reste, lui,
  inchangé — il ne dépend pas du throttling.
- **`final` bat toujours `pixel-perfect` sur mobile** (4248 ms vs 4493 ms) —
  la conclusion de la correction du fondu tient dans sa direction, mais l'écart
  relatif se resserre (5,7 % contre 29 % sous `simulate`) : les deux
  chiffres absolus ayant explosé sous throttling réel, l'écart en valeur
  absolue pèse proportionnellement moins.
- **Desktop quasi inchangé** (297 vs 288 ms pour `pixel-perfect`, 406 vs
  408 ms pour `final`) — attendu, le profil desktop était déjà léger, sans
  matière à amplification Lantern.

Chiffres complets : `data/benchmark.{mobile,desktop}.json`
(`lcpMinMs`/`lcpMedianMs`/`lcpMaxMs`).

**Leçon explicite : ne jamais animer l'élément LCP.** L'above-fold « snap »
désormais (le placeholder LQIP reste peint derrière) ; seul le below-fold
garde le fondu. Ce n'est pas une régression de la démo, c'est la règle que
la démo enseigne.

**Leçon méthode : `simulate` (Lantern) n'est pas une mesure fiable en
absolu ni en dispersion pour comparer des stratégies mobiles entre elles.**
Utiliser `--throttling-method=devtools` pour des comparaisons mobiles
défendables, au prix d'un temps réel d'exécution nettement plus long (pas
de raccourci de simulation).

Note méthode : `imageBytes` compare les stratégies *au sein d'un mode*
(la marge de lazy-load diffère entre émulation mobile et desktop — jamais de
comparaison croisée mobile↔desktop sur ce champ).

## Sources de fichiers

- Scripts : `~/code/projects/astro-playground/scripts/{lighthouse,measure,benchmark}.mjs`
- Données : `~/code/projects/astro-playground/src/features/optimg/data/benchmark.{mobile,desktop}.json`
- Runs bruts : `~/code/projects/astro-playground/scripts/lh/{mobile,desktop}/<strategy>-<run>.json`
- Composant : `~/code/projects/astro-playground/src/features/optimg/components/DemoImage.astro`
- Fondu : `~/code/projects/astro-playground/src/features/optimg/scripts/reveal-img.ts`
