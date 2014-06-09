#!/bin/sh

PORT=5000

id=$(curl http://localhost:$PORT/api/apps/app 2>&1 | grep -m 1 _id |sed 's/.*"\([a-f0-9]*\)".*/\1/')


curl -X POST -H "Content-Type: application/json" -d '{ "action": "rate", "rating" : 1, "user" : "TestUser10" }' http://localhost:$PORT/api/aml/rate/$id
