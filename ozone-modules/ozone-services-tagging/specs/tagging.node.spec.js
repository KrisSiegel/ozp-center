/**
 *  Unit tests for Ozone Tagging services
 *
 *  @module Ozone.Services.Tagging
 *  @class Ozone.Services.Tagging.UnitTest
 *  @submodule Server-Side
 */
module.exports = (function (Ozone) {
    describe("Ozone Tagging Import Service", function () {
        var TopicService = null,
            TagService = null;

        beforeEach(function (done) {
            Ozone.Service().on("ready", "Tags", function () {
                Ozone.Service("Tags").init(Ozone);
                TopicService = Ozone.Service("Tags").topic;
                TagService = Ozone.Service("Tags").tag;
                TagService.query({},{},function(e,r){TagService.delete(r.map(function(x){return x._id}), function(){
                    TopicService.query({},{},function(e,r){TopicService.delete(r.map(function(x){return x._id}), function(){done();})});
                })});
            });
        });

        it('should pass an import report into the callback with the number of successful and failed imports', function(done){
            Ozone.Service("Tags").import({topic: require('../specs/spec-data/test-imports/topics.json').injectableRecords, tag: require('../specs/spec-data/test-imports/tags.json').injectableRecords }, function(importReport){
                expect(importReport).not.toBe(null);
                expect(importReport.tag.successful).toBe(3);
                expect(importReport.tag.failed).toBe(0);
                expect(importReport.topic.successful).toBe(2);
                expect(importReport.topic.failed).toBe(0);
                done();
            });
        });

        it('should import an array of topic json and an array of tag data', function(done){
            Ozone.Service("Tags").import({topic: require('../specs/spec-data/test-imports/topics.json').injectableRecords, tag: require('../specs/spec-data/test-imports/tags.json').injectableRecords }, function(importReport){
                expect(importReport).not.toBe(null);
                expect(importReport.tag.successful).toBe(3);
                expect(importReport.tag.failed).toBe(0);
                expect(importReport.topic.successful).toBe(2);
                expect(importReport.topic.failed).toBe(0);
                TopicService.query({},{}, function(err, res){
                    expect(err).toBe(null);
                    expect(res).not.toBe(null);
                    expect(res.length).toBe(2);
                    TagService.query({},{}, function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(3);
                        done(err);
                    });
                });
            });
        });

        it('should import an array of tag json and create topics for imported tags if topics do not exist', function(done){
            Ozone.Service("Tags").import({ tag: require('../specs/spec-data/test-imports/tags.json').injectableRecords }, function(importReport){
                expect(importReport).not.toBe(null);
                expect(importReport.tag.successful).toBe(3);
                expect(importReport.tag.failed).toBe(0);
                expect(importReport.topic.successful).toBe(2);
                expect(importReport.topic.failed).toBe(0);
                TopicService.query({},{}, function(err, res){
                    expect(err).toBe(null);
                    expect(res).not.toBe(null);
                    expect(res.length).toBe(2);
                    TagService.query({},{}, function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(3);
                        done(err);
                    });
                });
            });
        });
    });

    describe("Ozone Tagging Export Service", function () {
        var TopicService = null,
            TagService = null;

        beforeEach(function (done) {
            Ozone.Service().on("ready", "Tags", function () {
                Ozone.Service("Tags").init(Ozone);
                TopicService = Ozone.Service("Tags").topic;
                TagService = Ozone.Service("Tags").tag;
                TagService.query({},{},function(e,r){TagService.delete(r.map(function(x){return x._id}), function(){
                    TopicService.query({},{},function(e,r){TopicService.delete(r.map(function(x){return x._id}), function(){done();})});
                })});
            });
        });

        it('should export will call a callback and pass into it the the exported object: {tag: [], topic: []}', function(done){
            Ozone.Service("Tags").import({topic: require('../specs/spec-data/test-imports/topics.json').injectableRecords, tag: require('../specs/spec-data/test-imports/tags.json').injectableRecords }, function(){
                Ozone.Service("Tags").export(function(exportData){
                    expect(exportData).not.toBe(undefined);
                    expect(Object.keys(exportData).length).toBe(2);
                    expect(exportData['tag'].length).toBe(3);
                    expect(exportData['topic'].length).toBe(2);
                    done();
                });
            });
        });
    });

    describe("Ozone Tagging Topic Service", function () {
        var TopicService = null,
            TagService = null;

        beforeEach(function (done) {
            Ozone.Service().on("ready", "Tags", function () {
                Ozone.Service("Tags").init(Ozone);
                TopicService = Ozone.Service("Tags").topic;
                TagService = Ozone.Service("Tags").tag;
                TagService.query({},{},function(e,r){TagService.delete(r.map(function(x){return x._id}), function(){
                    TopicService.query({},{},function(e,r){TopicService.delete(r.map(function(x){return x._id}), function(){done();})});
                })});
            });
        });

        //setup testing data
        var testTagApp1ToTopic1 = require('./spec-data/testTagApp1ToTopic1.json'),
            testTagApp1ToTopic2 = require('./spec-data/testTagApp1ToTopic2.json'),
            testTagApp2ToTopic1 = require('./spec-data/testTagApp2ToTopic1.json'),
            testTopic1 = require('./spec-data/testTopic1.json'),
            testTopic2 = require('./spec-data/testTopic2.json');

        it("should return an array of one topic object when you get by ID", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            var topic2 = Ozone.utils.clone(testTopic2);
           TopicService.create(topic1, function(err, res){
               TopicService.create(topic2, function(err, res){
                   TopicService.get(topic1._id, function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(1);
                        var retId = res[0]._id.toString();
                        var requestedId = topic1._id.toString();
                        expect(retId).toBe(requestedId);
                        done(err);
                    });
                });
            });
        });

        it("should return an empty array when you get by an invalid ID", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            var topic2 = Ozone.utils.clone(testTopic2);
           TopicService.create(topic1, function(err, res){
               TopicService.create(topic2, function(err, res){
                   TopicService.get('123456789121', function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(0);
                        done(err);
                    });
                });
            });
        });

        it("should add a topic to the DB when create is called", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
           TopicService.create(topic1, function (err, res) {
                expect(err).toBe(null);
                expect(res.constructor).toBe(Array);
                expect(res.length).toBe(1);
                expect(res[0].uri).toBe('/AppsMall/TestTopic/');
                expect(res[0].tag).toBe('Topic1');
                TopicService.query({uri: '/AppsMall/TestTopic/', tag: 'Topic1'}, {}, function (err, res) {
                    expect(err).toBe(null);
                    expect(res.constructor).toBe(Array);
                    expect(res.length).toBe(1);
                    expect(res[0].uri).toBe('/AppsMall/TestTopic/');
                    expect(res[0].tag).toBe('Topic1');
                    done(err);
                });
            });
        });


        it("should not create a topic if a topic with the same uri and tag already exists", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
           TopicService.create(topic1, function (err, res) {
                expect(err).toBe(null);
                //remove id from object to attempt to re-add it
                delete topic1._id;
                TopicService.create(topic1, function (err, res) {
                    expect(err).not.toBe(null);
                    //do a query to check to ensure only one item exists with given uri and tag
                   TopicService.query({uri: topic1.uri, tag: topic1.tag},{}, function(err, res){
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(1);
                        done(err);
                    });
                });
            });
        });

        it("should delete a topic from a topic id", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
           TopicService.create(topic1, function (err, res) {
                expect(err).toBe(null);
               TopicService.get(topic1._id, function(err, res){
                    //ensure was created
                    expect(res.length).toBe(1);
                   TopicService.delete(topic1._id, function(err, res){
                        expect(err).toBe(null);
                        //query db to ensure is empty as
                       TopicService.get(topic1._id, function(err, res){
                            expect(err).toBe(null);
                            expect(res.length).toBe(0);
                            done(err);
                        });
                    });
                });
            });
        });

        it("should update a topic to the new data when update is called", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
           TopicService.create(topic1, function(err, res){
                var topic = res[0];
                expect(topic).not.toBe(null);
                topic1.tag = 'Updated Tag';
                topic1.description = 'updated description';
               TopicService.update(topic1._id, topic1, function(err, res){
                    expect(err).toBe(null);
                    //get the topic from db to ensure it was updated
                   TopicService.get(topic1._id, function(err, res){
                        expect(err).toBe(null);
                        var updatedTag = res[0];
                        expect(updatedTag.tag).toBe('Updated Tag');
                        expect(updatedTag.description).toBe('updated description');
                        done(err);
                    });
                });
            });
        });

        it("should update a topic when only the description changes, ensuring it passes its own uniqueness test.", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            TopicService.create(topic1, function(err, res){
                var topic = res[0];
                expect(topic).not.toBe(null);
                topic1.description = 'updated description';
                TopicService.update(topic1._id, topic1, function(err, res){
                    expect(err).toBe(null);
                    //get the topic from db to ensure it was updated
                    TopicService.get(topic1._id, function(err, res){
                        expect(err).toBe(null);
                        var updatedTag = res[0];
                        expect(updatedTag.description).toBe('updated description');
                        done(err);
                    })
                })
            });
        });

        it("should not update a topic if the update causes a duplicate tag/uri combination", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            var topic2 = Ozone.utils.clone(testTopic2);

           TopicService.create(topic1, function(){
               TopicService.create(topic2, function(){
                    topic2.uri = topic1.uri;
                    topic2.tag = topic1.tag;
                   TopicService.update(topic2._id, topic2, function(err, res){
                       TopicService.get(topic2._id, function(err, res){
                            expect(res).not.toBe(null);
                            expect(res[0].tag).not.toBe(topic1.tag);
                            done(err);
                        });

                    });
                });
            });
        });

        it("should update tag topics if the topic's tag is updated", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            var tag2 = Ozone.utils.clone(testTagApp2ToTopic1);
            var tag3 = Ozone.utils.clone(testTagApp1ToTopic2);

           TopicService.create(topic1, function(){
                TagService.create(tag1,function(){
                    TagService.create(tag2, function(){
                        //add tag 3 to ensure that not all tags get updated.
                        TagService.create(tag3, function(){
                            topic1.tag = 'updated tag';
                            //ensure tags currently do not have tag of 'updated tag'
                            expect(tag1.tag).not.toBe('updated tag');
                            expect(tag2.tag).not.toBe('updated tag');
                           TopicService.update(topic1._id, topic1, function(err, res){
                                TagService.query({tag: 'updated tag', topic: topic1.uri}, {}, function(err, res){
                                    expect(res.length).toBe(2);
                                    expect(res[0].tag).toBe('updated tag');
                                    done(err);
                                });
                            });
                        });
                    });
                });
            });
        });

        it("should return the proper tag when queried", function(done){
            var topic1 = Ozone.utils.clone(testTopic1);
            var topic2 = Ozone.utils.clone(testTopic2);

           TopicService.create(topic1, function(){
               TopicService.create(topic2, function(){
                   TopicService.query({tag: topic1.tag, uri: topic1.uri}, {}, function(err, res){
                        expect(res.length).toBe(1);
                        expect(res[0].tag).toBe(topic1.tag);
                        expect(res[0].uri).toBe(topic1.uri);
                        done(err);
                    });
                });
            });
        });
    });

    describe("Ozone Tagging Tag Service", function () {
        var TopicService = null,
            TagService = null;

        beforeEach(function (done) {
            Ozone.Service().on("ready", "Tags", function () {
                Ozone.Service("Tags").init(Ozone);
                TopicService = Ozone.Service("Tags").topic;
                TagService = Ozone.Service("Tags").tag;
                TagService.query({},{},function(e,r){TagService.delete(r.map(function(x){return x._id}), function(){
                    TopicService.query({},{},function(e,r){TopicService.delete(r.map(function(x){return x._id}), function(){done();})});
                })});
            });
        });

        //setup testing data
        var testTagApp1ToTopic1 = require('./spec-data/testTagApp1ToTopic1.json'),
            testTagApp1ToTopic2 = require('./spec-data/testTagApp1ToTopic2.json'),
            testTagApp2ToTopic1 = require('./spec-data/testTagApp2ToTopic1.json'),
            testTopic1 = require('./spec-data/testTopic1.json'),
            testTopic2 = require('./spec-data/testTopic2.json');

        it("should return an array of one tag object when you get by ID", function(done){
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            var tag2 = Ozone.utils.clone(testTagApp2ToTopic1);
            TagService.create(tag1, function(err, res){
                TagService.create(tag2, function(err, res){
                    TagService.get(tag1._id, function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(1);
                        var retId = res[0]._id.toString();
                        var requestedId = tag1._id.toString();
                        expect(retId).toBe(requestedId);
                        done(err);
                    });
                });
            });
        });

        it("should return an empty array when you get by an invalid ID", function(done){
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            var tag2 = Ozone.utils.clone(testTagApp2ToTopic1);
            TagService.create(tag1, function(err, res){
                TagService.create(tag2, function(err, res){
                    TagService.get('123456789012', function(err, res){
                        expect(err).toBe(null);
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(0);
                        done(err);
                    });
                });
            });
        });

        it("should add a tag to the DB when create is called", function(done){
            var tag = Ozone.utils.clone(testTagApp1ToTopic1);
            TagService.create(tag, function (err, res) {
                expect(err).toBe(null);
                expect(res.length).toBe(1);
                expect(res[0].uri).toBe('/AppsMall/Apps/App1');
                expect(res[0].tag).toBe('Topic1');
                TagService.query({uri: '/AppsMall/Apps/App1', tag: 'Topic1', topic: '/AppsMall/TestTopic/'},{}, function(err, res){
                    expect(err).toBe(null);
                    expect(res.constructor).toBe(Array);
                    expect(res.length).toBe(1);
                    expect(res[0].uri).toBe('/AppsMall/Apps/App1');
                    expect(res[0].tag).toBe('Topic1');
                    done(err);
                });
            });
        });

        it("should not create a tag if a tag with the same uri, tag, and topic already exists", function(done){
            var tag = Ozone.utils.clone(testTopic1);
            TopicService.create(tag, function (err, res) {
                expect(err).toBe(null);
                //remove id from object to attempt to re-add it
                delete tag._id;
                TopicService.create(tag, function (err, res) {
                    expect(err).not.toBe(null);
                    //do a query to check to ensure only one item exists with given uri and tag
                    TopicService.query({uri: tag.uri, tag: tag.tag, topic: tag.topic},{}, function(err, res){
                        expect(res).not.toBe(null);
                        expect(res.length).toBe(1);
                        done(err);
                    });
                });
            });
        });

        it("should delete a tag from a tag id", function(done){
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            TagService.create(tag1, function (err, res) {
                expect(err).toBe(null);
                TagService.get(tag1._id, function(err, res){
                    //ensure was created
                    expect(res.length).toBe(1);
                    TagService.delete(tag1._id, function(err, res){
                        expect(err).toBe(null);
                        //query db to ensure is empty as
                        TagService.get(tag1._id, function(err, res){
                            expect(err).toBe(null);
                            expect(res.length).toBe(0);
                            done(err);
                        });
                    });
                });
            });
        });

        it("should update a tag to the new data when update is called", function(done){
            var tag1 = Ozone.utils.clone(testTopic1);
            TagService.create(tag1, function(err, res){
                var topic = res[0];
                expect(topic).not.toBe(null);
                tag1.tag = 'Updated Tag';
                TagService.update(tag1._id, tag1, function(err, res){
                    expect(err).toBe(null);
                    //get the topic from db to ensure it was updated
                    TagService.get(tag1._id, function(err, res){
                        expect(err).toBe(null);
                        var updatedTag = res[0];
                        expect(updatedTag.tag).toBe('Updated Tag');
                        done(err);
                    })
                })
            });
        });

        it("should not update a tag if the update causes a duplicate tag/uri/topic combination", function(done){
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            var tag2 = Ozone.utils.clone(testTagApp1ToTopic2);

            TagService.create(tag1, function(){
                TagService.create(tag2, function(){
                    tag2.uri = tag1.uri;
                    tag2.tag = tag1.tag;
                    tag2.topic = tag1.topic;
                    TagService.update(tag2._id, tag2, function(err, res){
                        expect(err).not.toBe(null);
                        TagService.get(tag2._id, function(err, res){
                            expect(res).not.toBe(null);
                            expect(res[0].tag).not.toBe(tag1.tag);
                            done(err);
                        });

                    });
                });
            });
        });

        it("should return the proper tag when queried", function(done){
            var tag1 = Ozone.utils.clone(testTagApp1ToTopic1);
            var tag2 = Ozone.utils.clone(testTagApp1ToTopic2);

            TagService.create(tag1, function(){
                TagService.create(tag2, function(){
                    TagService.query({tag: tag1.tag, uri: tag1.uri, topic: tag1.topic}, {}, function(err, res){
                        expect(res.length).toBe(1);
                        expect(res[0].tag).toBe(tag1.tag);
                        expect(res[0].uri).toBe(tag1.uri);
                        done(err);
                    });
                });
            });
        });
    });
});
