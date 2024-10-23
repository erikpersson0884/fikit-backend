FROM node:alpine

WORKDIR /fikit_ass
COPY . .

RUN npm install
RUN npm run build
EXPOSE 3001
CMD ["npm", "start"]