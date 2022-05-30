FROM node:14.18.1

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# If you are building your code for production
# RUN npm install --only=production
# Bundle app source
COPY . .

RUN npm install

EXPOSE 8000

CMD [ "npm", "start" ]