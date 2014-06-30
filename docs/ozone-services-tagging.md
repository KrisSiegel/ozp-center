##Tagging Service
Tags consist of two components: a tag topic and a tag. A tag should be looked at as a resource which has a piece of meta data attached to it. For example an application, person or a sentence inside of a report could have a tag. A topic should be looked at as a definition that further describes where a tag came from, what type of category or topic it belongs to, etc. A list of categories, agencies or any other way of grouping a type of tag is where a tag topic fits in.

####A Tag Topic's JSON Structure
```
{
    "_id": "531a954ae8e6a9ad0960301f",
    "level": "System",
    "uri": "/AppsMall/Category/",
    "tag": "Fun Apps",
    "description": "Games and whatnot!",
    "creatorUserId": "System",
    "created": "2014-01-1T17:54:11Z",
    "modified": "2014-01-1T17:54:11Z",
    "visibility": {}
}
```

####A Tag's JSON Structure
```
{
    "_id": "531a954ae8e6a9ad0960302d",
    "uri": "/AppsMall/Apps/MyApp/",
    "topic": "/AppsMall/Category/",
    "tag": "Fun Apps",
    "creatorUserId": "System",
    "created": "2014-01-1T17:54:11Z",
    "modified": "2014-01-1T17:54:11Z",
    "visibility": {}
}
```

####What does this mean?
Looking at the examples above this demonstrates how the backend works. The Tag Topic with a tag of "Fun Apps" has a URI of "/AppsMall/Category/". This means we're defining a type of tag which would be a category in Apps Mall. In the Apps Mall application it would read from all tag topics with a URI of "/AppsMall/Category/" and display those as categories.

Looking at the tag example it shows that the URI is pointing to a resource (the "MyApp" application) and it has a tag. It also has a topic which is its way of saying "this tag was created from a category" and thusly allows the backend to provide further filtering and bucketing while being able to reuse the tagging system for almost any type of meta data attachments.
