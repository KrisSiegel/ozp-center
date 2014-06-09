'use strict';

/* jasmine specs for Tag service go here */

describe('Tag service', function() {
    var tagService, personaService, rootScope;
    var preLoadedIds = [];
    var testPersona = null;
    var personaKey;
    
    beforeEach(function() {
        module('amlApp.services');
        this.addMatchers(Ozone.mockHelper.appsMallCustomMatchers);

        Ozone.mockDb.loadFixtures(['Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);
        preLoadedIds = Ozone.mockDb.getAllIds(['Tags', 'TagTopics', 'Personas', 'PersonaRoles', 'PersonaPermissions']);

        personaKey = Ozone.mockDb.getKeyFieldFromRecord('Personas');
        testPersona = null;

        inject(function($injector, $rootScope) {
            tagService = $injector.get('Tag');
            personaService = $injector.get('Persona');
            rootScope = $rootScope;
        });
    });

    afterEach(function() {
        Ozone.mockDb.deleteAllCollections();
    });

    // set current persona to persona with corresponding user, or generic test user if empty
    var setCurrentPersona = function(username) {
        username = username || 'testOzoneUser1';

        var personaData = _.find(Ozone.fixtures.personaRecords, function(personaRecord) { return (personaRecord.username === username); });
        personaService.setCurrentPersona(personaData).then(function(setPersona) {
            testPersona = setPersona;
        });
        rootScope.$apply();
        expect(testPersona).toBeTruthy();
    }

    it('should get list of tags', function() {
        var resultTagList;
        tagService.getTags().then(function(tagList) {
            resultTagList = tagList;
        });
        rootScope.$apply();

        expect(resultTagList.length).toBeGreaterThan(0);
    });

    it('should return a single tag when searching by id', function() {
        var resultTagList;
        var tagId = preLoadedIds.Tags[0];
        tagService.getTags({id: tagId}).then(function(tagList) {
            resultTagList = tagList;
        });
        rootScope.$apply();

        expect(resultTagList.length).toEqual(1);
        expect(resultTagList[0]._id).toEqual(tagId);
    });

    it('should create new tags and query on the fields of new tag records', function() {
        var tagUriQuery, allTagsQuery;
        setCurrentPersona();
        var newTag = Ozone.mockHelper.getRandomRecord('Tags');

        tagService.createNewTag(newTag.tag, newTag.uri, newTag.topic).then(function() { return false; });
        rootScope.$apply();

        tagService.getTags().then(function(tagList) {
            allTagsQuery = tagList;
        });
        tagService.getTags(null, newTag.uri).then(function(tagList) {
            tagUriQuery = tagList;
        });
        rootScope.$apply();

        expect(allTagsQuery.length).toEqual(preLoadedIds.Tags.length + 1);
        expect(tagUriQuery.length).toBeGreaterThan(0);
        expect(_.pluck(tagUriQuery, 'uri')).toContain(newTag.uri);
    });

    it('should create multiple tags with one service call', function() {
        var tagUriQuery, allTagsQuery;
        setCurrentPersona();
        var newTag = Ozone.mockHelper.getRandomRecord('Tags');

        // create tag array: an array of size (newRecordCount) containing random tag names
        var newRecordCount = 6;
        var newTagArray = [];
        for (var i = 0; i < newRecordCount; i++) {
            newTagArray.push(Ozone.mockHelper.getRandomString(10));
        }

        tagService.createNewTags(newTagArray, newTag.uri, newTag.level, newTag.topic).then(function() { return false; });
        rootScope.$apply();

        tagService.getTags().then(function(tagList) {
            allTagsQuery = tagList;
        });
        rootScope.$apply();

        expect(allTagsQuery.length).toEqual(preLoadedIds.Tags.length + newTagArray.length);
    });

    it('should delete multiple tags with one service call', function() {
        var tagUriQuery, allTagsQuery;
        setCurrentPersona();

        var newTag = Ozone.mockHelper.getRandomRecord('Tags');

        // array of tag ids: all tag ids except for first.  Delete all tags except for the first tag in the list.
        var testTagIdArray = Ozone.utils.clone(preLoadedIds.Tags);
        testTagIdArray.shift();

        tagService.deleteTags(testTagIdArray).then(function() { return false; });
        rootScope.$apply();

        tagService.getTags().then(function(tagList) {
            allTagsQuery = tagList;
        });
        rootScope.$apply();

        expect(allTagsQuery.length).toEqual(1);
    });

    it('should allow querying on tags by tag level', function() {
        var oldSystemTagQuery, oldRoleTagQuery, oldAllTagsQuery, newSystemTagQuery, newRoleTagQuery, newAllTagsQuery;
        setCurrentPersona();
        var newSystemTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'System'});
        var newRoleTag = Ozone.mockHelper.getRandomRecord('Tags', {type: 'Role'});

        // sanity check on mock helper record generator
        expect(newSystemTag.level).toEqual('System');
        expect(newRoleTag.level).toEqual('Role');

        tagService.getTags().then(function(tagList) {
            oldAllTagsQuery = tagList;
        });
        tagService.getTopicsByTopic("/AppsMall/App/", "System").then(function(tagList) {
            oldSystemTagQuery = tagList;
        });
        tagService.getTopicsByTopic("/AppsMall/App/", "Role").then(function(tagList) {
            oldRoleTagQuery = tagList;
        });
        rootScope.$apply();

        // create new System and Role tag, then run new queries to get new count
        tagService.createNewTagsAndTopics([newSystemTag.tag], newSystemTag.uri, '/AppsMall/App/', newSystemTag.level);
        tagService.createNewTagsAndTopics([newRoleTag.tag], newRoleTag.uri, '/AppsMall/App/', newRoleTag.level);
        rootScope.$apply();

        tagService.getTags().then(function(tagList) {
            newAllTagsQuery = tagList;
        });
        tagService.getTopicsByTopic("/AppsMall/App/", "System").then(function(tagList) {
            newSystemTagQuery = tagList;
        });
        tagService.getTopicsByTopic("/AppsMall/App/", "Role").then(function(tagList) {
            newRoleTagQuery = tagList;
        });
        rootScope.$apply();

        expect(newAllTagsQuery.length).toEqual(oldAllTagsQuery.length + 2);
        expect(newSystemTagQuery.length).toEqual(oldSystemTagQuery.length + 1);
        expect(newRoleTagQuery.length).toEqual(oldRoleTagQuery.length + 1);
    });


});
