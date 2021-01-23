FROM node as build-stage

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY ./ /app/

ARG API_KEY=test
ARG configuration=production

RUN sed -i.bak "s/API_KEY/${API_KEY}/g" src/environments/environment.prod.ts
RUN npm run build -- --output-path=./dist/out --configuration $configuration

FROM nginx
COPY --from=build-stage /app/dist/out/ /usr/share/nginx/html
COPY --from=build-stage /app/nginx.conf /etc/nginx/conf.d/default.conf
