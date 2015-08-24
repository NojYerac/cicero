FROM debian:jessie

# Run OS updates
ENV DEBIAN_FRONTEND noninteractive
RUN apt-get update
RUN apt-get -o Dpkg::Options::="--force-confdef" -o Dpkg::Options::="--force-confold" upgrade -y

# Install app dependencies
RUN apt-get install -y -q wkhtmltopdf node npm
RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Create a non-root user
RUN useradd -s /sbin/nologin -c 'Cicero' cicero

# add the app files
ADD ./dist/package.json /cicero/package.json
RUN cd /cicero; npm install --production
ADD ./dist/server /cicero/server
ADD ./dist/public /cicero/public
RUN ["chown", "-R", "cicero", "/cicero"]

# Run as non-root user
USER cicero
# Set the node environment
ENV NODE_ENV first-run

#TODO: prefixer is broken somewhere...
RUN ln -s /cicero/public /cicero/client

# Open http port
EXPOSE 8080

# Run the app
CMD nodejs /cicero/server/app.js
