# degaulle-map — Où était Charles de Gaulle ? (1940-1945)

Tenter de constituer un jeu de données **sourcé** des localisations de Charles de
Gaulle pendant la Seconde Guerre mondiale, avec une **évaluation honnête de
l'incertitude** : chaque entrée porte un niveau de certitude et une source, et les
périodes réellement inconnues sont signalées.

Site en ligne : <https://thepriben.github.io/degaulle-map/>

## Technique

Prérequis : Node.js 20+.

```bash
npm install        # dépendances

npm run data       # valide les CSV (data/) et régénère les JSON (public/data/)
npm run dev        # site en local (http://localhost:5173)
npm run build      # régénère les données puis construit le bundle (dist/)
npm run preview    # prévisualise le build
```

Les données s'éditent dans `data/*.csv` ; les JSON consommés par le site sont
produits dans `public/data/`. Détails du schéma et de la méthode dans
[docs/methodology.md](docs/methodology.md) et [docs/sources.md](docs/sources.md).

## Licence

- Code : MIT.
- Données et textes originaux : CC BY 4.0.
