---
title: Neptune Beer Club
date: 2023-12-11
img: ./screen.jpg
img_placeholder: ./small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: Find a bar in Brest, France
abstract: "A 4-day challenge for the web agency Lumy. I developed a web application to find bars in Brest 🍺, France. The criteria are based, among other things, on deployment, filtering system, and originality."
git: https://github.com/jeromeabel/neptunebeerclub
live: https://jeromeabel.github.io/neptunebeerclub/
stack:
  - Vite
  - React
  - TypeScript
  - Tailwind CSS
  - React Map GL
type: Challenge, Web
---

## The problem

- See a map of Brest with all bars
- See the list of bars
- View details
- Filter bars

## The solution

1. Single Page Application (SPA) with the React, Vite and Tailwind library.
2. Configuration: Vite, Vitest, Prettier, EsLint, TypeScript
3. File organization: Screaming architecture with a features/bar folder
4. Deployment: GitHub Actions

### Screaming architecture

I tried to implement these features:

- index.js as a public API
- camel-case
- features & colocation

```ansi
└── src/
    ├── assets/
    ├── features/
    │   ├── bars/
    │   │   ├── index.js (public API)
    │   │   ├── api/index.ts
    │   │   ├── bar-map/
    │   │   ├── bar-form/
    │   │   └── bar-list/
    │   │       ├── index.js (public API)
    │   │       ├── bar-item.component.js
    │   │       ├── bar-list.component.js
    │   │       ├── bar-list.context.js
    │   │       ├── bar-list.test.js
    │   │       └── use-bar-list.js
    │   ├── users/ (new features, not yet)
    │   │   ├── index.js
    │   │   ├── login/
    │   │   ├── signup/
    │   │   └── use-auth.js
    │   ├── ui/ (common, shared components)
    │   ├── index.js
    │   ├── components/
    │   ├── containers/ : header, footer, navbar, ...
    │   └── layouts/
    └── pages/
        └── home.tsx
```

### Public API (index.js)

```ts
export * from "./bar-list";
export * from "./bar-map";
export * from "./bar-filters";
export * from "./bar-context";
```

### Home.tsx

- The `<BarProvider />` is used to share data retrieved from the API
- The `<MapProvider />` is provided by React Map GL to allow actions on the map from other components. You can click a button in <BarList /> that sends a new position of the <BarMap />.

```tsx
import { Header } from "@containers/Header";
import { BarList, BarMap, BarFilters, BarProvider } from "@features/bar";
import { MapProvider } from "react-map-gl";

export const Home = () => {
  return (
    <BarProvider>
      <MapProvider>
        <div className="grid grid-cols-[1fr_2fr]">
          <div className="flex h-screen flex-col">
            <Header />
            <BarFilters />
            <BarList />
          </div>
          <div>
            <BarMap />
          </div>
        </div>
      </MapProvider>
    </BarProvider>
  );
};
```

### React Map GL

```tsx
<Map
  id="barmap"
  initialViewState={{
    longitude: -4.4852,
    latitude: 48.3891,
    zoom: 14,
  }}
  mapStyle="mapbox://styles/mapbox/dark-v9"
  mapboxAccessToken={MAPBOX_TOKEN}
  interactiveLayerIds={[clusterLayer.id as string]}
  ref={mapRef}
  onClick={onClick}
>
  {geojsonData ? (
    <Source
      id="brest-bars"
      type="geojson"
      data={geojsonData}
      cluster={true}
      clusterMaxZoom={14}
      clusterRadius={50}
    >
      <Layer {...clusterLayer} />
      <Layer {...clusterCountLayer} />
      <Layer {...unclusteredPointLayer} />
    </Source>
  ) : null}
  <BarMapMarkers bars={filteredBars} />
</Map>
```

## What I Learned

- Deployment with 2 GitHub Actions: testing and deployment
- Feature-based architecture with public API
- Using the map in React
- Overcome the difficulties of using the GeoJson format

## Future Plans For Fun

The goal is to develop the "Neptune Beer Club" application, giving a **charismatic and legendary identity** to bars in Brest.

1. **Enhanced User Interaction:** Implementing a search feature, providing directions, and enabling location sharing for a more interactive experience.
2. **Technical Optimization:** Utilizing API Directus for efficient data management, deploying with Docker, and incorporating animations for improved technical aspects.
3. **Creative Branding and Promotion:** Establishing a unique brand identity, promoting local bars and beers, and adding thematic elements for a creative touch.
4. **Innovative Features:** Exploring the integration of an AI bot, experimenting with 3D effects, and providing inclusivity information for a modern and innovative application.
5. **Diverse User Scenarios:** Offering users a choice between traditional (Couple, Brewer/Connoisseur, Friends, Business) and original scenarios involving a dog, a robot, or envisioning the future.
