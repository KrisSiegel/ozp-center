# Ozone Services - Persistence

##REST API
The following REST URLs have been implemented so far:

(/api/persistence/ is assumed in the URL)

# Collection:
GET store/:store/collection/:collection
GET store/:store/collection/:collection/:id

POST store/:store/collection/:collection
Body:
[
  {
    "ID_HERE": { JSON HERE }
  }
]

Replace the "ID_HERE" above with "null" to create a new object and let the database create the _id, OR pass in a hex ID to use it to upsert the object.

Notice this is using an array, so multiple records can be sent.

# Drive:
GET store/:store/drive/:drive
GET store/:store/drive/:drive/:id

POST store/:store/drive/:drive
This uses multipart, so FormData in JavaScript can be used to send the data.
Pass in the id you want to use for the record - either "null" or a hex id in the name field of the FormData. "null" will let the database create the id, otherwise it will do an upsert with the id. 

For example: 
var formData = new FormData(); 
formData.append("null", fileObject1); 
formData.append("127d3b89b6515e2d97000003", fileObject2); 

then pass the formData in an AJAX call to the server.