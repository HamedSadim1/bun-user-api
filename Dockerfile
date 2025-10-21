# Gebruik de officiële Bun runtime als basis image
FROM oven/bun:latest

# Stel de werkmap in binnen de container
WORKDIR /docker-node

# Stel omgevingsvariabelen in voor MongoDB inloggegevens
ENV MONGO_DB_USERNAME=admin \
    MONGO_DB_PWD=qwerty

# Kopieer package.json eerst voor betere Docker layer caching
# Dit stelt Docker in staat om dependencies te cachen als package.json niet is veranderd
COPY package.json ./

# Installeer dependencies met behulp van Bun
RUN bun install

# Kopieer de rest van de applicatie code
COPY . .

# Maak poort 5050 beschikbaar voor externe toegang tot de applicatie
EXPOSE 5050

# Commando om de applicatie uit te voeren met Bun
CMD ["bun", "run", "server.ts"]