var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var RESTAURANTS_COLLECTION = "restaurants";

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server.
mongodb.MongoClient.connect(process.env.MONGODB_URI, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

  // Initialize the app.
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });
});

// RESTAURANTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/restaurants"
 *    GET: finds all restaurants
 *    POST: creates a new restaurant
 */

app.get("/restaurants", function(req, res) {
  db.collection(RESTAURANTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get restaurants.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/restaurants", function(req, res) {
  var newRestaurant = req.body;
  newRestaurant.createDate = new Date();

  if (!(req.body.name)) {
    handleError(res, "Invalid user input", "Must provide a restaurane name.", 400);
  }

  db.collection(RESTAURANTS_COLLECTION).insertOne(newRestaurant, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new restaurant.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/restaurants/:id"
 *    GET: find restaurant by id
 *    PUT: update restaurant by id
 *    DELETE: deletes restaurant by id
 */

app.get("/restaurants/:id", function(req, res) {
  db.collection(RESTAURANTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get restaurant");
    } else {
      res.status(200).json(doc);
    }
  });
});

app.put("/restaurants/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(RESTAURANTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update restaurant");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/restaurants/:id", function(req, res) {
  db.collection(RESTAURANTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete restaurant");
    } else {
      res.status(204).end();
    }
  });
});
