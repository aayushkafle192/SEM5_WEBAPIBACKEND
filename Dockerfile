# Image choose/ linux server

# From node:22 -alpine

# WORKDIR /app

# #Copy source(current) destination(docker)
# COPY package*.json ./

# #Shell/Terminal command
# Run npm install

# #Copy rest of the source doe
# COPY . .

# #Docker port
# EXPOSE 5050

# # Entry point (run derver)
# CMD ["node", "server.js"]

# # docker build -t backend-app .
# # docker run -d -p 5050:5050 --name backend backend-app
# # docker ps -a
# # docker stop CONTAINERID
# # docker rm CONTAINERID