# 🍽️ AYYOU Frontend — Application Mobile-First Angular 19

AYYOU est une plateforme web et mobile-first de livraison de repas et de découverte culinaire à Dakar (Sénégal), construite avec **Angular 19** (Standalone Components, SCSS, Reactive Forms, `libphonenumber-js`).

---

## 🎨 Design System & Charte Visuelle

- **Couleur Primaire (Rouge AYYOU)** : `#E51A29`
- **Couleur Fond Principal** : `#FFFFFF`
- **Gris de Fond Global** : `#FAFAFA`
- **Textes Principaux** : `#1A1A1A` / `#1F2937`
- **Textes Secondaires** : `#757575` / `#9CA3AF`
- **Format Mobile-First** : Conteneur responsive de largeur maximale `440px`, centré sur grand écran.

---

## 📱 Écrans et Fonctionnalités Implémentés

### 1. Onboarding (`/onboarding` & `/welcome`)
- **Route** : `/onboarding` (la route `/welcome` redirige vers `/onboarding`).
- **Animation** : Vidéo d'animation du logo `logoanimeayyou.mp4` avec détourage CSS transparent (`mix-blend-mode: multiply; filter: contrast(110%);`).
- **Contenu** : Slogan *"L'art de bien manger à Dakar"*.
- **Actions** : Bouton rouge *"Continuer →"* et lien *"Déjà un compte ? Se connecter"* (redirection vers `/login`).

### 2. Connexion (`/login`)
- **Route** : `/login`
- **Formulaire** : Saisie d'identifiant (Email ou Numéro Mobile) et Mot de passe.
- **Google Auth** : Bouton *"Continuer avec Google"* vers `/google-auth`.
- **Footer Légal** : Liens directs vers *"Conditions Générales"* (`/terms`) et *"Politique de Confidentialité"* (`/privacy`).

### 3. Inscription Client (`/register`)
- **Route** : `/register`
- **Champs** : Prénom, Nom, Téléphone international, Email, Mot de passe, Confirmation, Acceptation des CGU.
- **Sélecteur de Pays** : Drapeaux emoji, indicatifs internationaux (Sénégal `+221` en tête de liste) et barre de recherche intégrée.
- **Validations** : Validation de numéro international via `libphonenumber-js`, validation d'email stricte RFC, jauge de sécurité du mot de passe à 3 barres (Faible, Moyen, Robuste) et coche verte `✓` de confirmation de mot de passe.
- **Action** : Bouton *"Continuer &rarr;"* vers `/verify-sms`.

### 4. Vérification SMS (`/verify-sms`)
- **Route** : `/verify-sms`
- **Saisie OTP** : FormArray 6 chiffres avec auto-focus, gestion du copier-coller (Paste), Backspace et filtrage pavé numérique mobile (`inputmode="numeric"`).
- **Temporisateur** : Compte à rebours de 47-48s avec option de renvoi.
- **Code Mock de Test** : **`123456`** -> Redirection vers `/location`.

### 5. Localisation (`/location`)
- **Route** : `/location`
- **Animation** : Radar concentrique animé avec marqueur Pin rouge.
- **GPS** : Intégration de `navigator.geolocation.getCurrentPosition()`, sauvegarde des coordonnées `user_lat` et `user_lng` dans `sessionStorage`.
- **Cartes Produit** : 3 cartes (Restaurants à proximité, Temps de livraison en temps réel, Offres exclusives du quartier).

### 6. Authentification Google (`/google-auth`)
- **Route** : `/google-auth`
- **UI Figma** : Reproduction fidèle avec bandeau supérieur aux 4 couleurs Google, badge **🔒 SSL 256**, carte *"EXPÉRIENCE CULINAIRE DIRECTE"*.
- **Google GIS** : Service `GoogleAuthService` chargeant le SDK `https://accounts.google.com/gsi/client` et décodant le token JWT `credential`.
- **Action** : Sélecteur de compte dynamique, option *"Utiliser un autre compte"* et bouton rouge *"Continuer en tant que {firstName}"*.

### 7. Pages Légales (`/terms` & `/privacy`)
- **CGU / CGV (`/terms`)** : Sommaire interactif et 18 articles réglementaires.
- **Politique de Confidentialité (`/privacy`)** : 15 articles conformes à la Loi sénégalaise n° 2008-12 et sous l'autorité de la CDP.
- **Navigation** : Bouton retour (`<-`) configuré pour rediriger vers `/login`.

---

## 🛠️ Commandes de Développement

### Lancer le serveur local de développement
```bash
ng serve
```
Accéder à l'application sur `http://localhost:4200/`.

### Lancer le build de production
```bash
ng build
```
Les fichiers compilés sont générés dans le dossier `dist/ayyou`.

### Exécuter les tests unitaires
```bash
npx ng test --watch=false
```

---

## 🔌 Spécifications pour le Backend (Django REST Framework)

Le backend devra implémenter les endpoints suivants :

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register/` | Reçoit le prénom, nom, téléphone, indicatif, email et mot de passe. Génère et envoie l'OTP SMS. |
| `POST` | `/api/auth/verify-sms/` | Valide l'OTP 6 chiffres et active le compte. Retourne les tokens JWT AYYOU. |
| `POST` | `/api/auth/login/` | Authentifie les identifiants classiques (email/téléphone + mot de passe). |
| `POST` | `/api/auth/google/` | Reçoit `{ "credential": "<GOOGLE_ID_TOKEN>" }`. Effectue la vérification cryptographique via `google-auth` Python (signature, `iss`, `aud`, `exp`, `email_verified`, `sub`). |
| `POST` | `/api/auth/resend-sms/` | Renvoyer un nouveau code d'activation SMS. |

---

## 📂 Arborescence Principale des Fichiers

```
src/
├── app/
│   ├── core/
│   │   ├── guards/
│   │   ├── models/
│   │   └── services/
│   │       ├── auth.service.ts
│   │       └── google-auth.service.ts
│   ├── features/
│   │   ├── auth/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   │       ├── google-auth/
│   │   │       ├── location/
│   │   │       ├── login/
│   │   │       ├── onboarding/
│   │   │       ├── register/
│   │   │       ├── verify-sms/
│   │   │       └── welcome/
│   │   └── legal/
│   │       └── pages/
│   │           ├── privacy/
│   │           └── terms/
│   ├── app.component.ts
│   ├── app.config.ts
│   └── app.routes.ts
├── assets/
│   └── branding/
│       └── logoanimeayyou.mp4
└── styles.scss
public/
└── assets/
    └── branding/
        └── logoanimeayyou.mp4
```
