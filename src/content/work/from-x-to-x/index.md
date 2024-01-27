---
title: From X / To X
date: 2019-03-02
img: ./cover.jpg
img_placeholder: ./cover-small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: For this art project, I developed wireless communication between two devices 1 km apart via a website
abstract: For this art project, I developed wireless communication between two devices 1 km apart via a website
git: https://framagit.org/chateaucarbone/fromxtox
video: https://vimeo.com/329901237
website: https://jeromeabel.net/workshop/fromx-tox/
stack:
  - Arduino
  - PHP
  - Bash
type: Art, Web
---

The artistic installation is present in two different rooms: “From X” and “To X”. The first room features a laboratory, where a microscope projects images of a microscopic form. The microscope is controllable with a joystick. The latter's movements are sent to another room, which stages a robotic landscape of sand projection on cathode ray screens.

## The problem

- Send data between two devices 1 km apart

## The solution

![web](./web.jpg)

1. A computer sends a file with `curl` command
2. On a website, a PHP script handles the file upload
3. An Arduino program for the ESP8266 chip requests this file from the server and extract data

## What I Learned

- Simplify the idea! No real-time or two-way communication
- PHP script to secure incoming file
- ESP8266 program to get data from the web
