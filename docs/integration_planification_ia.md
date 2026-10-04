# DOCUMENTATION — INTÉGRATION DE LA PLANIFICATION IA AYYOU

## 1. Vue d'ensemble

Le module de **Planification IA** (`/planning/ai`) permet aux utilisateurs clients d'AYYOU de programmer leurs repas futurs par **langage naturel** (saisie texte ou commande vocale).

L'architecture repose sur 3 principes stricts :
1. **Zero Hallucination** : L'IA comprend le langage naturel et extrait les intentions, mais **toutes les données de catalogue** (produit, établissement, prix, image, disponibilité) sont vérifiées et extraites directement depuis PostgreSQL via l'ORM Django.
2. **Transcription Vocale Réutilisée** : Utilisation du service centralisé `VoiceTranscriptionService` et du backend Whisper (`POST /api/ai/transcribe/`).
3. **Confirmation Explicite** : Le repas n'est enregistré en BDD PostgreSQL (`RepasPlanifie`) qu'après validation explicite de l'utilisateur sur le bouton « Confirmer la planification ».

---

## 2. Architecture & Endpoints API

### Backend Django / DRF

- `POST /api/ai/planning-parse/` (`AIPlanningParseView`)
  - **Fichier** : `apps/ai/views_planning_ai.py`
  - **Entrée** : `{ "prompt": "Je veux manger un bon Thiéboudienne mardi à 12h30 chez Chez Fatou, avec du piment à part." }`
  - **Traitement** :
    - Extraction NLP des entités (plat, établissement, date relative, heure, créneau, options).
    - Résolution de la date selon la timezone réelle de Dakar (`Africa/Dakar`).
    - Validation stricte contre `Produit` et `Etablissement` PostgreSQL.
  - **Sortie** : JSON structuré récapitulant les informations validées ou demandant une précision si nécessaire.

- `POST /api/orders/planning/` (`PlanningListCreateView`)
  - **Fichier** : `apps/orders/views_planning.py`
  - **Entrée** : `{ "produit": 1, "etablissement": 2, "date_planifiee": "2026-10-06", "creneau": "MIDI", "prix_total": 4500, "instructions": "Piment à part" }`
  - **Traitement** : Enregistrement de la ligne `RepasPlanifie` pour l'utilisateur authentifié.

---

## 3. Interfaces Frontend Angular 19

- **Service** : `PlanningAiService` (`src/app/core/services/planning-ai.service.ts`)
- **Composant** : `PlanningAiComponent` (`src/app/features/client/pages/planning-ai/`)
  - `planning-ai.component.ts`
  - `planning-ai.component.html`
  - `planning-ai.component.scss`
- **Route** : `/planning/ai` (protégée par `authGuard`).

---

## 4. Conformité à la Maquette Visuelle

L'interface reproduit exactement la maquette :
- Header AYYOU `← Planification IA` avec raccourcis Planning et Notification.
- Barre d'animation d'ondes audio « Écoute en temps réel... » lors des enregistrements vocaux.
- Bulle de dialogue rouge `#E51A29` Client.
- Carte réponse AYYOU Copilote avec badge étincelle `✦`.
- Carte `PLAT DÉTECTÉ` avec vignette produit, titre officiel et prix catalogue formaté.
- Cartes 2 colonnes `Restaurant` et `Date & Heure`.
- Bouton `Modifier les informations` (permet l'édition manuelle sans ré-enregistrement vocal).
- Information de rappel 30 min avant validation financière.
- Bouton rouge `Confirmer la planification`.
- Champ inférieur `Écrivez votre planning` avec déclencheur microphone rouge.

---

## 5. Tests et Validation

- **Tests unitaires Django** : 21/21 tests passés avec succès (`python manage.py test apps.ai apps.orders`).
- **Compilation Angular de production** : Exécutée avec succès (`npx ng build --configuration production`).
