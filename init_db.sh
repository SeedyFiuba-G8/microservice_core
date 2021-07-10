#! /bin/sh

# Remember to specify the desired database. In this case, it will
# create a projects table in database sf_core by default.
DEFAULT_URL='postgres://postgres:postgres@localhost:5432/sf_core'
: "${DATABASE_URL:=$DEFAULT_URL}"

cd ./scripts
echo "Seedy FIUBA - Core microservice\n"

echo "> CREATING TABLES AND INSERTING EXAMPLE DATA..."
psql $DATABASE_URL -f init_db.sql

echo "\n> Done! :)"
