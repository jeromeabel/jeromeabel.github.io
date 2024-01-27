---
title: QSox
date: 2015-03-02
img: ./screens.png
img_placeholder: ./screens-small.jpg
img_preview: ./preview.png
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.png
description: As a software developer for the CICM Research Center, I developed QSox, an open source cross-platform digital audio editor. It has a graphical interface and is geared towards batch processing of digital audio files.
abstract: As a software developer for the CICM Research Center, I developed QSox, an open source cross-platform digital audio editor. It has a graphical interface and is geared towards batch processing of digital audio files.
git: https://sourceforge.net/projects/qsox/
website: https://revues.mshparisnord.fr/rfim/index.php?id=145
video: https://vimeo.com/872515089
stack:
  - Pure Data
  - Arduino
  - Bash
type: Software
---

QSox was developed as part of the HD3D-IIO project. As an academic partner of this project, the [CICM](https://cicm.univ-paris8.fr/index.html) worked on various aspects linked to uses in the audiovisual professions and in particular on the design then development of an audio editor adapted to the film servicing profession.

Authors: Jérôme Abel (lead developer), Julien Bréval (SoX commands and UI design), Julien Colafrancesco (contributor), Benoît Courribet (user expert)

## The problem

It is possible to do batch processing with [SoX](http://sox.sourceforge.net/) using command line scripts. However, the syntax is not easy for an end user accustomed to graphical interfaces. Additionally, writing the script can take a long time.

## The solution

- Build a desktop cross-platform with Qt/C++ & Qtcreator
- User friendly interface
- Use SoX under the hood as the sound engine

**Limitations**

- QSox works on Win XP and GNU/Linux
- It doesn't support mp3 like SoX.

## What I Learned

- C++ with Qt
- Working with engineers
