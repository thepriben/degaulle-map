# degaulle-map — Où était Charles de Gaulle ? (1940-1945)

Jeu de données **sourcé** des localisations attestées ou raisonnablement inférées
de Charles de Gaulle pendant la Seconde Guerre mondiale, accompagné d'un pipeline
de construction CSV → JSON. Une couche de visualisation cartographique pourra être
ajoutée par-dessus ces données.

> **Avertissement méthodologique.** Cette base ne prétend pas reconstituer minute
> par minute les déplacements de Charles de Gaulle. Elle présente des localisations
> **attestées** ou **raisonnablement inférées**, chacune assortie d'un **niveau de
> certitude** et d'une **source**. Les jours sans événement attesté héritent de la
> base politique active (certitude `base_inferred`) ; les périodes réellement
> inconnues sont marquées `source_gap`. Aucune source n'est inventée.

## Ce que contient le dépôt (phase « données d'abord »)

```text
degaulle-map/
  data/                 # sources d'édition humaine (CSV)
    events.csv
    places.csv
    sources.csv
  scripts/
    types.ts            # types TypeScript stricts (schéma)
    csv.ts              # lecteur CSV sans dépendance
    validate-data.ts    # validation + rapport de continuité quotidienne
    build-data.ts       # CSV -> JSON + couche quotidienne dérivée
  public/data/          # JSON générés (ne pas éditer à la main)
    events.json
    places.json
    sources.json
    daily.json          # localisation présumée jour par jour
    manifest.json
  docs/
    methodology.md
    sources.md
```

## Installation

```bash
npm install
```

## Construire les données

```bash
npm run validate:data   # vérifie les CSV, signale erreurs et lacunes
npm run build:data      # génère les JSON dans public/data/
npm run data            # enchaîne validation puis build
```

## Modèle de données

### `events.csv`

```text
id,date_start,date_end,title,summary,place_id,lat,lng,country_1940,country_current,event_type,certainty,source_id,source_url,source_quote,notes,tags
```

| Champ | Type | Description |
|---|---|---|
| `id` | string | Identifiant stable, ex. `1940-06-18-london-bbc` |
| `date_start` | ISO date | `YYYY-MM-DD` |
| `date_end` | ISO date \| vide | Date de fin si période, sinon vide |
| `title` | string | Titre court |
| `summary` | string | Résumé de 1 à 3 phrases |
| `place_id` | string | Référence vers `places.csv` |
| `lat` / `lng` | number | Coordonnées WGS84 |
| `country_1940` | string | Entité politique à l'époque |
| `country_current` | string | Pays actuel |
| `event_type` | enum | Type d'événement |
| `certainty` | enum | Niveau de certitude |
| `source_id` | string | Référence vers `sources.csv` |
| `source_url` | URL | URL publique si disponible |
| `source_quote` | string | Citation courte ou paraphrase sourcée |
| `notes` | string | Notes de travail |
| `tags` | string | Tags séparés par `;` |

Les **périodes de base** (lieu de résidence/base politique active) sont des
événements dont `event_type` vaut `government_base` ou `military_assignment` et
qui portent une `date_end`. Elles servent à dériver la localisation présumée des
jours sans événement attesté.

### `places.csv`

```text
place_id,name,name_1940,lat,lng,country_current,country_1940,description,wikidata_id,geonames_id
```

### `sources.csv`

```text
source_id,title,author,publisher,date,url,source_type,reliability,notes
```

### Couche quotidienne dérivée (`daily.json`)

Pour chaque jour entre le 1940-06-10 et le 1945-12-31, `build-data.ts` calcule :

- `basis: "attested"` — un événement attesté localise De Gaulle ce jour-là ;
- `basis: "base_inferred"` — pas d'événement, mais une période de base est active ;
- `basis: "source_gap"` — ni l'un ni l'autre (présence non documentée).

## Niveaux de certitude

- `attested_precise` — présence attestée à une date et un lieu précis.
- `attested_range` — présence attestée sur une plage de dates.
- `base_inferred` — base politique/administrative connue, présence quotidienne non garantie.
- `inferred_from_event` — déduite d'un discours, d'une réunion, d'une photo ou d'un document daté.
- `uncertain` — information à vérifier.

## Types d'événements

`military_assignment`, `battle_or_operation`, `speech`, `radio_broadcast`,
`political_meeting`, `diplomatic_visit`, `government_base`, `travel`, `ceremony`,
`return_to_france`, `liberation_event`, `source_gap`.

## Contribuer aux données

1. Éditez uniquement les fichiers de `data/*.csv`.
2. Ajoutez la source dans `sources.csv` et le lieu dans `places.csv` si nécessaire.
3. Renseignez `certainty` honnêtement ; ne passez en `attested_precise` que si une
   source fiable relie clairement **date + lieu + De Gaulle + présence/événement**.
4. Lancez `npm run data` et corrigez les erreurs signalées.

## Politique de sources

Sources principales : Fondation Charles de Gaulle, FranceArchives / Archives
nationales, Fondation de la France Libre, ECPAD (*De Gaulle, géographies 1940-1946*),
et travaux universitaires spécialisés. Wikipédia n'est utilisé que comme piste de
départ, jamais comme source principale. Voir [docs/sources.md](docs/sources.md) et
[docs/methodology.md](docs/methodology.md).

## Licence

- Code : MIT.
- Données et textes éditoriaux originaux : CC BY 4.0.
- Images : ne pas republier sans vérifier les droits ; préférer les liens vers les
  institutions détentrices.
