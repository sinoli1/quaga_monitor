FROM node:18-alpine

# Crear carpeta de trabajo
WORKDIR /app

# Copiar dependencias
COPY package.json package-lock.json ./
RUN npm install

# Copiar todo el código
COPY . .

# Compilar frontend (vite) y backend (esbuild)
RUN npm run build

# Exponer puerto del servidor
EXPOSE 3000

# Ejecutar app en modo producción
CMD ["npm", "start"]
