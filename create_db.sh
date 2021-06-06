#! /bin/sh

DEFAULT_URL='postgres://postgres:postgres@localhost:5432/postgres'
: "${DATABASE_URL:=$DEFAULT_URL}"

cd ./scripts
echo "Seedy FIUBA - Core microservice\n"

echo "> CREATE DATABASE 'sf_core':"
psql $DATABASE_URL -f create_db.sql

