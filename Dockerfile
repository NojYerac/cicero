FROM debian:jessie
# runit depends on /etc/inittab which is not present in debian:jessie
RUN touch /etc/inittab
RUN apt-get update && DEBIAN_FRONTEND=noninteractive apt-get install -y -q wkhtmltopdf node mongodb npm runit
RUN ln -s /usr/bin/nodejs /usr/bin/node

#pass env through runit
ADD ./run/runit_shim /usr/sbin/runit_shim
RUN chmod 700 /usr/sbin/runit_shim
ADD ./run/cicero /etc/service/cicero/run
RUN chmod 700 /etc/service/cicero/run
ADD ./run/mongodb /etc/service/mongodb/run
RUN chmod 700 /etc/service/mongodb/run


ADD dist /usr/src/app

#TODO: prefixer is broken somewhere...
RUN ["ln", "-s", "/usr/src/app/dist/{public,client}"]

RUN apt-get clean && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

EXPOSE 9000
ENV NODE_ENV prod
ENTRYPOINT ["/usr/sbin/runit_shim"]
