---
title: Logariat
date: 2019-11-23
img: ./screen.jpg
img_placeholder: ./small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: Logariat is an audiovisual performance on themes linked to digital technology and the body
abstract: "Develop a real-time application for an audiovisual performance on themes linked to digital technology and the body."
git: https://framagit.org/chateaucarbone/logariat
video: https://vimeo.com/345117719
stack:
- Node
- Socket IO
- P5JS
- Bash
- Arduino
- Pure Data
- Python
type: Art
---

Logariat is the desire to explore relationships:
- between computer work (automations, data) and the body (biological time, sitting position)
- between writing (of commands, programs, laws) and physical reality (signals).

A black human figure sits on an unpleasant chair. Bright lines outline its skeleton. A keyboard is placed in front, a light screen represents that of a computer. The only physical action is that he writes on a keyboard.

![Logariat Close-Up](./logariat-01.jpg)

The video projection is divided into three zones, a triptych of writing, body and images. The writing area is rather austere, in the form of a terminal or forms. The body is represented by real-time physical signals coming from sensors on the performer's body. The third zone leaves room for the generation of organic forms between camouflage, scar and artificial forms of physical modeling of trajectories, density, microscopic worlds, etc.

![Logariat storyboard](./screens.jpg)

## What I've learned

The challenge was to connect all these technologies together. All show monitoring is written in Bash and all sensors communicate to all open programs. Node is ultimately the heart of the program, it allows you to connect all the elements together, such as receiving data from biological sensors, the camera, the keyboard.

![Logariat storyboard](./tech.png)

