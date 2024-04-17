#!/bin/bash

goHead=/Volumes/GSRB02/Geo_Ocean

npx kill-port 8002 && cd $goHead
yarn start