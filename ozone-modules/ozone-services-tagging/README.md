ozone-services-tagging
===========

##REST API

/api/tags/tag/ (POST)
/api/tags/tag/<id> (GET, PUT, DELETE)
/api/tags/tag/?id=<id>&level=<level>&topic=<topic>&uri=<uri> (GET)

A tag object looks like the following:
{
	id: <random id>,
	level: <System, Role, User>,
	topic: <typically related to level; additional filter>,
	uri: <uri to the target e.g. /Apps/AppsMall/Apps/Gmail>,
	tag: <the tag!!!>,
	description: <optional field with text>,
	creatorUserId: <user id>,
	created: <date>,
	modified: <date>,
	visibility: <empty for now>
}