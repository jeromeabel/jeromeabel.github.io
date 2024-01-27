---
title: Logariat
date: 2019-11-23
img: ./screen.jpg
img_placeholder: ./small2.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: Develop a real-time application for an audiovisual performance on themes linked to digital technology and the body.
abstract: 'Develop a real-time application for an audiovisual performance on themes linked to digital technology and the body.'
git: https://framagit.org/chateaucarbone/logariat
video: https://vimeo.com/345117719
website: https://jeromeabel.net/workshop/logariat/
stack:
  - Node
  - Socket IO
  - P5JS
  - Bash
  - Arduino
  - Pure Data
  - Python
type: Art, Web
---

Logariat is the desire to explore the relationships between computer work (automations, data), the body (biological time, sitting position) and different forms of writing (commands, programs, laws)

## The problem

- Real time interactions
- Generative graphics & sounds
- Get data from the body
- Get video from a mobile phonte

## The solution

![Logariat Tech Stack](./tech.png)

- Browser and Node as the heart of the program, it allows me to connect all the elements together, such as receiving data from biological sensors, the camera, the keyboard.
- P5JS for WebGL
- SocketIO for real time communications between the server and the client
- Serial communications between Node and Arduino
- OSC communications between Node, Pure Data an Python
- Pure Data for the sounds
- Python sends Keyboard Events to all softwares via OSC

![Logariat Storyboard](./screens.jpg)

## What I Learned

The challenge was to connect all these technologies together. All show monitoring is written in Bash and all sensors communicate to all open programs. Node is ultimately the heart of the program, it allows me to connect all the elements together, such as receiving data from biological sensors, the camera, the keyboard.
