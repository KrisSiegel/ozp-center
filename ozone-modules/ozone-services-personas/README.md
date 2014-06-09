ozone-services-personas
===========

##REST API
The following REST URLs have been implemented so far:

GET <api>/personas/persona/current - Get current persona from session

GET <api>/personas/persona/<User ID> - Get user information from the database

POST <api>/personas/persona/ - Submit user information to the database

DELETE <api>/personas/persona/<User ID> - Delete user information form the database

GET <api>/personas/persona/?userId=<User ID>&username=<User name>&auth_token=<Auth token>&auth_service=<Auth service> 
- Queries a user's persona via user id, username or auth information (folks from multiple auth services may come in 
so these fields are essentially generic text fields).