---
title: Chimères Orchestra
date: 2021-12-01
img: ./exhibition.jpg
img_placeholder: ./exhibition-small.jpg
img_preview: ./preview.jpg
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.jpg
description: As a software developer at Reso-nance Numérique, we built a system to control five or more robots. As a tribe, they tap on poles in the city to create sound rhythms.
abstract: As a software developer at Reso-nance Numérique, we built a system to control five or more robots. As a tribe, they tap on poles in the city to create sound rhythms.  
git: https://git.framasoft.org/resonance/chimeres-orchestra/
website: https://jeromeabel.net/workshop/chimeres-mutation-4/
video: https://vimeo.com/658636474
stack: 
- Pure Data
- Arduino
- Udoo
- OSC
type: Art, Robotic, Software
---

The project is maintained by [Reso-nance numérique](https://reso-nance.org/chimeres-orchestra/)

> An echo of human activites in primitive rhythms.

## The problem

- The robots could have 2 or more arms
- The number of robots could be 3 or more
- As a musical instrument, the rhythms must be synchronized
- Rhythms should be fast enough to have variety and loud enough to be heard
- The project could be exhibited outdoors during days

## The solution

- Secure motors
- Software to control and setup robots
- Mobile app to add a wireless remote

### 1. Secure the triggering of electric motors

To be heard, motors must have sufficient power. The first attempts damaged them and made them unusable! It took a while to find the solution, which involves securing the on/off time to allow the engine to not be turned on for a certain amount of time before it can be reactivated.

I've developped "PwmMotor", an Arduino library with these on/off methods:

```c++
// Motor Class to control PWM of DC motors
#include "PwmMotor.h"

// ...

void PwmMotor::on(unsigned long _current, int _pwm, int _time){
    if( _current - last >= (time_on + 10) ) {
        state = true;
        last = _current;
        time_on = constrain(_time, 0, time_on_max);
        if (debug) Serial.println("ON ");
        analogWrite(pin, _pwm);
    }
}

void PwmMotor::off(unsigned long _current) {
    if( _current - last >= time_on ) { 
        state = false;
        analogWrite(pin, 0);
        if (debug) Serial.println("OFF");
    }
}
```

### 2. Software to control and setup robots

Setup

autonmous

![Patch Pure Data Chimères Orchestra](./patch.png)



### 3. Wireless remote with a mobile app

PdDroidParty
![Patch Pure Data on mobile phone](./phone.png)


## Things I've learned

10years!

![Blueprints for building metal pieces and electronics box](./tech.jpg)
