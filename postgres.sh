#!/usr/bin/env bash

##### development environment only #####

docker compose up postgres -d
docker compose up pgadmin -d