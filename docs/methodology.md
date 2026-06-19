# Méthodologie

## Avertissement

Cette base de données ne prétend pas reconstituer minute par minute, ni même
jour par jour de façon certaine, les déplacements de Charles de Gaulle entre 1939
et 1945. Elle présente des **localisations attestées** ou **raisonnablement
inférées**, chacune assortie d'un **niveau de certitude** et d'une **source**.

La question à laquelle elle répond est : *où se trouvait, ou se trouvait
vraisemblablement, Charles de Gaulle à telle date, et sur quelle source repose
cette information ?*

## Deux natures d'entrées

1. **Événements** : un fait daté et localisé (discours, arrivée, cérémonie,
   réunion, opération). Exemple : l'Appel du 18 juin 1940 depuis la BBC.
2. **Périodes de base** : un lieu de résidence ou de base politique active sur une
   plage de dates (`event_type` = `government_base` ou `military_assignment` avec
   une `date_end`). Exemple : Londres de l'été 1940 à mai 1943, Alger de mai 1943
   à août 1944, Paris à partir d'août 1944.

## La couche quotidienne dérivée (`daily.json`)

Pour chaque jour entre le **1940-06-10** et le **1945-12-31**, le script
`build-data.ts` calcule une localisation présumée selon une priorité stricte :

1. **`attested`** — un événement attesté (`attested_precise`, `attested_range` ou
   `inferred_from_event`) localise De Gaulle ce jour-là. En cas de concurrence,
   l'entrée la plus précise (certitude la plus forte, puis durée la plus courte)
   l'emporte.
2. **`base_inferred`** — aucun événement ce jour-là, mais une période de base est
   active. La localisation est celle de la base ; la présence physique quotidienne
   n'est pas garantie. En cas de bases imbriquées, la période la plus courte (la
   plus spécifique) l'emporte.
3. **`source_gap`** — ni événement ni base : la présence n'est pas documentée
   (par exemple les traversées maritimes ou aériennes, ou certaines semaines de
   1941). Ces jours sont assumés comme des lacunes, non comblés artificiellement.

Aucune source n'est inventée et aucun trajet n'est extrapolé entre deux points
sans justification.

## Niveaux de certitude

| Niveau | Sens |
|---|---|
| `attested_precise` | Présence attestée à une date et un lieu précis. |
| `attested_range` | Présence attestée sur une plage de dates. |
| `base_inferred` | Base politique/administrative connue ; présence quotidienne non garantie. |
| `inferred_from_event` | Localisation déduite d'un discours, d'une réunion, d'une photo ou d'un document daté. |
| `uncertain` | Information intéressante mais à vérifier ; n'alimente pas la couche quotidienne. |

## Règle de validation d'un `attested_precise`

Une entrée n'est classée `attested_precise` que si au moins une source fiable
relie clairement quatre éléments : une **date**, un **lieu**, **Charles de Gaulle**
et un **événement ou une présence physique**. À défaut, l'entrée reste en
`attested_range`, `base_inferred`, `inferred_from_event` ou `uncertain`.

## Points de vigilance appliqués

- **Base politique ≠ présence physique.** Londres, Alger ou Paris sont des bases ;
  les jours correspondants sont marqués `base_inferred`, pas `attested`.
- **Frontières.** Les champs `country_1940` et `country_current` distinguent
  l'entité politique de l'époque (AEF, Levant sous mandat, etc.) et l'État actuel.
- **Pacifique.** Les territoires français du Pacifique se sont ralliés à la France
  libre en novembre 1940, mais aucun voyage personnel de De Gaulle dans le
  Pacifique n'est attesté pendant la guerre : l'entrée correspondante est
  `uncertain` et marque le territoire, non une présence.
- **Wikipédia** n'est utilisé que comme piste de départ, jamais comme source
  principale ; les entrées qui en dépendent sont marquées `reliability: low` et
  notées « à recouper ».

## Limites connues

- L'année **1941** comporte plusieurs `source_gap` : les séjours africains sont
  documentés, mais les déplacements au Caire et au Levant pendant l'été 1941 ne
  sont pas encore datés finement ici.
- Les **voyages** longue distance (mer, train transsoviétique) sont approximés par
  leur destination, avec une note explicite, ou laissés en `source_gap`.
- Le voyage aux **États-Unis d'août 1945** est conservé en `uncertain` faute de
  source datée précise dans ce premier jeu de données.
