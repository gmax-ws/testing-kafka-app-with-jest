FROM node:10

MAINTAINER gimpneek@gmail.com

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .
RUN rm package-lock.json && rm -rf node_modules

# Install dependencies (if any) in package.json
RUN npm install

# Fix issues with rdkafka failing due to MacOS package-lock.json
# RUN npm install node-rdkafka --no-package-lock

# Expose port from container so host can access 3000
EXPOSE 8080

# Start the Node.js app on load
CMD [ "npm", "start" ]
