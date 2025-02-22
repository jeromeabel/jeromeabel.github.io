---
title: La Forme
date: 2022-05-29
img: ./screen.jpg
img_placeholder: ./small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: 'Develop a video tracking software for an audio-visual performance'
abstract: 'Develop a video tracking software for an audio-visual performance'
git: https://framagit.org/afa/la-forme-live
video: https://www.youtube.com/watch?v=10-1Zacngq8
website: https://jeromeabel.net/workshop/la-forme-neuss/
stack:
  - OpenFrameworks (C++)
  - Arduino
  - Pure Data
type: Art, Software
---

## The problem

- Track points in a dark room
- Real time
- Generate graphic shapes

## The solution

![La Forme Tracking](./tracking.jpg)

- Manage the lighting problem with white objects and controlled light additions
- Adjust lights and contrasts live with a mini serial controller
- Create a real-time application with the C++ OpenFrameworks framework
- Analyze camera pixels with the OpenCV library
- Send the data to the sound program written in Pure Data, via OSC.

## What I Learned

- Video tracking with OpenCV
- Video filters with OpenCV (so hard!)
- Noise generators with Pure Data

![La Forme Tech Setup](./tech.jpg)
