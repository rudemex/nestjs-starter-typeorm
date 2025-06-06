# COMMANDS
# docker build -t <user-docker>/<app-name> .
# docker run -d -p 8080:8080 --name <container-name> --env-file <.env> <user-docker>/<app-name>

# EXAMPLES

# Standar build
# docker build -t nestjs-starter-typeorm .

# Build with ARG
# docker build --build-arg NODE_VERSION=18.20.4-alpine --build-arg APP_PORT=3000 --build-arg IMAGE_NAME=my-nestjs-app -t mi-imagen .

# Run
# docker run -d -p 8080:8080 --name nestjs-starter-typeorm-app --env-file .env nestjs-starter-typeorm
# docker run -it -p 8080:8080 --name nestjs-starter-typeorm-app --env-file .env nestjs-starter-typeorm
# docker system prune

#docker run -it --rm --entrypoint=sh nestjs-starter-typeorm



ARG NODE_VERSION=20.19.0-alpine
ARG NODE_ENV=build
ARG APP_PORT=8080
ARG IMAGE_NAME=nestjs-starter-typeorm

# Utiliza una versión ligera de Node.js como imagen base
FROM node:${NODE_VERSION} AS builder

# Establece la variable de entorno NODE_ENV a partir del ARG
ENV NODE_ENV=${NODE_ENV}

# Define el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos package.json y yarn.lock al contenedor
COPY package.json ./

# Instala las dependencias del proyecto utilizando Yarn
RUN yarn install || cat yarn-error.log

# Copia el resto del código del proyecto al contenedor
COPY . .

# Construye la aplicación
RUN yarn build

# ---

# Comienza una nueva etapa para reducir el tamaño de la imagen final
FROM node:${NODE_VERSION}
# Información sobre la imagen, con el valor de la etiqueta name parametrizado
LABEL name=${IMAGE_NAME}

# Define el directorio de trabajo en el contenedor
WORKDIR /usr/src/app

# Copia los archivos y directorios desde la etapa de construcción
COPY --from=builder /usr/src/app/package.json ./
COPY --from=builder /usr/src/app/node_modules/ ./node_modules/
COPY --from=builder /usr/src/app/dist ./dist

# Define un usuario sin privilegios para ejecutar la aplicación
USER node
# Expone el puerto que usa la aplicación
EXPOSE ${APP_PORT}
# Define el comando para iniciar la aplicación
CMD ["yarn", "start"]
