#  Copyright 2024 Dataport. All rights reserved. Developed as part of the MERLOT project.
#
#  Licensed under the Apache License, Version 2.0 (the "License");
#  you may not use this file except in compliance with the License.
#  You may obtain a copy of the License at
#
#      http://www.apache.org/licenses/LICENSE-2.0
#
#  Unless required by applicable law or agreed to in writing, software
#  distributed under the License is distributed on an "AS IS" BASIS,
#  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#  See the License for the specific language governing permissions and
#  limitations under the License.

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
