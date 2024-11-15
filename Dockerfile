FROM node:20.17 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY  . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY --from=build /app/src/assets/fonts /usr/share/nginx/html/src/assets/fonts
COPY --from=build /app/src/assets/images /usr/share/nginx/html/src/assets/images

RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
