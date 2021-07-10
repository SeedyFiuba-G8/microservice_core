#! /bin/sh

# This script will automatically update remote dbs
# DANGER: This sould be removed when repository is made public!

DEV_URL='postgres://rtubvacsoievvu:24096b74d1004dd509d097f9ef67cb3fe435f5854331b2d6eee2242fb184459e@ec2-52-202-152-4.compute-1.amazonaws.com:5432/de89hbc694el6c'
PROD_URL='postgres://xidjakrpkrurmq:00cfe945ba243703600f4d19fa69f805fd4e16c0e1b947645a1e16814a659794@ec2-52-202-152-4.compute-1.amazonaws.com:5432/dd8boc9idmttqi'

echo "\n> Updating dev..."
DATABASE_URL=$DEV_URL ./init_db.sh

echo "\n> Updating prod..."
DATABASE_URL=$PROD_URL ./init_db.sh
