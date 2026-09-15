# 🍽️ AYYOU Frontend — Application Mobile-First Angular 19

AYYOU est une plateforme web et mobile-first de livraison de repas et de découverte culinaire à Dakar (Sénégal), construite avec **Angular 19** (Standalone Components, SCSS, Reactive Forms, RxJS State Management).

---

## 🎨 Design System & Charte Visuelle

- **Couleur Primaire (Rouge AYYOU)** : `#E51A29`
- **Couleur Fond Principal** : `#FFFFFF`
- **Gris de Fond Global** : `#F8F9FA` / `#FAFAFA`
- **Textes Principaux** : `#1A1A1A` / `#1F2937`
- **Textes Secondaires** : `#757575` / `#9CA3AF`
- **Format Mobile-First** : Conteneur responsive de largeur maximale `440px`, centré sur grand écran.

---

## 📱 Écrans et Fonctionnalités Implémentés

### PHASE 1 — Authentification & Légal

#### 1. Onboarding (`/onboarding` & `/welcome`)
- **Route** : `/onboarding` (la route `/welcome` redirige vers `/onboarding`).
- **Animation** : Vidéo d'animation du logo `logoanimeayyou.mp4` avec détourage CSS transparent (`mix-blend-mode: multiply; filter: contrast(110%);`).
- **Contenu** : Slogan *"L'art de bien manger à Dakar"*.
- **Actions** : Bouton rouge *"Continuer →"* et lien *"Déjà un compte ? Se connecter"* (redirection vers `/login`).

#### 2. Connexion (`/login`)
- **Route** : `/login`
- **Formulaire** : Saisie d'identifiant (Email ou Numéro Mobile) et Mot de passe.
- **Google Auth** : Bouton *"Continuer avec Google"* vers `/google-auth`.
- **Footer Légal** : Liens directs vers *"Conditions Générales"* (`/terms`) et *"Politique de Confidentialité"* (`/privacy`).

#### 3. Inscription Client (`/register`)
- **Route** : `/register`
- **Champs** : Prénom, Nom, Téléphone international, Email, Mot de passe, Confirmation, Acceptation des CGU.
- **Sélecteur de Pays** : Drapeaux emoji, indicatifs internationaux (Sénégal `+221` en tête de liste) et barre de recherche intégrée.
- **Validations** : Validation de numéro international via `libphonenumber-js`, validation d'email stricte RFC, jauge de sécurité du mot de passe à 3 barres et coche verte `✓`.
- **Action** : Bouton *"Continuer &rarr;"* vers `/verify-sms`.

#### 4. Vérification SMS (`/verify-sms`)
- **Route** : `/verify-sms`
- **Saisie OTP** : FormArray 6 chiffres avec auto-focus, gestion du copier-coller (Paste), Backspace et filtrage pavé numérique mobile (`inputmode="numeric"`).
- **Code Mock de Test** : **`123456`** -> Redirection vers `/location`.

#### 5. Localisation (`/location`)
- **Route** : `/location`
- **Animation** : Radar concentrique animé avec marqueur Pin rouge.
- **GPS** : Intégration de `navigator.geolocation.getCurrentPosition()`, sauvegarde des coordonnées `user_lat` et `user_lng` dans `sessionStorage`.

#### 6. Authentification Google (`/google-auth`)
- **Route** : `/google-auth`
- **UI Figma** : Reproduction avec bandeau supérieur aux 4 couleurs Google, badge **🔒 SSL 256**, carte *"EXPÉRIENCE CULINAIRE DIRECTE"*.

#### 7. Pages Légales (`/terms` & `/privacy`)
- **CGU / CGV (`/terms`)** : Sommaire interactif et 18 articles réglementaires.
- **Politique de Confidentialité (`/privacy`)** : 15 articles conformes à la Loi sénégalaise n° 2008-12 et sous l'autorité de la CDP.

---

### PHASE 2 — Interfaces Principales Client

#### 8. Page d'Accueil Client (`/home`)
- **Route** : `/home`
- **Fil d'actualité culinaire (Feed)** : Cartes restaurants enrichies avec avatar du restaurant, badge vérifié, médias (images/vidéos gourmandes), compteurs d'interactions (Likes, Commentaires, Partages).
- **Tag d'Overlay Plat** : Tag flottant avec nom du plat, prix (ex. `4 500 FCFA`) et bouton d'action *"Commander 🛒"* (ajout instantané au panier et navigation).
- **Composants Flottants** : Bouton Assistant Chatbot AYYOU AI avec badge `1` et barre de navigation inférieure active.

#### 9. Fiche Établissement / Restaurant (`/restaurant/:id`)
- **Route** : `/restaurant/:id`
- **Header & Cover Hero** : Bannière de couverture haute définition, logo du restaurant en cercle surélevé, nom (*Chez Loutcha*), slogan (*Spécialités Sénégalaises & Africaines*) et localisation (*Plateau, Dakar*).
- **Statut & Actions Rapides** : Indicateur dynamique *🔴 Ouvert • Ferme à 23h30*, boutons *📞 Appeler* et *💬 Message*.
- **Carte "À propos de nous"** : Présentation authentique du restaurant.
- **Onglets** : Navigation entre *Menu* et *Vidéos (14)*.
- **Catégories & Plats** : Carrousel horizontal de filtres (*Plats Nationaux*, *Entrées*, *Boissons*) et cartes de plats (*Thiéboudienne Penda Mbaye*, *Yassa Poulet*, *Pastels au Poisson*) avec bouton `+` d'ajout au panier.

#### 10. Page Recherche (`/search`)
- **Route** : `/search`
- **Barre de Recherche** : Champ de recherche en temps réel avec icône de loupe et bouton de recherche vocale (Microphone 🎙️).
- **Carrousel de Catégories** : Filtres rapides sous forme de puces (*Viande*, *Burgers*, *Thiébou*, *Brunch*, *Desserts*).
- **Recherches Récentes** : Puces supprimables (*Burger gourmet*, *Thiébou diem rouge*, *Pâtisserie & Brunch*).
- **Résultats** : Liste filtrable des restaurants enregistrés (*Tous les restaurants (24)*).

#### 11. Page Panier (`/cart`)
- **Route** : `/cart`
- **Articles du Panier** : Liste réactive des plats commandés avec photo, nom, prix sous-total et contrôleurs de quantité réutilisables (`- 1 +`), ainsi que bouton corbeille 🗑️ pour suppression.
- **Recommandations** : Section carrousel *"VOUS POURRIEZ AUSSI AIMER"* avec cartes compactes de plats suggérés.
- **Détail des Frais** : Sous-total, Frais de livraison (fixés à `1 000 FCFA`), Total général calculé dynamiquement.
- **CTA Principal** : Bouton rouge *"Passer la commande 10 000 FCFA &rarr;"* orientant vers le paiement.

#### 12. Récapitulatif de Commande + Paiement (`/checkout`)
- **Route** : `/checkout`
- **Page Unique Déroulante** : Déroulement vertical continu réunissant :
  1. Résumé du restaurant de préparation (*Chez Loutcha*).
  2. Adresse de livraison présélectionnée (*Appartement L02, Résidence les Palmiers*) avec option de modification.
  3. Récapitulatif des articles commandés avec contrôleurs de quantité.
  4. Sélecteur de méthode de paiement (Wave & Orange Money) avec mise en avant dynamique par bordure rouge `#E51A29`.
  5. Détails du règlement (Sous-total, Frais de livraison `1 000 FCFA`, Total).
  6. Bouton fixe au bas de l'écran *"Payer 11 500 FCFA &rarr;"* déclenchant la modal de confirmation de paiement et la génération du numéro de commande `#AY-89421`.

---

## 🧩 Composants Réutilisables (`src/app/features/client/components/`)

- `AppHeaderComponent` : En-tête supérieur autonome avec logo rouge AYYOU, bouton retour optionnel et cloche de notifications avec badge.
- `AppBottomNavComponent` : Barre de navigation inférieure fixe à 4 onglets (*Accueil*, *Recherche*, *Panier*, *Profil*) gérant automatiquement la surbrillance active et le badge d'articles au panier.
- `ChatbotFloatingComponent` : Bouton circulaire rouge fixe en bas à droite avec badge `1` et popover interactif Assistant AYYOU AI.
- `RestaurantCardComponent` : Carte de présentation d'un restaurant avec couverture, statut d'ouverture, note moyenne et lien *"Voir profil >"*.
- `DishCardComponent` : Carte de présentation d'un plat (mode standard et mode compact).
- `QuantitySelectorComponent` : Contrôleur de quantité ergonomique `- 1 +`.

---

## 🛠️ Commandes de Développement

```bash
# Serveur de développement local
ng serve

# Compilation de production (Vérifié Exit Code 0)
npx ng build
```

---

## 🔌 Spécifications pour le Backend (Django REST Framework)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Inscription client, envoi OTP SMS. |
| `POST` | `/api/auth/verify-sms/` | Validation OTP 6 chiffres, génération tokens JWT. |
| `POST` | `/api/auth/login/` | Connexion classique email/téléphone + mot de passe. |
| `POST` | `/api/auth/google/` | Authentification Google via token JWT. |
| `GET` | `/api/feed/` | Fil d'actualité culinaire (restaurants, vidéos/photos, plats phares). |
| `GET` | `/api/restaurants/` | Liste des restaurants filtrés par recherche, catégorie ou géolocalisation. |
| `GET` | `/api/restaurants/<id>/` | Détails d'un restaurant, ses catégories, sa carte et ses vidéos. |
| `POST` | `/api/orders/` | Création d'une commande (plats, quantités, adresse de livraison, sous-total, livraison). |
| `POST` | `/api/payments/wave/init/` | Initialisation du paiement Wave API (checkout URL / QR code). |
| `POST` | `/api/payments/orange-money/init/` | Initialisation du paiement Orange Money Web Payment API. |

---

## 📂 Arborescence du Projet

```
src/app/
├── core/
│   ├── models/
│   │   ├── auth.ts
│   │   └── client.ts
│   └── services/
│       ├── auth.service.ts
│       ├── cart.service.ts
│       ├── client-data.service.ts
│       └── google-auth.service.ts
├── features/
│   ├── auth/ (onboarding, welcome, login, register, verify-sms, location, google-auth)
│   ├── client/
│   │   ├── components/ (app-header, app-bottom-nav, chatbot-floating, restaurant-card, dish-card, quantity-selector)
│   │   └── pages/ (home, restaurant-detail, search, cart, checkout)
│   └── legal/ (terms, privacy)
├── app.component.ts
├── app.config.ts
└── app.routes.ts
```
