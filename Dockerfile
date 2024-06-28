FROM node:18-alpine AS build
ARG ENVIRONMENT

RUN echo '@merlot-education:registry = "https://npm.pkg.github.com/"' >> ~/.npmrc
RUN echo '//npm.pkg.github.com/:_authToken=${NPM_CONFIG_TOKEN}' >> ~/.npmrc

WORKDIR /app

COPY . .
RUN npm ci
RUN npm run ng -- build

FROM nginx:stable-alpine
COPY --from=build /app/dist/ocm-command-center/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
