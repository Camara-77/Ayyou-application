# Documentation de l'Intégration — Écran « PLANIFICATION » (Étape 2 Client)

## Context & Vue d'Ensemble
L'écran « PLANIFICATION » est l'étape 2 du parcours de planification Client AYYOU.
Il reproduit fidèlement la maquette visuelle `media_1790967670485.png` et s'appuie exclusivement sur les données réelles issues de l'API Django REST et de PostgreSQL (aucun mock ou donnée codée en dur).

Parcours utilisateur :
`Mon Planning` → `+ Planifier un repas` → `PLANIFICATION` (`/planning/create` ou `/planning/edit/:id`) → `Détails Repas`.

---

## 1. Architecture Frontend (`Ayyou-frontend`)

### Composants & Services
- **`PlanningCreateComponent`** (`src/app/features/client/pages/planning-create/`) :
  - `planning-create.component.ts` : Gestion du Stepper 3 étapes (`Choisir le plat`, `Restaurant`, `Horaire`), mode création / édition (`isEditMode`), sélecteur de plats dynamique, filtrage par catégories BDD, calcul automatique du total estimé, sélecteur de date avec prévisualisation formatée, compteur de portions, et soumission vers le backend.
  - `planning-create.component.html` : Reproduction au pixel près de la maquette (header avec bouton retour `/planning`, barre de recherche avec bouton vocal `#E51A29`, carrousel de catégories, carte plat sélectionné avec badge `ÉTAPES 1 VALIDÉE` & `Changer`, section `Où commander ce plat ?` avec cartes restaurants et indicateurs de sélection, bloc date de dégustation avec bouton `Modifier`, compteur de portions, et barre inférieure fixe de confirmation).
  - `planning-create.component.scss` : Charte graphique AYYOU (`#E51A29`, `#FFFFFF`, `#1A1A1A`, `#757575`, `#F8F9FA`), responsive mobile-first.

- **Services Réutilisés** :
  - `ClientDataService` : Récupération des catégories et des plats depuis la BDD (`/api/catalog/products/` & `/api/catalog/categories/`).
  - `PlanningService` : Création (`POST /api/orders/planning/`) et Modification (`PATCH /api/orders/planning/{id}/`).
  - `VoiceTranscriptionService` : Intégration de la recherche vocale par microphone.
  - `AuthService` : Vérification de l'authentification client avant confirmation.

---

## 2. Endpoints Backend Django REST (`Ayyou-backend`)

- **GET** `/api/catalog/categories/` : Liste dynamique des catégories.
- **GET** `/api/catalog/products/` : Recherche dynamique des plats avec filtre catégorie.
- **GET** `/api/catalog/establishments/` : Liste des établissements proposant le plat sélectionné.
- **POST** `/api/orders/planning/` : Création d'un repas planifié en PostgreSQL.
- **PATCH** `/api/orders/planning/{id}/` : Modification in-situ d'un repas planifié (même ID conservé).

---

## 3. Conformité avec les Exigences

1. **Données Réelles & Absence de Mock** :
   - Tous les plats (nom, image, prix base), établissements (nom, adresse, tarifs) et catégories proviennent des tables PostgreSQL.
2. **Recherche & Recherche Vocale** :
   - Champ de recherche réactif avec filtre API + bouton micro rouge connecté au service vocal.
3. **Stepper 3 Étapes** :
   - Indicateurs visuels dynamiques reflétant l'état du parcours (`1. Choisir le plat` → `2. Restaurant` → `3. Horaire`).
4. **Dates et Portions** :
   - Sélecteur de date avec reformatage en français (ex: *"Mardi 7 Octobre 2026"*).
   - Portions modifiables avec calcul du total estimé en temps réel (`prix unitaire × quantité`).
5. **Mode Édition (Remplacement direct)** :
   - En mode modification (`/planning/edit/:id`), le même ID de `RepasPlanifie` est mis à jour par `PATCH` sans duplication de ligne en BDD.

---

## 4. Résultats des Tests & Compilations

- **Build de Production Angular** : `npx ng build --configuration production` exécuté avec succès (`Output location: dist/ayyou`).
- **Git Status** : Pas de commit ni de push automatique. `git diff --check` vérifié et propre.
