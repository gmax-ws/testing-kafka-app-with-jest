FROM node:8

MAINTAINER gimpneek@gmail.com

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

# Install nodemon globally
RUN npm install -g nodemon

# Install dependencies (if any) in package.json
RUN npm install

# Expose port from container so host can access 3000
EXPOSE 8080

# Start the Node.js app on load
CMD [ "npm", "start" ]
