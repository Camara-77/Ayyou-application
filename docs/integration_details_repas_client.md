# Documentation de l'Intégration de l'Écran « Détails Repas » (Client)

## Context & Vue d'Ensemble
L'écran « Détails Repas » est la 3ème étape majeure du module de planification Client de l'application AYYOU.
Il permet à l'utilisateur de consulter et d'interagir avec les informations détaillées d'un repas planifié depuis son calendrier.

URL d'accès : `/planning/detail/:id` (ou route alias `/planning/:id`).

---

## 1. Composants & Architecture Frontend

### Files Created & Updated
1. **Model & Interface** (`src/app/core/models/planning.ts`):
   - Type definitions pour `PlannedMeal`, `CreatePlanningPayload`, `UpdatePlanningPayload`, `PlanningMonthResponse`.

2. **Service** (`src/app/core/services/planning.service.ts`):
   - `getPlannedMeal(id: number)`: Récupération par GET HTTP `/api/orders/planning/${id}/`.
   - `updatePlannedMeal(id: number, data: Partial<UpdatePlanningPayload>)`: Mise à jour par PATCH HTTP `/api/orders/planning/${id}/`.
   - `cancelPlannedMeal(id: number)`: Annulation par DELETE HTTP `/api/orders/planning/${id}/`.

3. **Composant Page** (`src/app/features/client/pages/planning-detail/`):
   - `planning-detail.component.ts`: Gestion de l'état (LOADING, NOT_FOUND, SUCCESS, ERROR), modale d'annulation, rappels et formateurs de dates/prix.
   - `planning-detail.component.html`: Gabarit HTML conforme à la maquette de référence (`media_1790967730703.png`).
   - `planning-detail.component.scss`: Feuilles de styles responsive, respectant la charte graphique AYYOU (`#E51A29`, cartes arrondies, typographie épurée).

4. **Routes** (`src/app/app.routes.ts`):
   - Enregistrement des routes protégées par `authGuard` : `/planning/detail/:id` et `/planning/:id`.

5. **Navigation Mon Planning** (`src/app/features/client/pages/planning/planning.component.ts`):
   - Clic sur "Détail" d'un repas du jour redirige vers `/planning/detail/${meal.id}`.

---

## 2. API Backend & Contrat de Données Django REST Framework

L'API Backend repose sur la vue `PlanningDetailView` dans `apps/orders/views_planning.py`:
- `GET /api/orders/planning/{id}/` : retourne l'objet `PlannedMeal` filtré par l'utilisateur connecté (`utilisateur=request.user`).
- `PATCH /api/orders/planning/{id}/` : met à jour le statut, le créneau, les instructions ou la date.
- `DELETE /api/orders/planning/{id}/` : passe le statut à `ANNULE` et enregistre l'historique d'annulation.

---

## 3. Conformité avec la Maquette Visuelle

- **En-tête AYYOU** : Logo / Titre "Détails Repas", bouton Retour vers `/planning`, icône Planning.
- **Carte Rappel AYYOU** (`AYYOU • RAPPEL REPAS`) :
  - En-tête avec badge marque rouge et temps relatif ("Il y a 2 min").
  - Message dynamique : "C'est l'heure de votre repas 🍲" avec le nom du plat et le restaurant.
  - Bouton `Valider` (Fond rouge `#E51A29`) et `Plus tard` (Fond gris `#F0F0F0`).
- **Carte Héro Plat** :
  - Badge supérieur translucide avec point vert de statut ("● Statut : À valider (Rappel 30 min)").
  - Image du plat avec dégradé overlay sombre en bas.
  - Localisation du restaurant avec icône pin carte.
  - Nom du plat et badge prix rouge (`#E51A29`).
- **Carte Date & Statut** :
  - Icône calendrier rouge, date en français (ex: "Mardi 15 Octobre 2026").
  - Badge statut gris / rouge ("À VALIDER", "CONFIRMÉ", "LIVRÉ", "ANNULÉ").
- **Grille 2 Colonnes Informations** :
  - Box 1 : `⚡ Commande auto` (Heure de déclenchement auto, ex: `12h30`).
  - Box 2 : `⏲ Livraison estimée` (Heure estimée de livraison, ex: `13h00`).
- **Actions** :
  - Bouton `📅 Modifier créneau` : Redirige vers `/planning/create` prérempli ou modale de modification.
  - Bouton `⊗ Annuler le repas` : Ouvre la modale de confirmation d'annulation avec appel DELETE HTTP.

---

## 4. Vérification & Quality Check

1. **Compilations Angular** : `npx ng build --configuration production` (Code 0, 0 erreurs TypeScript).
2. **Standard de Code** : Aucune donnée fictive (mock data), intégration dynamique complète avec PostgreSQL & Django REST.
