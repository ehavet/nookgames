# Démarrer la DB
docker container start nkdb

# Migration
https://db-migrate.readthedocs.io/en/latest/
yarn db-migrate create create-table-my_table
yarn db:migrate
yarn db:migrate:down

# Gmail API
 lancer l'app puis appeler
 `/v0/gmail-api-auth` pour récupèrer un token
 puis être redirigé via un callback configuré dans gmail API cloud
 sur `/v0/gmail-api-token` en lui passant le token récupéré juste avant

puis `/v0/latest-lbc-sales` pour retourner les ids des annonces vendues
 
