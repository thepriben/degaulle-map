# Sources

## Hiérarchie des sources

Les sources sont classées par fiabilité (`reliability`) dans
[`data/sources.csv`](../data/sources.csv) :

- **`high`** — institutions et travaux de référence : Fondation Charles de Gaulle,
  Archives nationales, Ordre de la Libération, ECPAD / ImagesDéfense, ministère
  des Armées, Assemblée nationale, ambassades, ainsi que des articles d'auteurs
  identifiés (Les clés du Moyen-Orient, IHEDN).
- **`medium`** — sites spécialisés ou de presse sérieux, à recouper si possible
  (Herodote.net, Milguerres, Le Québec et les guerres mondiales, archives du
  gaullisme, Lumni, Le Républicain Lorrain).
- **`low`** — encyclopédies collaboratives, utilisées seulement comme piste et
  toujours signalées « à recouper » (Wikipédia).

Règle : Wikipédia n'est **jamais** la source principale d'un `attested_precise`.

## Sources prioritaires de référence

1. **Fondation Charles de Gaulle** — chronologies, dossiers thématiques, textes
   et discours. <https://www.charles-de-gaulle.org/>
2. **Archives nationales / FranceArchives** — Appel du 18 juin, notices
   historiques. <https://www.archives-nationales.culture.gouv.fr/> ·
   <https://francearchives.gouv.fr/>
3. **ECPAD / ImagesDéfense** — photographies datées et métadonnées de lieux.
   <https://imagesdefense.gouv.fr/>
4. **Fondation de la France Libre** — textes politiques, manifeste de Brazzaville.
   <https://www.france-libre.net/>
5. **Ordre de la Libération** — dossiers pédagogiques et chronologies.
   <https://www.ordredelaliberation.fr/>

## Bibliographie imprimée (à intégrer pour affiner les dates)

- Charles de Gaulle, *Mémoires de guerre*.
- Charles de Gaulle, *Lettres, notes et carnets*.
- Jean Lacouture, *De Gaulle*.
- Éric Roussel, *Charles de Gaulle*.
- Julian Jackson, *De Gaulle*.
- ECPAD, *De Gaulle, géographies. 1940-1946* (ISBN 978-2-487175-03-7).

Ces ouvrages ne sont pas cités au niveau de la page ici (accès au texte intégral
non disponible) ; ils servent de cap pour vérifier et préciser les entrées
marquées « à recouper ».

## Registre des sources utilisées

Le détail (titre, auteur, éditeur, URL, type, fiabilité) figure dans
[`data/sources.csv`](../data/sources.csv). Chaque événement publié référence une
`source_id` de ce registre, avec une citation courte (`source_quote`) et, le cas
échéant, une `source_url`.
