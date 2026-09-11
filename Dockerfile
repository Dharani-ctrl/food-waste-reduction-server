FROM node:18

# set the Working directory
WORKDIR /usr/src/app

#install Dependencied
COPY package.json ./
# Rebuild native modules for Linux
RUN npm install --build-from-source bcrypt   

# copy all files and folders to the Working directory
COPY . .

# Expose the PORT
EXPOSE 5000 

CMD ["npm", "start"]

