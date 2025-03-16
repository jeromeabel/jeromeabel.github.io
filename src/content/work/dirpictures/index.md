---
title: Dirpictures
date: 2016-05-31
img: ./screen.jpg
img_placeholder: ./small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: As a software developer at Reso-nance Numérique, I developed a PHP plugin for Dokuwiki allowing articles to be displayed in a grid of thumbnails
abstract: As a software developer at Reso-nance Numérique, I developed a PHP plugin for Dokuwiki allowing articles to be displayed in a grid of thumbnails
git: https://framagit.org/resonance/dirpictures/
website: https://www.dokuwiki.org/plugin:dirpictures
stack:
  - PHP
type: Web
---

## The problem

[Reso-nance Numérique](https://reso-nance.org) is an artistic collective from Marseille, co-creator of Fablab LFO. We used a wiki to document and share all projects, powered by Dokuwiki. But Dokuwiki was not able to display a list of articles in a user-friendly way, i.e. with small images.

## The solution

Based on the [nspages](https://www.dokuwiki.org/plugin:nspages) plugin, I've developed this new plugin.

It is used to display pictures for all pages of a directory (aka. all subnamespaces of a namespace) and sort them by name or by date. If a picture is not added into the page (as a metadata) it takes a default picture.

A live example: https://reso-nance.org/wiki/projets/accueil

Choose one of these options and write it into a wiki page.

```
// Sort by name
~~DIRPICTURES~~

// Sort by date (ascendant)
~~DIRPICTURES sortByDate~~

// Sort by date (descendant)
~~DIRPICTURES sortByDate sortDesc~~
```

## What I Learned

- Create a PHP plugin for Dokuwiki
