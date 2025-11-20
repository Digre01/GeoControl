# Usa un'immagine Node ufficiale come base
FROM node:20-alpine

# Imposta la working directory
WORKDIR /app

# Copia package.json e package-lock.json
COPY ../../package*.json ./

# Installa le dipendenze
RUN npm install
RUN npm install -g ts-node typescript
RUN npm install tsconfig-paths

# Copia il resto del codice sorgente
COPY ../../ ./

# Costruisci il progetto (se usi TypeScript)
RUN npm run build

# Espone la porta su cui gira il backend (es: 5000)
EXPOSE 5000

# Comando di avvio
CMD ["sh", "-c", "ts-node -r tsconfig-paths/register ./scripts/create-root-user.ts && npm run start"]