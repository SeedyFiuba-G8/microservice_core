#! /bin/sh

# This script will automatically update remote dbs
# DANGER: This sould be removed when repository is made public!

DEV_URL='postgres://ujlehfjywtfqvb:2001d745df5e3e1b7474df770ea604bc4009a9f7ae83d80d75b36dc502133b62@ec2-18-233-83-165.compute-1.amazonaws.com:5432/dcqh2n319p9suc'
PROD_URL='postgres://nwzilirwqwlaya:633be5d76d509372e99c7430f5c316ffad1fb393630a5c6c7a4fc6f41ecb4fbf@ec2-3-212-75-25.compute-1.amazonaws.com:5432/d8i9eai6f8jjfe'

echo "\n> Updating dev..."
DATABASE_URL=$DEV_URL ./init_db.sh

echo "\n> Updating prod..."
DATABASE_URL=$PROD_URL ./init_db.sh
