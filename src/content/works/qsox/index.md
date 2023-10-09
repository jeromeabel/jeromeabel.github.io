---
title: QSox
date: 2015-03-02
img: ./screens.png
img_placeholder: ./screens-small.jpg
img_preview: ./preview.png
img_preview_placeholder: ./preview-small.jpg
img_social: ./social.png
description: QSox is an open source digital multiplateform audio editor, free of charges. It posesses a graphic interface and it is directed towards the batch processing of digital audio files.
abstract: QSox is an open source digital multiplateform audio editor, free of charges. It posesses a graphic interface and it is directed towards the batch processing of digital audio files.
git: https://sourceforge.net/projects/qsox/
video: https://vimeo.com/872515089
stack: 
- Pure Data
- Arduino
- Bash
type: Multimedia Framework
---

a batch-oriented frontend for SoX with Qt.
https://cicm.univ-paris8.fr/index.html


QSox is an open source digital multiplateform audio editor, free of charges. It posesses a graphic interface and it is directed towards the batch processing of digital audio files.


Sox is an open source digital multiplateform audio editor, free of charges. It posesses a graphic interface and it is directed towards the batch processing of digital audio files made for the CICM Research Center.

CICM (Centre de recherche Informatique et Création Musicale) 
Authors: Jérôme Abel (lead developer), Julien Bréval (SoX commands and UI design), Julien Colafrancesco (contributor), Benoît Courribet (user expert)


QSox : un éditeur audio libre, multiplateforme et adapté au traitement par lots


Un éditeur audionumérique est un logiciel permettant d’effectuer des traitements numériques du signal sur des fichiers audio. QSox se démarque des éditeurs audio les plus connus2 par les points suivants :

QSox a été développé dans l’optique de fournir un logiciel très simple et rapide d’utilisation, sans visualisation des données audionumériques (pas de représentation graphique de la forme d’onde ni du spectre fréquentiel)

QSox a été prévu pour être utilisé dans le cas de traitements par lots de fichiers.


Grâce à une interface graphique simple, QSox permet de choisir un ou plusieurs fichiers audio, puis une chaîne de traitements audionumériques à appliquer à ces fichiers. On peut écouter le rendu des traitements en temps réel, afin de vérifier que la chaîne de traitements est correcte. Une fois ces opérations effectuées, la chaîne de traitements est appliquée à chacun des fichiers (l’un après l’autre).

7QSox est utilisable immédiatement une fois qu’il a été téléchargé : il ne nécessite aucune installation ni redémarrage, et ne demande pas de télécharger ni de lancer SoX au préalable. Il n’y a qu’un seul fichier à télécharger : il s’agit d’une archive comprenant tous les fichiers nécessaires ; ces fichiers doivent simplement se trouver dans un même répertoire, qui peut être placé n’importe où.


QSox a été développé dans le cadre du projet HD3D-IIO6. En tant que partenaire académique de ce projet, le CICM7 a travaillé sur divers aspects liés aux usages dans les métiers du son dans l’audiovisuel et notamment sur la conception puis le développement d’un éditeur audio adapté au métier de servicing8 de film.

Une version libre et multiplateforme de cet éditeur a été ensuite développée en utilisant l’environnement de développement Qt. Comme SoX a été choisi comme moteur de traitements audionumériques, cette version a été nommée Hsox (« SoX pour HD3D »).

3. 3. Vers une version plus générique
27Dans le but d’étendre la communauté des utilisateurs potentiels au-delà du domaine du servicing de film, nous avons décidé d’étendre les fonctionnalités de Hsox aux opérations audionumériques utilitaires les plus courantes, tout en conservant l’architecture générale de Hsox, mais en repensant son interface graphique.

28Cette version générique a été appelée QSox car elle est toujours basée sur SoX et Qt.


Dans le contexte du logiciel libre, il est dommage de redévelopper des traitements génériques existant déjà. C’est pourquoi nous avons choisi de ne pas développer notre propre moteur de traitements audionumériques. Si nous avions eu besoin de traitements audionumériques spécifiques ou nouveaux, au contraire il aurait fallu développer notre propre moteur de traitements (ou intégrer ces traitements à un moteur existant).

30Ainsi, QSox est principalement une interface graphique développée en C++10 avec l’environnement de développement Qt. Cette interface génère des lignes de commande envoyées au logiciel SoX, qui est utilisé comme moteur de traitements audionumériques. À ce titre, on peut dire que QSox est une front end11 pour SoX. Lorsqu’on utilise QSox, SoX est en cours d’exécution également mais n’est pas visible sur l’écran.

31Il est important de noter que QSox n’est pas une interface graphique exhaustive, universelle et multi-paradigme12 pour SoX, mais une interface particulière tournée surtout vers le paradigme du traitement par lots.


Il est certes possible de faire du traitement par lots avec SoX en utilisant des scripts de lignes de commande. Cependant, la syntaxe n’est pas aisée pour un utilisateur final habitué aux interfaces graphiques. De plus, la rédaction du script peut prendre beaucoup de temps.

39D’où l’idée d’intégrer directement le concept de traitement par lots à l’interface graphique de l’éditeur audio, afin de gagner en simplicité et en rapidité d’utilisation.


https://revues.mshparisnord.fr/rfim/index.php?id=145

QSox est un projet auquel ont participé des stagiaires, doctorants et chercheurs du CICM :
Jérôme Abel – responsable du développement ; conception
Julien Bréval – responsable de la conception ; lignes de commande de SoX pour QSox
Julien Colafrancesco – développement
Benoît Courribet – participation à la conception, expérience utilisateur
Guilherme Carvalho – participation à la conception
Anne Sedès – coordination du projet au sein du CICM et avec HD3D ; validation des choix de conception et de développement




Research centre: CICM (Centre de recherche Informatique et Création Musicale) - http://cicm.mshparisnord.org/


	QSox_rfim.pdf

## Limitations
Now, QSox works on Win XP and GNU/Linux. For Mac, you could download XCode and Qt and compile the source code.
QSox doesn't support mp3 like SoX.

2010-2015

## Architecture
- User Interface (Qt, C++): manage user interactions and views; call SoX program; files.
- SoX: this is a cross-platform command line utility that can convert various formats of computer audio files in to other formats (see http://sox.sourceforge.net/).

