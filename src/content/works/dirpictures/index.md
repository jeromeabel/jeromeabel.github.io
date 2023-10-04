---
title: Dirpictures
date: 2016-05-31
img: ./screen.jpg
img_placeholder: ./small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: Dirpictures Plugin for DokuWiki. Show namespaces with small pictures
abstract: " Dirpictures Plugin for DokuWiki. Show namespaces with small pictures"
git: https://framagit.org/resonance/dirpictures/
website: https://www.dokuwiki.org/plugin:dirpictures
stack: 
- PHP
type: Web

---

https://reso-nance.org/wiki/projets/accueil


Description
This plugin is used to display pictures for all pages of a directory (aka. all subnamespaces of a namespace) and sort them by name or by date. If a picture is not added into the page (as a metadata) it takes a default picture.

It is also very small and good to hack and improve.

Edit
Examples
We use it to display projects made in the Fablab LFO.

By date : http://reso-nance.org/wiki/projets/archives

By name : http://reso-nance.org/wiki/projets/


## Usage
Choose one of these options and write it into a wiki page.

```
// Sort by name
~~DIRPICTURES~~

// Sort by date (ascendant)
~~DIRPICTURES sortByDate~~

// Sort by date (descendant)
~~DIRPICTURES sortByDate sortDesc~~
```