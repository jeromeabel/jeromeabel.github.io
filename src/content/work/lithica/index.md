---
title: Lithica
date: 2021-06-11
img: ./lithica.jpg
img_placeholder: ./lithica-small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: For the Lazer Quest collective, I developed an interactive system. They need it for Lithica, a light sculpture
abstract: For the Lazer Quest collective, I developed an interactive system. They need it for Lithica, a light sculpture
git: https://framagit.org/lithica/lithica-tech
video: https://vimeo.com/872530669
stack:
  - Pure Data
  - Arduino
  - Python
type: Software
---

> LITHICA is an interactive sound sculpture. It is the instrument of a performance intended for deaf and hearing audiences.

A project created by [LazerQuest](https://lazerquestgalerie.tumblr.com/ABOUT), explained in this [video](https://tube.futuretic.fr/w/h2cFD2GSQbLCnhAPyyry46).

## The problem

- Performance mode: an artist must move with different movements around the sculpture to generate sounds
- Exhibition mode: the public must hear sound variations as it moves around the sculpture

## The solution

- A combination of three different capture techniques: Time Of Flight (ToF), Tracking Video, Ultrasound
- A mini-computer that retrieves this data and sends it via a LAN network
- Software to manage all incoming data and link it to sound generators

### Sensors

![Sensors](./sensors.png)

### Python & OpenCV

![Pymotion](./pymotion.jpg)

### Wiring

![Wiring](./wiring.png)

### Software

![Screen](./screen.png)

## What I Learned

- Experiment a dozen of different sensors
- JeVois Camera programming
- OpenCV with Python
