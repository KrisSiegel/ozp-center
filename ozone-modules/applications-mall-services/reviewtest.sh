#!/bin/sh

cat <<EOF > /dev/null
submit a post with a user and an appid
user is hardcoded
use two users
use first user twice (after second user), make sure it's rejected
pick first app
EOF

PORT=3000

# id is the _id of the first app found in the collection
oneid=$(curl http://localhost:$PORT/api/apps/app/ 2>&1 | grep -m 1 _id)
echo oneid is $oneid
id=$(echo $oneid |sed 's/.*"\([a-f0-9]*\)".*/\1/')

echo id is $id

curl -X POST -H "Content-Type: application/json" -d '{ "appid": "'$id'", "reviewText":"I want to be baried with this app", "rating" : 5, "user" : "TestUser10" }' http://localhost:$PORT/api/aml/review

curl -X POST -H "Content-Type: application/json" -d '{ "appid": "'$id'", "reviewText":"Meh, is ok...", "rating" : 3, "user" : "TestUser9" }' http://localhost:$PORT/api/aml/review

curl -X POST -H "Content-Type: application/json" -d '{ "appid": "'$id'", "reviewText":"I want to be buried with this app", "rating" : 4, "user" : "TestUser10" }' http://localhost:$PORT/api/aml/review

#Get the review for a particular user/app
curl "http://localhost:$PORT/api/aml/reviews?appid=$id&user=TestUser9"
