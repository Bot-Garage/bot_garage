FROM node

# Set the working directory
WORKDIR /web

# Copy over package.json
COPY ./package.json .

# Install NodeJS dependencies
RUN npm install

# Copy over everything else
COPY . .

# Environmental Variables - Database
ENV MONGO_DB_URL=$MONGO_DB_URL

# Environmental Variables - New Database
ENV DB_HOST=$DB_HOST
ENV DB_PORT=$DB_PORT
ENV DB_USER=$DB_USER
ENV DB_PASSWORD=$DB_PASSWORD
ENV DB_DATABASE=$DB_DATABASE

# Environmental Variables - Admin User
ENV ADMIN_USER_NAME=$ADMIN_USER_NAME
ENV ADMIN_USER_PASSWORD=$ADMIN_USER_PASSWORD

# Expose port 8080
EXPOSE 8080

# Set Run Command
CMD npm run app