# Gebruik de officiële Bun runtime als basis image
FROM oven/bun:latest

# Stel de werkmap in binnen de container
WORKDIR /docker-node

# Stel omgevingsvariabelen in voor MongoDB inloggegevens
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=qwerty

# Kopieer package.json en bun.lock eerst voor betere Docker layer caching
# Dit stelt Docker in staat om dependencies te cachen als deze niet zijn veranderd
COPY package.json bun.lock ./

# Installeer alle dependencies; devDependencies zijn nodig voor de Vite-build
RUN bun install --frozen-lockfile

# Kopieer de rest van de applicatie code
COPY . .

# Bouw de frontend naar dist/
RUN bun run build

# Productie-runtime
ENV NODE_ENV=production

# Maak poort 5050 beschikbaar voor externe toegang tot de applicatie
EXPOSE 5050

# Commando om de applicatie uit te voeren met Bun
CMD ["bun", "server/index.ts"]
