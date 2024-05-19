# base stage
FROM node:14.17.0-alpine3.13 as base

# create and set the user to node
USER node

# Create and set the working directory with appropriate ownership (to node).
WORKDIR /app
COPY --chown=node:node package*.json .
RUN npm install

# default environment is production
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

# default port 3002 for auth service
ARG PORT=3002
ENV PORT=${PORT}
EXPOSE ${PORT}

# dev stage
# since we bind-mount the source code, we don't need to copy the source code
FROM base AS dev
ENV NODE_ENV=development
RUN npm install --only=development
CMD ["npm", "run", "dev"]

# prod stage
FROM base AS prod
COPY --chown=node:node . .
CMD ["npm", "start"]