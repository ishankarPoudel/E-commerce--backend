FROM node:20 as build
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM node:20-slim
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --prod
COPY --from=build /app/dist ./dist
COPY --from=build /app/public ./public
EXPOSE 8000
CMD ["node", "dist/index.js"]