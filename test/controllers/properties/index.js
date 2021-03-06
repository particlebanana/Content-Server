var helpers = require('../../support/helpers'),
    request = require('supertest'),
    should = require('should');

describe('Properties', function(done) {
  var app, Bucket, Item;

  before(function(done) {
    helpers.buildServer(function(connection, server) {
      app = server;

      app.before(function(req, res, next) {
        req.user = {role: 10}; // don't test access control here
        next();
      });

      // Create a bucket to use for item tests
      helpers.createBucket(app, { name: 'test-item-index' }, function(err, bucket) {
        helpers.createItem(app, { name: 'test-item-index', bucket_id: bucket.id, bucket_name: bucket.name }, function(err, item) {
          Bucket = bucket;
          Item = item;
          done();
        });
      });
    });
  });

  after(function() {
    helpers.clearData(app, ['buckets', 'items', 'item_properties']);
  });

  describe('#index', function() {
    describe('with records', function() {
      var response;

      before(function(done) {
        var props = [
          { key: 'key1', value: 'value1'},
          { key: 'key2', value: 'value2'}
        ];

        helpers.createItemProperties(app, { bucket_name: Bucket.name, item_name: Item.name, body: props }, function(err, result) {
          if(err) return done(err);

          request(app)
          .get('/api/v1/buckets/' + Bucket.name + '/items/' + Item.name + '/properties')
          .end(function(err, res) {
            if(err) return callback(err);
            response = res;
            done();
          });
        });
      });

      it('should return a 200 status code', function() {
        response.status.should.equal(200);
      });

      it('should return a json content-type header', function() {
        response.should.be.json;
      });

      it('should return an array', function() {
        var obj = JSON.parse(response.text);
        obj.should.be.an.instanceOf(Array);
        obj.length.should.equal(2);
      });

      it('should return properties', function() {
        var obj = JSON.parse(response.text)[0];
        obj.should.have.property('key');
        obj.should.have.property('value');
        obj.should.have.property('id');
      });
    });
  });
});