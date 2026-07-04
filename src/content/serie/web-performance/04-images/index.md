---
title: "Optimiser les images avec Astro"
date: 2026-06-25
description: "Les images sont souvent les éléments les plus lourds d'une pages web. Les assets dans Astro facilitent leur intégration, mais nous pouvons aller plus loin en ajustant les tailles de façon optimale et en ajoutant un fondu intelligent, qui refuse d'animer les images en cache."
abstract: "Du redimensionnement manuel des images jusqu'à Astro et le Netlify Image CDN : ce que le framework automatise (formats, srcset, CLS) et ce que vous devez écrire vous-même pour aller plus loin comme le fondu intelligent et l'optimisation des tailles."
draft: false
---

Les images sont souvent l'élément le plus lourd à télécharger pour votre navigateur. Elles sont de ce fait en grande partie responsable des mauvais scores de performance. Pour les images, on peut s'intéresser a deux métriques LCP (Large Content Paint) et le CLS (Cumulative Layout Shift).

Pour accompagner l'article, des exemples concrets sur le [playground compagnon](https://astro-jeromeabel.netlify.app/optimg).

## Le redimensionnement manuel

On peut très bien se passer de framework pour automatiser la création et l'affichage des images avec des scripts et du CSS. On va voir que c'est une approche tout à fait valable. L'idée est la même : afficher les images visibles le plus rapidement possible en s'adaptant aux dimensions de l'écran.

La base, une image fluide en CSS:

```css
img { display: block; max-width: 100%; height: auto; }
```

Une seule version de l'image ne suffit souvent jamais. Il faut pouvoir fournir d'autres tailles de la même image pour s'adapter ("responsive") à la largeur de l'écran (viewport), au ratio de pixel de l'appareil (DPR pour Device Pixel Ratio) et aux différents configurations d'affichage ("layouts") de la page (minitiatures, hero, grille, colonnes, etc.). Par exemple si une image a un emplacement disponible de 1024px, alors un écran avec un DPR 2 voudra le double, donc une image de 2048px.

En HTML, les propriétés `srcset` et `sizes` permettent au navigateur de choisir l'image la plus adaptée, la moins lourde à charger. 

```html
<img
  src="640.jpg"
  srcset="640.jpg 640w, 768.jpg 768w, 1024.jpg 1024w,
          1280.jpg 1280w, 1536.jpg 1536w, 2048.jpg 2048w"
  sizes="(max-width: 1023px) 100vw, (max-width: 1536px) 50vw, 768px"
  alt="">
```

Notez que les valeurs de `sizes` doivent se rapprocher de votre layout CSS réel. Ce qui ne peut être déduit automatiquement par le framework. Dans cet exemple, nous voulons afficher l'image en pleine largeur (100vw) en dessous de 1024px, et seulement la moitié (50vw) pour un écran plus grand qui correspondra dans notre mise en page à un affichage en deux colonnes, sans dépasser 768px. Un `sizes` incorrect et le navigateur télécharge le mauvais fichier, augmentant inutilement le chargement de la page.

Exemple de script basique pour générer une version de l'image flou avec ImageMagick :

```bash
for SIZE in "${SIZES[@]}"; do
  convert "$FILENAME" -resize $SIZE "out/${NAME}_$SIZE.$EXT"
  if [ "$SIZE" == "640x" ]; then
    convert "out/${NAME}_$SIZE.$EXT" -blur 0x8 "out/${NAME}_$SIZE-blur.$EXT"
  fi
done
```

Les assistants IA sont très utiles pour générer ce type de scripts.

## Ce que propose Astro

Le composant `<Picture>` fournit par Astro simplifie en grande partie le travail précédent. Il génère un élément `<picture>` avec une `<source>` par format moderne et un fallback `<img>`. Il suffit de lister les formats du plus moderne au plus ancien — l'ordre est la priorité d'affichage.

```astro
---
import { Picture } from "astro:assets";
import hero from "./hero.png"; // 1600x900
---
<Picture 
  src={hero} 
  formats={["avif", "webp"]} 
  layout="constrained"
  width={800} 
  height={600} 
  alt="…" 
/>
```

La propriété `layout` va permettre de générer `srcset` et `sizes`. Exemple en sortie :

```html
<img 
  src="/_astro/hero.hash.webp"
  srcset="…640w, …750w, …800w, …1080w, …1280w, …1600w"
  sizes="(min-width: 800px) 800px, 100vw"
  loading="lazy" 
  decoding="async"
  width="800" 
  height="600" 
  data-astro-image="constrained">
```

La paire `width`/`height` est automatiquement définit pour réserver l'espace nécessaire avant que l'image se charge. Ce qui **annule le CLS**, car il n'y aura pas de décalage non prévu dans l'affichage.

### Générer une fois ou à la demande

Par défaut, la création des images ne nécessite pas de serveur. Au moment du "build" `astro:assets` crée les fichiers statiques "hachés" dans `/_astro/`. Ce qui permet un déploiement partout: GitHub Pages, S3, une clé USB.

Avec les adaptateurs, on peut aller plus loin. Dans le projet companon, j'utilise l'adaptateur `@astrojs/netlify`, ce qui permet de bénéficier du **Netlify Image CDN**. Le redimensionnement se fait alors à la demande. Pour un site avec des centaines d'images le temps de build n'est donc pas impacté, et le CDN met en cache les fichiers. D'autres services sont disponibles : Cloudinary, Imgix et d'autres ont des intégrations.

Les deux options ont leurs avantages et inconvénients :
- Pour la version statique, deux opérations potentiellement longues sont nécessaires : la création d'images au moment du "build" et leur transfert vers l'espace d'hébergement. En revanche, au moment de la navigation par un visiteur, le serveur a juste à livrer les images, elles sont déjà prêtes.
- Le CDN à la demande, lui, diffère le travail à la première requête : sur un cache froid, le serveur doit récupérer la source, la décoder, la redimensionner, la ré-encoder en AVIF, puis répondre — du calcul serveur qui s'ajoute au TTFB, par image et par cycle de cache. Une fois le fichier en cache, c'est directement accessible ; le problème se reporte sur le premier visiteur.

« Premier visiteur » désigne la première personne — n'importe laquelle — à demander cette variante précise sur un nœud edge donné, pas vous en particulier. Le cache est partagé : une fois qu'un visiteur a payé la transformation, le fichier est en cache et tous les suivants le reçoivent déjà prêt, jusqu'à ce que le cache expire ou qu'un redéploiement (`dpl`) l'invalide. Le coût de « première visite » est donc payé une fois par variante et par nœud, pas à chaque visite.


### Petit piège avec Tailwind

Si vous avez l'habitude d'utiliser Tailwind il se peut que vous rencontriez un problème avec la façon dont Astro gère les images "responsive". Pour utiliser les images responsive dans Astro, il faut ajouter au fichier de configuration ([doc](https://docs.astro.build/en/guides/images/#responsive-image-styles)):

```js
// astro.config.mjs
image: { responsiveStyles: true }, // par défaut false
```

Cela injecte des règles CSS globales délibérément faibles en spécificité via `:where([data-astro-image])` qui l'emportent sur les classes Tailwind. Ce qui rend les classes Tailwind inopérantes. Bon à savoir avant de passer dix minutes à comprendre pourquoi `object-cover` n'a aucun effet. La solution de remplacement est d'utiliser les props `fit` et `position` qui se branchent directement dans ces mêmes styles responsives :

```astro
<Picture src={img} layout="constrained" fit="cover" position="top" alt="…" />
```

L'autre option est de désactiver `responsiveStyles` et prendre en charge entièrement le CSS. 


Depuis Astro 6, les styles responsives sont émis sous forme de classe hachée plus des attributs `data-astro-fit` / `data-astro-pos`. 

Exemple d'usage des props : à partir d'une seule image, générer deux images recadrées (une miniature carrée sur la grille, une large couverture paysage sur la page de détail), sans script.  

```astro
{/* grille : recadrage carré */}
<Picture src={img} layout="constrained" width={400} height={400} fit="cover" alt="…" />

{/* couverture détail : paysage, focus en haut */}
<Picture src={img} layout="full-width" width={1200} height={600} fit="cover" position="top" alt="…" />
```

## Benchmark de sept stratégies

Le [projet "optimg"](https://astro-jeromeabel.netlify.app/optimg) accompagne cette article pour présenter sept stratégies, de la plus naïve à la plus sophistiquée. Un premier benchmark en local a été réalisé avec `netlify serve` et Lighthouse en prenant la médiane de 3 itérations pour comparer leurs performances.

| Stratégie | LCP (ms) | CLS | Transfert (KB) | Description |
| --- | --- | --- | --- | --- |
| [naive](https://astro-jeromeabel.netlify.app/optimg/naive) | 4876 | 0.011 | 9400 | Sans `srcset`, `width`, `height` |
| [manual](https://astro-jeromeabel.netlify.app/optimg/manual) | 749 | 0.000 | 962 | JPEG ré-encodés par sharp (qualité 78), 3 largeurs + un fallback flou, servis en statique depuis `/public/` |
| [auto](https://astro-jeromeabel.netlify.app/optimg/auto) | 1529 | 0.000 | 523 | `<Picture>` basique, plusieurs tailles et formats AVIF/WebP transformés à la demande par le CDN Netlify |
| [pixel-perfect](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect) | 1001 | 0.000 | 236 | `<Picture>` avec optimisation des tailles au pixel près |
| [lqip](https://astro-jeromeabel.netlify.app/optimg/lqip) | 1254 | 0.000 | 541 | Une image floue de basse qualité (LQIP) s'affiche au plus vite en attendant le chargement de `<Picture>` |
| [cropped](https://astro-jeromeabel.netlify.app/optimg/cropped) | 1600 | 0.000 | 559 | `<Picture>` basique avec découpage de l'image |
| [final](https://astro-jeromeabel.netlify.app/optimg/final) | 1077 | 0.000 | 254 | Combine `<Picture>`, optimisation des tailles et LQIP |

Une fois les largeurs et hauteurs précisées, plus aucun problème de CLS. Simple. Une seule version par image (`naive`) est un désastre : 4876 ms de LCP et 9400 KB de transfert. Basique.

!["Simple, basique"](./basic.png)

Le reste du tableau n'est pas si basique, voir carrément contre-intuitif. La stratégie `manual` utilisant un format JPEG moins optimal qu'AVIF et deux fois plus lourd qu'`auto` (962 vs 523 KB), obtient un LCP deux fois meilleur. 🙃

Le piège, c'est que mon benchmark mesure deux choses en même temps.

- **La stratégie *et* le pipeline de déploiement.** `manual` est servi en statique depuis le disque ; `auto`, `pixel-perfect` et `final` émettent des URL `/.netlify/images?url=…` et, au premier accès, le serveur doit récupérer la source, la décoder, la redimensionner, la ré-encoder en AVIF, puis répondre — du calcul qui s'ajoute au TTFB. Or `netlify serve` vide son cache à chaque lancement : la mesure est toujours froide, donc cette transformation est toujours payée. Le 2× d'écart, c'est cette taxe, pas le format.
- **L'élément LCP est une miniature de 316 px, servie trop large.** La page est une grille de 21 images ; le LCP est `photo-01`, une miniature de 316 px. À cette taille, JPEG ou AVIF pèsent à peu près pareil (≈ 39 vs 25 KB) — le gain de format est invisible. Pire : le `sizes` de `manual` comme d'`auto` résout ce slot de 316 px par un fichier `w=640`, deux fois trop large. La preuve : `pixel-perfect` (1001 ms) et `final` (1077 ms) utilisent *exactement la même* transformation AVIF qu'`auto` et le battent de ~500 ms, juste en servant la bonne taille.

Bref, ce premier benchmark fournit le pire scénario — un cache vide, comme une première visite — et il confond la stratégie avec le pipeline. J'ai cru mesurer une variable, j'en mesurais deux.


## Comparer proprement : une variable à la fois

Maintenant que j'ai compris la leçon, j'ai tout refait sur des bases saines. Trois changements :

- **Un jeu d'images réaliste.** Les sources picsum du premier essai étaient déjà optimisées, et sur une miniature JPEG et AVIF pèsent presque pareil — de quoi masquer les écarts que les stratégies existent pour montrer. J'ai figé un jeu d'originaux bruts (committé une fois), et le générateur dérive chaque variante à partir de là. Reproductible, et `manual`/`pixel-perfect` gagnent enfin visiblement.
- **Un régime de cache déclaré et forcé.** Le seul régime reproductible sur Netlify live est le **chaud**. Chaque stratégie × mode reçoit un run de chauffe jetable qui amorce le cache edge, puis médiane de 5 runs mesurés. Chaque URL de transform porte un `dpl=<deploy-id>` ; je vérifie que tous les runs partagent le même — sinon un redéploiement en cours de benchmark aurait tout recaché à zéro.
- **La bonne métrique en tête.** Une colonne LCP unique mélange quatre variables : les octets livrés, le régime de cache, le fondu de rendu et les artefacts de l'outil. La seule mesure déterministe — zéro variance, insensible au cache et au fondu — c'est les **octets d'images transférés**. C'est le classement principal ; le LCP vient en confirmation, publié en **min / médiane / max** pour que la dispersion soit visible plutôt que maquillée par la seule médiane.

Et surtout, je mesure **mobile et desktop séparément**. C'est là qu'est la vraie histoire.

### Mobile — le révélateur

Émulation Moto G Power, Slow 4G réellement *appliqué* (`--throttling-method=devtools`, pas le modèle Lantern qui amplifiait le bruit de façon non linéaire). Classement par octets d'images ; LCP en médiane (min–max) de 5 runs chauds, tous sur le même deploy.

| Stratégie | Octets image (KB) | LCP méd. (min–max) ms |
| --- | --- | --- |
| naive | 9124 | 28891 (28774–28936) |
| manual | 1148 | 6542 (6533–6602) |
| pixel-perfect | 913 | 4494 (4481–4560) |
| final | 913 | 4514 (4501–4523) |
| auto | 597 | 3794 (3778–3805) |
| lqip | 597 | 3822 (3807–3832) |
| cropped | 585 | 3547 (3533–3616) |

Rien ne se passe comme le desktop laissait croire.

- **`naive` est une catastrophe : 28,9 s.** Vingt images en `eager` sans `loading`, qui se disputent réellement une bande passante bridée. Sous throttling simulé ce coût était sous-estimé ; sous throttling réel il explose. C'est le prix d'un seul défaut structurel — pas de lazy-load, pas de priorité — payé au comptant.
- **`pixel-perfect` n'est plus le plus léger : il est parmi les plus lourds (913 KB).** Contre-intuitif jusqu'à ce qu'on regarde le slot. En mobile 1 colonne, l'élément LCP est une image **pleine largeur** à DPR 1,75, pas une miniature. `pixel-perfect` dimensionne *honnêtement* ce grand slot ; le `sizes` générique d'`auto` le **sous-estime** (597 KB) et sert un fichier trop petit pour l'emplacement. Plus léger ne veut pas dire mieux dimensionné — `auto` gagne des octets en trichant sur la taille.
- **`cropped` gagne le LCP mobile (3547 ms).** Recadrer, c'est déplacer moins de pixels pour la même largeur de slot : le fichier est plus petit à cadrage utile égal. Sur un hero mobile pleine largeur, c'est le levier le plus direct sur le LCP.
- **`final ≈ pixel-perfect` (4514 vs 4494 ms, 0,4 %).** La pénalité de fondu de ~1,2 s du premier run a disparu : l'élément LCP above-fold « snappe » désormais au lieu de fondre (voir [Ne jamais animer l'élément LCP](#le-fondu-au-chargement) plus bas). Sans ce correctif, `final` et `lqip` mesuraient la durée d'une animation, pas une stratégie d'images.

### Desktop — le contraste

Émulation desktop (profil léger, ×1 CPU / 10 Mbps), même deploy, même méthode.

| Stratégie | Octets image (KB) | LCP méd. (min–max) ms |
| --- | --- | --- |
| naive | 9124 | 526 (506–533) |
| manual | 889 | 384 (369–395) |
| cropped | 785 | 352 (340–415) |
| lqip | 717 | 437 (403–524) |
| auto | 716 | 362 (362–395) |
| pixel-perfect | 222 | 326 (283–339) |
| final | 222 | 400 (384–407) |

Ici l'ancienne histoire tient. En grille 3 colonnes, le slot est une miniature de 316 px à DPR 1, et `pixel-perfect` sert *exactement* cette taille : 222 KB, le plus léger de loin, et le meilleur LCP (326 ms). `final` égale les octets (222 KB) et ajoute 74 ms pour la couche LQIP. `auto` transporte 3× plus d'octets (716 KB) pour la *même* transformation AVIF, juste parce que son `sizes` générique sur-fetch le petit slot.

### Ce que l'inversion dit vraiment

Le même `pixel-perfect` est **le plus léger sur desktop (222 KB) et parmi les plus lourds sur mobile (913 KB)** — sans changer une ligne de code. Le levier n'a jamais été « pixel-perfect gagne toujours » ; c'est **la taille du slot**. Quand le slot est petit (miniature desktop), le bon `sizes` économise énormément d'octets et `pixel-perfect` domine. Quand le slot est grand (hero mobile pleine largeur), dimensionner honnêtement *coûte* des octets, et le vrai levier LCP devient « déplacer moins de pixels » — donc le recadrage. `auto` ne paraît plus léger en mobile que parce qu'il sous-dimensionne : un gain d'octets au prix d'une image servie trop petite pour son slot.

Le classement en octets ne dépend ni du throttling ni du cache — c'est la mesure directe de la thèse `sizes`, et la seule colonne qui mérite le mot « classement ». Mais il n'est stable que dans sa **structure grossière** : `naive` explose seul, `manual` reste lourd (JPEG hors CDN), et les transformations CDN se regroupent bien en dessous. L'ordre *fin*, lui, s'inverse avec le slot — c'est tout le propos ci-dessus. En mobile (hero pleine largeur) : `pixel-perfect` ≈ `final` (913 KB) au-dessus de `auto` ≈ `lqip` ≈ `cropped` (~590 KB). En desktop (miniature 316 px), l'ordre bascule : `pixel-perfect` ≈ `final` passent les plus légers (222 KB), tandis que `cropped` (785 KB) remonte au-dessus de `auto` ≈ `lqip` (716 KB). Même code, deux classements — parce que « bien dimensionné » dépend du slot, pas de la stratégie.

Trois mises en garde pour que ces chiffres restent reproductibles :

- Les octets se comparent **au sein d'un mode seulement** — la marge de lazy-load diffère entre émulation mobile et desktop ; jamais de comparaison croisée mobile↔desktop sur cette colonne.
- `naive` et `manual` n'ont pas d'URL de transform CDN : leur `dpl` est trivialement uniforme (les noms de fichiers hachés rendent leur cache immunisé au deploy de toute façon).
- Tous les chiffres sont établis sur le jeu d'originaux réalistes committé, un seul deploy (même `dpl` sur les deux modes), un seul outil.

### Le déploiement compte moins que le `sizes`

*Cet écart hôte-contre-hôte a été mesuré lors d'une passe antérieure (jeu d'images picsum, run unique par hôte), pas dans le benchmark dual-mode ci-dessus — je le garde parce que la leçon qu'il porte ne dépend pas du dataset.*

Après avoir figé l'hôte pour classer les stratégies, faisons varier *seulement* l'hôte. J'ai relancé le même benchmark sur un build statique déposé sur un hébergement mutualisé OVH (`astro.jeromeabel.net`) — les fichiers y sont déjà produits par Sharp au moment du build — face à la transformation à la demande de Netlify. 

Au sujet de l'hébergement mutualisé (self-hosting), il est important de mentionner que le serveur Apache a été configuré de façon minimale pour supporter le cache et se rapprocher autant que possible des optimisations fournies automatiquement par Netlify.

Deux lignes suffisent pour poser un diagnostic :

| Stratégie | OVH LCP (ms) | OVH (KB) | Netlify LCP (ms) | Netlify (KB) |
| --- | --- | --- | --- | --- |
| naive | 1292 | 9158 | 615 | 9136 |
| auto | 414 | 373 | 412 | 729 |

Un **POP** (*Point of Presence*) est un nœud du réseau de diffusion proche géographiquement du visiteur : Netlify réplique le site sur des dizaines de POP à travers le monde et sert chacun depuis le plus proche, là où l'hébergement mutualisé OVH n'a qu'une seule origine.

Sur le payload brut (`naive`, ~9 MB, aucune transformation), seul le transport compte et l'edge Netlify (615 ms) bat l'origine unique OVH (1292 ms) d'un facteur deux — la proximité du POP domine. Sur les assets optimisés, c'est l'inverse : le Sharp build-time produit des fichiers ~2× plus petits que la transformation à la demande (`auto` 373 KB sur OVH contre 729 sur Netlify). Cela ne semble pas impacté le LCP, mais c'est tout de même à noter.

Donc, pour un cas plus probable où tout le monde fournira plusieurs tailles d'image, le déploiement ne semble pas être dans mon cas, un facteur critique. Le facteur le plus déterminant reste donc les valeurs `sizes`.

### Les différentes méthodes de mesure

*Ce tableau des régimes d'outils vient lui aussi de la passe antérieure ; les chiffres cités sont illustratifs, mais la mise en garde — trois outils, trois régimes jamais comparables en absolu — vaut pour n'importe quel dataset, y compris le benchmark dual-mode ci-dessus.*

Dernier piège : changez d'outil et le classement change sans que la page ne change.

| Outil | Où ça tourne | Throttle (défaut) | Cache |
| --- | --- | --- | --- |
| Lighthouse local (`netlify serve`) | ma machine | desktop : 40 ms RTT, 10 Mbps, CPU ×1 | froid |
| Lighthouse DevTools (site live) | ma machine | mobile Slow 4G : 150 ms, 1,6 Mbps, CPU ×4 | froid |
| PageSpeed Insights | serveurs Google | mobile Slow 4G + CPU ×4 | froid |

Trois pièges, confirmés par la doc Lighthouse :

- **Le throttling est simulé.** Lighthouse charge la page une fois sans bridage, puis *calcule* le temps qu'elle aurait pris dans les conditions cibles ([throttling.md](https://github.com/GoogleChrome/lighthouse/blob/main/docs/throttling.md)). Rapide et reproductible, mais c'est un modèle — pas un vrai réseau lent.
- **Chaque run part d'un cache vide** (`disableStorageReset` vaut `false` par défaut). La mesure est donc toujours froide, et la transformation CDN toujours payée.
- **Un seul run ne veut rien dire.** La doc le dit : « la médiane de 5 runs est deux fois plus stable qu'un seul run » ([variability.md](https://github.com/GoogleChrome/lighthouse/blob/main/docs/variability.md)). `final` sur Netlify affichait 2,3 s sur un run mobile isolé contre 0,8 s ailleurs — du bruit, rien d'autre.

Le mobile reste le révélateur : son CPU 4× plus lent que mon desktop expose le coût que vit un vrai téléphone et que ma machine masque. Mais tout cela reste du labo : ces pages de démo n'ont aucun visiteur, donc aucune donnée terrain pour trancher.

En pratique, à chaque outil son usage :

- **le benchmark scripté** (Lighthouse en médiane de 3 runs, preset desktop, CDN à chaud) : c'est lui qui a établi le classement des stratégies plus haut — ma seule mesure de référence ;
- **PageSpeed mobile** : pour *approcher le régime réellement livré*, mesuré sur l'infra de Google ;
- **Lighthouse DevTools sur le live** : un coup d'œil rapide en conditions mobiles, utile pour situer la page mais jamais un chiffre de référence.

## Reproduire un service d'images, une option à la fois

Tout ce qui précède, c'est le benchmark : quelle stratégie livre le moins d'octets, dans quel régime, mesurée comment. Reste la question du *comment le construire*. Un service dédié — Cloudinary, Imgix — vous vend une boîte noire qui fait tout à la fois. `CustomImage` fait la même chose à la main, une **option composable** à la fois, et chaque option se justifie par un chiffre du benchmark ci-dessus ou par une amélioration d'UX mesurable. Je les présente dans l'ordre où je les activerais sur une vraie galerie — le plus structurant d'abord.

## Hero eager, le reste lazy

Le premier levier, et c'est le point LCP de la [Partie 1](/blog/web-performance/01-tactics-cheatsheet) rendu concret. Astro met par défaut chaque image en `loading="lazy"`, ce qui est correct pour tout *sauf* l'image qui est l'élément LCP. Le composant prend donc un `type` : un hero `cover` se charge en eager et haute priorité, tout le reste reste lazy.

```astro
loading={type === "cover" ? "eager" : "lazy"}
fetchpriority={type === "cover" ? "high" : "auto"}
```

`fetchpriority="high"` dit au navigateur de récupérer le hero avant les images lazy plus bas. Ce sont deux attributs, et c'est la différence entre l'élément LCP qui arrive en premier ou qui attend dans la file derrière du contenu décoratif.

Pourquoi ce levier d'abord ? Parce que c'est le plus cher à rater. `naive` — vingt images en eager sans priorité ni lazy, qui se disputent réellement la bande passante — mesure **28,9 s de LCP en mobile** (contre 3,5–4,5 s pour toutes les autres). Ce n'est pas un problème d'octets par image ; c'est vingt requêtes lancées d'un coup sans qu'aucune ne soit priorisée. Le split eager/lazy est le seul levier de cette liste qui se compte en secondes, pas en dizaines de millisecondes.

Un piège que j'ai d'abord raté : ce split suppose qu'un hero `cover` existe sur la page. Les pages *grille* de stratégie n'en ont pas — chaque cellule est `type="thumb"`, donc les 21 miniatures partiraient en `loading="lazy" fetchpriority="auto"`, y compris la première rangée above-fold qui *contient* l'élément LCP. Lighthouse 13 le sanctionne (`lcp-discovery` à 0) : le LCP lui-même est en lazy. Le lazy natif ne promeut pas tout seul une image above-fold — c'est le travail de l'auteur.

La grille passe donc la position de chaque cellule au composant, qui en dérive les deux attributs séparément :

```astro
// Le viewport est inconnu au build (prérendu statique, pas de Client Hints à la
// 1re navigation) → EAGER_AHEAD est une constante pire-cas : 6 couvre le mobile
// 1-col (3 above-fold) et le md/lg 2–3-col (2 rangées = 6). Sur-eager au mobile
// coûte ~2 petites miniatures ; lazy-sur-LCP coûte le LCP. On biaise vers high.
const EAGER_AHEAD = 6;
const isAboveFold = (i?: number) => (i ?? Infinity) < EAGER_AHEAD; // index omis → below-fold

const isCover = type === "cover";
const isLCP = !isCover && index === 0;

// eager couvre toute la zone visible…
const loading = isCover || isAboveFold(index) ? "eager" : "lazy";
// …mais high est un scalpel : exactement un élément, le LCP. L'étaler sur toute
// la rangée dilue le signal et fait concurrence au vrai LCP pour la bande passante.
const fetchpriority = isCover || isLCP ? "high" : "auto";
```

Le point clé : `eager` couvre une zone (toute la rangée above-fold), `fetchpriority="high"` marque **un seul** élément. Et le seuil ne peut pas être dérivé du layout — la hauteur du viewport n'existe pas au build, donc `EAGER_AHEAD` est une constante pire-cas assumée, pas un calcul.

## Le placeholder : remplir le trou blanc

Le hero part vite ; il n'arrive pas pour autant instantanément. Sur une connexion lente, entre « la page est apparue » et « les images sont chargées » il peut s'écouler plusieurs secondes, et sans placeholder chaque slot est une boîte blanche vide — la page semble cassée. C'est de la performance *perçue* : Astro ne la génère pas, il faut l'écrire.

Il y a un dégradé d'options, du moins cher au plus soigné :

- **Rien / un slot coloré.** Réserver la place avec `width`/`height` (déjà gratuit, c'est ce qui tient le CLS à 0) et un fond de couleur unie ou un skeleton SVG. Zéro octet supplémentaire, mais le slot ne dit rien de l'image à venir.
- **Un vrai LQIP** — *low-quality image placeholder* : une miniature floue de la vraie image, qui donne tout de suite la couleur et la composition. C'est le seul composant personnalisé qui vaut encore la peine d'être écrit.

`getImage()` est la trappe de secours côté serveur pour le second. Je l'utilise pour rendre un minuscule placeholder, dimensionné au ratio d'aspect de la vraie image pour qu'il ne se déforme pas :

```ts
const aspectRatio = img.width / img.height;
const w = aspectRatio >= 1 ? 32 : Math.round(32 * aspectRatio);
const h = aspectRatio >= 1 ? Math.round(32 / aspectRatio) : 32;
const placeholder = await getImage({ src: img, format: "jpg", width: w, height: h });
```

Le placeholder se place derrière la vraie image, flouté ; le vrai `<Picture>` commence invisible. Les props du composant Astro vont vers le `<img>` interne, donc `pictureAttributes` est comment vous accédez à l'élément externe pour le démarrer caché :

```astro
<div class="reveal-img relative overflow-hidden">
  <img class="absolute -z-10 h-full blur-2xl" aria-hidden="true"
    src={placeholder.src} alt="" />
  <Picture src={img} formats={["avif", "webp"]} sizes={sizes} alt={alt}
    pictureAttributes={{ style: "opacity: 0" }} />
</div>
```

Deux façons de rendre le flou, deux compromis. Vous pouvez le **cuire dans le fichier** — le vieux `-blur 0x8` d'ImageMagick de l'ère manuelle — pour que les octets arrivent déjà doux et que le navigateur ne fasse aucun travail ; l'aspect est alors figé au build. Ou vous livrez une image nette de 32px et la **floutez en CSS** (`blur-2xl`, ou un `filter`) : un filtre GPU live, une couche de composition de plus, mais le rayon est une classe que vous ajustez sans relancer un script. Sur une image 32×32 le filtre est si bon marché qu'il ne se remarque pas, donc j'utilise la voie CSS — il n'y a rien à optimiser, et je préfère changer `blur-2xl` en `blur-xl` en un endroit. Sur un grand placeholder je le cuirais.

Le point important, c'est le **coût** : un placeholder LQIP est quasi gratuit sur les métriques. En mobile, `lqip` transfère 597 KB pour 3822 ms de LCP, contre 597 KB / 3794 ms pour `auto` sans placeholder — mêmes octets, 28 ms d'écart, du bruit. En desktop, `lqip` (717 KB) ajoute 75 ms à `auto` (716 KB) pour le décodage du placeholder, à octets d'image constants. Le chiffre Lighthouse bouge à peine ; ce que le placeholder achète, c'est un slot rempli au lieu d'un rectangle blanc pendant que le vrai fichier stream. C'est un axe différent de la performance, pas la même colonne.

## Le fondu au chargement

Le placeholder rempli, reste la transition placeholder → vraie image. Un fondu brut suffit, mais le détail qui compte — et le bug que tout le monde rencontre — c'est le **garde-cache** :

```ts
const showImage = () => {
  picture.style.opacity = "1";
  if (placeholder) placeholder.style.opacity = "0";
};
if (imgElement.complete) showImage();              // en cache → snap, pas d'animation
else {
  picture.style.transition = "opacity 1200ms ease";
  imgElement.addEventListener("load", showImage);  // réseau → fondu
}
```

Si vous animez sans condition, chaque navigation arrière/avant rejoue un fondu de 1,2 s sur des images que le navigateur a déjà, et la page scintille. Vérifier `img.complete` signifie que l'animation ne joue que sur un vrai chargement réseau. Je lance ça sur `astro:page-load` pour que ça survive aux View Transitions, où un listener `DOMContentLoaded` naïf ne se déclencherait qu'une fois et jamais plus.

Et une règle non négociable : **ne jamais animer l'élément LCP.** Un fondu, c'est un `element render delay` : le pixel est peint en opacité 0 puis monté en 1 sur 1,2 s, et Lighthouse date le LCP à la fin de l'animation, pas à l'arrivée des octets. Ma première version fondait le hero comme le reste ; `final` et `lqip` mesuraient alors la durée d'un fondu, pas une stratégie d'images. Le composant expose donc `ABOVE_FOLD_FADE = false` : au-dessus de la ligne de flottaison, l'image *snappe*, elle ne fond pas.

La preuve est dans les chiffres après correction. En mobile, `final` (4514 ms) et `pixel-perfect` (4494 ms) sont à 0,4 % — la pénalité de fondu de ~1,2 s du premier run a disparu, et le `element render delay` du run `final` retombe à **29 ms** (contre ~1236 ms avant). L'audit `lcp-discovery` de Lighthouse 13 confirme que l'élément LCP est bien la vraie première image (`Landscape photograph, sample 01`) sur les sept stratégies, jamais le placeholder. Le fondu embellit la *transition* du reste de la galerie ; il ne doit jamais toucher l'image qui fait le score.

J'ai écrit ce script deux fois, et les deux versions ne s'accordent pas sur les détails — ce qui est la partie utile :

| Aspect | Ce site | Un site de BD que je gère aussi |
|---|---|---|
| Placeholder | `<img>` flou 32px séparé derrière | aucun — le `<img>` réel se floute sur lui-même |
| Transition | opacité, 1200ms | opacité + `filter: blur(10px)→0`, 400ms |
| Garde-cache | `img.complete` | `img.complete && naturalHeight !== 0` (plus robuste) |

Le garde de la deuxième colonne est le meilleur : une image en cache mais cassée rapporte `complete: true` avec `naturalHeight: 0`, et seule la vérification plus stricte saute correctement le fondu. Même idée, apprise deux fois.

## Le contrat `sizes` : la taille juste

Jusqu'ici, above-fold, placeholder et fondu améliorent l'*expérience* sans presque toucher aux octets. Le levier sur les octets, c'est le contrat `sizes` — et c'est aussi le plus subtil, parce que le benchmark montre qu'il n'a pas toujours le signe qu'on croit.

Plutôt que de taper les breakpoints à la main, `CustomImage` calcule `sizes` depuis les tokens de mise en page réels — max-width de page, padding, gap, la grille — pour que la largeur de slot déclarée corresponde à ce que l'image occupe vraiment à l'écran :

```astro
const sizesAttr = [
  `(min-width: 768px) calc((min(100vw, ${pageMaxPx}px) - ${chromePx + gapPx}px) / 2)`,
  `calc(100vw - ${mobileChromePx}px)`,
].join(", ");
```

Les breakpoints écrits à la main dérivent dès que vous changez une marge ; un `sizes` dérivé des mêmes tokens qui pilotent la mise en page reste honnête, et le navigateur arrête de sur-fetcher pour un slot plus étroit que vous l'aviez estimé.

L'effet dépend entièrement de la **taille du slot**, et c'est là que le benchmark surprend. En desktop, l'élément LCP est une miniature de 316px dans la grille 3 colonnes : `pixel-perfect` sert *exactement* cette taille et transfère **222 KB**, contre **716 KB** pour `auto` — un facteur 3, pour la *même* transformation AVIF. Le `sizes` générique d'`auto` sur-fetche un `w=640` pour un slot de 316px. Ici, dimensionner juste est le plus gros gain d'octets de tout l'article.

En mobile, l'inversion. L'élément LCP est une image *pleine largeur* à DPR 1,75, pas une miniature : `pixel-perfect` dimensionne honnêtement ce grand slot et transfère **913 KB**, là où `auto` n'affiche que **597 KB** — mais parce qu'il *sous-dimensionne*, en servant un fichier trop petit pour l'emplacement. Plus léger ne veut pas dire mieux dimensionné. Le contrat `sizes` ne « gagne » pas toujours des octets ; il sert la *bonne* taille, et la bonne taille pèse plus cher quand le slot est grand.

Ce qui soulève la vraie question : pourquoi s'embêter, quand le `layout` auto d'Astro génère un `srcset` parfaitement raisonnable tout seul ? La réponse est le **contenu** de l'image, pas l'image en tant que concept.

Pour une photographie, pas besoin de précision pixel. Le navigateur choisit l'étape `srcset` la plus proche, la met à l'échelle de quelques pourcents, et ce scaling est invisible — un arbre flouté de 4 % ressemble à un arbre. Le `layout` auto est exactement le bon choix, et calculer les largeurs à la main serait un effort pour rien.

*Le concept de la preuve* est le cas inverse. Les images sont des pages de BD — art linéaire et lettrage. Si le fichier servi est même légèrement plus large ou plus étroit que le slot, le navigateur le rééchantillonne, et rééchantillonner du texte, c'est là que ça se voit : les contours s'adoucissent, les traits fins scintillent, le lettrage semble hors focus. Il n'y a pas de « suffisamment proche » pour un glyphe comme il y en a pour du feuillage. Ce site calcule donc les largeurs d'affichage exactes depuis sa mise en page et sert un fichier qui atterrit sur le slot sans scaling du tout. Le calcul supplémentaire achète du texte net, qui est tout l'intérêt de la page.

C'est la ligne manuelle-vs-automatique, et elle ne dépend pas de votre confiance dans le framework — elle dépend de ce qui est *dans* l'image. Photos, captures d'écran, banners hero : laissez `layout` faire. Texte, art linéaire, diagrammes, tout ce qu'un lecteur scrutera : calculez les largeurs pour que le navigateur n'ait jamais à rééchantillonner. Le playground compagnon rend ça concret avec un réseau de lignes : servez le fichier exactement à la largeur du slot et les barres se reproduisent proprement ; servez-le à une largeur légèrement différente et le réseau change de phase — vous obtenez du *moiré*, des bandes d'interférence qui signalent une inadéquation d'échantillonnage ([Wikipedia : Effet de moiré](https://en.wikipedia.org/wiki/Moir%C3%A9_pattern)). `pixel-perfect` l'élimine en servant un fichier qui atterrit sur le slot ; `auto` ne le fait pas, et les bandes sont visibles. L'effet est extrême sur un réseau réglé, mais la même physique gouverne tout contenu dur-et-périodique : traits de lettrage fins, hachures, pixel art.

[![/optimg/auto vs /optimg/pixel-perfect — même image de réseau au même viewport, bandes de moiré visibles sur auto, barres nettes sur pixel-perfect](./optimg-moire.png)](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug)
*Placeholder — en attente d'une vraie capture d'écran.* **Pour capturer :** ouvrir [`/optimg/auto?debug`](https://astro-jeromeabel.netlify.app/optimg/auto?debug) et [`/optimg/pixel-perfect?debug`](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug) côte à côte à un **viewport ≥1024px** (pour que la miniature lg 3-col soit exactement 316px) et se concentrer sur les photos à deux réseaux (`photo-16`, `photo-17`, `photo-18`). La bande grossière du haut est celle qui se lit à ce slot : sur `auto` le badge montre un fichier servi plus large (ex. `640w`) et les barres scintillent en moiré ; sur `pixel-perfect` il affiche `slot 316 · 316w · ✓ ok` et les barres restent nettes. Pour la bande fine, répéter la comparaison sur une page de détail (`…/auto/photo-16?debug` vs `…/pixel-perfect/photo-16?debug`), où la couverture 976px met le réseau fin dans sa zone optimale.*

## Le debug overlay : vérifier la taille

Comment savoir que le contrat `sizes` fonctionne vraiment — que le navigateur charge bien un fichier à la taille du slot, et pas un `srcset` optimiste ? Chaque route de stratégie accepte un paramètre `?debug` qui attache un badge par carte, montrant ce que le navigateur a réellement chargé par rapport à ce que le slot requérait :

[![/optimg/pixel-perfect?debug — cartes avec badges par carte montrant le slot, le DPR, la largeur servie et le verdict](./optimg-debug.png)](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug)
*Placeholder — en attente d'une vraie capture d'écran. **Capturer :** [`/optimg/pixel-perfect?debug`](https://astro-jeromeabel.netlify.app/optimg/pixel-perfect?debug) à ≥1024px pour que les cartes lg lisent `slot 316 · 316w · ✓ ok`. Cadrer les overlays à contours durs où le verdict compte — les photos moiré `e` (`photo-16/17/18`) et un overlay de texte `a`/`c` (`photo-01`, `photo-07`). Pour contraste, la même grille sur [`/optimg/naive?debug`](https://astro-jeromeabel.netlify.app/optimg/naive?debug) affiche le badge de sur-fetch.*

```
slot 316 · DPR 1 · 316w · ✓ ok
slot 316 · DPR 2 · 632w · ✓ ok
```

**slot** — largeur d'affichage CSS en pixels au viewport actuel. **DPR** — ratio de pixels de l'appareil. **largeur servie** — le paramètre `w` de l'URL CDN pour les stratégies avec `srcset`, ou la largeur naturelle de l'image pour `naive` et `manual`. **verdict** : `✓ ok` (le fichier couvre le slot à cette densité), `✗ short` (upscaling — vrai bug), `≫ over` (sur-fetch de plus de 25 %).

Pour `naive`, le badge montre la largeur source complète sans annotation `srcset` — le sur-fetch est explicite. Pour `pixel-perfect` et `final`, chaque carte devrait lire `✓ ok` à DPR 1× et 2× : les largeurs dérivées des tokens sont calculées pour faire atterrir le fichier sur le slot aux deux densités sans rééchantillonnage. C'est ainsi qu'on vérifie que pixel-perfect fonctionne — pas en lisant le `srcset`, mais en regardant ce que le navigateur a choisi à *votre* viewport et DPR.

L'overlay persiste sur la navigation grille → détail via `sessionStorage`, et un bouton flottant le supprime. Les runs Lighthouse ne sont jamais affectés — l'overlay requiert `?debug` dans l'URL ou un flag de session, ni l'un ni l'autre présent dans un run de navigateur vierge.

## La stack finale

`final` combine les quatre leviers : le split above-fold, le placeholder LQIP, le fondu exempté sur le LCP, et les largeurs pixel-perfect dérivées des tokens. Le composant empile simplement les options :

```astro
<div class="reveal-img relative overflow-hidden">
  <!-- placeholder flou 32px, au ratio d'aspect de la vraie image -->
  <img class="absolute inset-0 -z-10 h-full w-full object-cover blur-2xl"
    aria-hidden="true" src={placeholder} alt="" />

  <!-- <Picture> pixel-perfect -->
  <Picture
    src={image} layout="constrained"
    width={ppWidth} widths={ppWidths} sizes={ppSizes}
    height={finalHeight}
    pictureAttributes={{ style: "opacity:0" }}
    alt={alt} />
</div>
```

Résultat au benchmark : en desktop, `final` transfère **222 KB** — exactement les octets de `pixel-perfect` — pour 400 ms de LCP, soit 74 ms de plus que `pixel-perfect` seul (326 ms), le coût de la couche LQIP. En mobile, `final` (913 KB, 4514 ms) est à 0,4 % de `pixel-perfect` (4494 ms) : le placeholder et le fondu ne coûtent rien de mesurable une fois l'élément LCP exempté d'animation. On obtient la précision d'octets du sizing pixel-perfect *et* la performance perçue du LQIP, sans les additionner en pénalité.

Le recadrage par image reste disponible en option (`crop: true` par item dans `gallery.json` → couvertures 16:9, miniatures 4:3), mais il sort du cas standard « afficher une galerie le plus optimisée possible » : c'est un choix de cadrage, pas un levier de performance, et il est désactivé par défaut.

## Ce que j'ai appris

- Mesurez **mobile et desktop séparément** — l'histoire s'inverse entre les deux. Le même `pixel-perfect` est le plus léger en desktop (222 KB) et parmi les plus lourds en mobile (913 KB), sans changer une ligne. Sur un seul mode, le levier réel reste invisible.
- Le levier n'a jamais été le format ; c'est le **contrat `sizes`**, et son signe dépend de la taille du slot. Petit slot (miniature desktop) → dimensionner juste économise 3× les octets (222 vs 716 KB pour la même transformation AVIF). Grand slot (hero mobile pleine largeur) → dimensionner honnêtement *coûte* des octets, et `auto` ne paraît plus léger que parce qu'il sous-dimensionne.
- Le split eager/lazy est le levier le plus cher à rater : `naive` (vingt images eager sans priorité) mesure 28,9 s de LCP mobile. Et le lazy natif ne promeut pas une image above-fold tout seul — sur une grille sans hero, le LCP part en lazy (`lcp-discovery` à 0) tant que l'auteur ne le priorise pas.
- Placeholder et fondu sont de la **performance perçue, pas des octets**. `lqip` (597 KB) égale `auto` (597 KB) en mobile à 28 ms près ; en desktop il ajoute 75 ms pour zéro octet d'image. Ils ne déplaceront pas un score Lighthouse, et c'est très bien — c'est un autre axe.
- **N'animez jamais l'élément LCP.** Un fondu est un `element render delay` : Lighthouse date le LCP à la fin de l'animation. Avec l'exemption above-fold, `final` (4514 ms) rejoint `pixel-perfect` (4494 ms) à 0,4 % et le render delay retombe à 29 ms (contre ~1236 ms). Sans elle, on mesurait la durée d'un fondu.
- N'animez jamais **une image en cache** non plus. Gardez sur `img.complete` (ou `complete && naturalHeight !== 0`, plus robuste), sinon la navigation arrière/avant scintille.
- Manuelle vs automatique se décide par le **contenu** de l'image. Les photos tolèrent le stepping `srcset` — le `layout` auto convient. Texte et art linéaire se floutent quand ils sont rééchantillonnés, donc calculez les largeurs exactes ; un réseau périodique le rend visible en explosant en moiré.
- Le classement en octets est la **seule colonne déterministe** — insensible au throttling et au cache. Mais seule sa structure grossière est stable (`naive` seul en tête, `manual` lourd, transformations CDN groupées en dessous) ; l'ordre fin s'inverse avec le slot. Mobile : `pixel-perfect` ≈ `final` > `auto` ≈ `lqip` ≈ `cropped`. Desktop : ça bascule — `pixel-perfect` ≈ `final` les plus légers, `cropped` au-dessus de `auto` ≈ `lqip` (au sein d'un mode seulement ; jamais de comparaison croisée mobile↔desktop).
- Le `width`/`height` auto pour le CLS est le gain silencieux : CLS à 0 partout sauf `naive`. Les fichiers plus petits, c'est bien ; ne pas faire sauter la mise en page, c'est ce que l'utilisateur ressent.
- La localisation et l'hébergement déplacent le classement autant que la stratégie. Sur le payload brut (`naive`, ~9 MB), l'edge Netlify écrase l'origine unique OVH (615 vs 1292 ms) — la proximité du POP gagne. Sur les assets déjà optimisés, le Sharp build-time d'OVH sert des fichiers ~2× plus petits que la transformation à la demande (`auto` 373 vs 729 KB) et reprend l'avantage à chaud en local. Mesurez depuis là où sont vos utilisateurs.
- Trois outils, trois régimes. Le throttling Lighthouse est *simulé* et chaque run vide le cache, donc c'est toujours du froid. Le run scripté à chaud (médiane de 5, même deploy) compare les stratégies ; PageSpeed mobile approche le régime livré ; le Lighthouse DevTools sur le live n'est qu'un coup d'œil.
- La sortie n'est que des fichiers statiques. `astro:assets` fonctionne sur GitHub Pages sans service d'images — Netlify déplace juste le coût de transformation hors du build. Mêmes fichiers `/_astro/`, facture différente. Pour un site personnel, posséder ses assets dans le dépôt l'emporte sur un abonnement Cloudinary/Imgix.
- La couche cascade de Tailwind 4 perd face aux styles responsives d'Astro. Sachez lequel l'emporte avant de déboguer le mauvais fichier.
- Une source, deux recadrages : `fit="cover"` avec des `height` différentes produit des sorties séparées au build, sans serveur ni script — mais c'est un levier de cadrage, optionnel, hors du cas galerie standard.
