# ==================================================
# STAGE 1: Build Angular Application
# ==================================================
FROM node:20-alpine AS build

WORKDIR /app

# Copie des fichiers de dépendances
COPY package.json package-lock.json ./

# Installation propre des dépendances
RUN npm ci

# Copie du code source du frontend
COPY . .

# Build Production Angular
RUN npm run build -- --configuration production

# ==================================================
# STAGE 2: Serve Angular Build with Nginx
# ==================================================
FROM nginx:alpine

# Supprimer la configuration Nginx par défaut
RUN rm -rf /etc/nginx/conf.d/default.conf

# Copier notre configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers statiques compilés depuis le Stage 1
COPY --from=build /app/dist/ayyou/browser /usr/share/nginx/html

# Exposition du port 80
EXPOSE 80

# Démarrage de Nginx
CMD ["nginx", "-g", "daemon off;"]
