# Local portability rehearsal only; no live domains, auth or sync backend.
ARG CADDY_IMAGE=caddy@sha256:eb4d35b7452d1ab6171fbdbe8d9275b2301dad6dad92115d91e19fb9b24d510f
FROM ${CADDY_IMAGE}
# Caddy's image sets a low-port file capability; this specimen uses unprivileged 8080.
RUN setcap -r /usr/bin/caddy
COPY Caddyfile.local /etc/caddy/Caddyfile
COPY app/ /srv/
RUN chmod -R a=rX /srv && chmod 0444 /etc/caddy/Caddyfile
USER 1000:1000
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
