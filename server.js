const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const MongoClient = require("mongodb").MongoClient;

//Body-parses must be placed before CRUD handlers!
app.use(bodyParser.urlencoded({ extended: true }));

//MongoDB setup to connect to DB
MongoClient.connect(
  //
  // ===================== USER NAME AND PASSWORD OF Mongo goes after srv:// ← here
  //
  "mongodb+srv://@cluster0.nbere0m.mongodb.net/?retryWrites=true&w=majority"
)
  .then((client) => {
    console.log("Connected to database");
    //'db' changes name of the database to 'star-wars-quotes'
    const db = client.db("star-wars-quotes");
    //Database collection of quotes
    const quotesCollection = db.collection("quotes");

    //Middlewares
    //This tells Express that EJS is used as template engine
    app.set("view-engine", "ejs");
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(express.static("public"));
    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      db.collection("quotes")
        .find()
        .toArray()
        .then((results) => {
          res.render("index.ejs", { quotes: results });
        })
        .catch((error) => console.error(error));
    });

    //express request handlers into MongoClient's
    app.post("/quotes", (req, res) => {
      //insertOne add items into MongoDB collection
      quotesCollection
        .insertOne(req.body)
        .then((result) => {
          res.redirect("/");
        })
        .catch((err) => console.error(err));
    });
    app.put("/quotes", (req, res) => {
      quotesCollection
        .findOneAndUpdate(
          { name: "Yoda" },
          {
            $set: {
              name: req.body.name,
              quote: req.body.quote,
            },
          },
          {
            upsert: true,
          }
        )
        .then((result) => {
          res.json("Success");
        })
        .catch((error) => console.error(error));
    });
    app.delete("/quotes", (req, res) => {
      quotesCollection
        .deleteOne({ name: req.body.name })
        .then((result) => {
          if (result.deletedCount === 0) {
            return res.json("No quote to delete");
          }
          res.json("Deleted Darth Vadar's quote");
        })
        .catch((error) => console.error(error));
    });
  })
  .catch((err) => console.error(err));

//PORT
app.listen(3000, function () {
  console.log("listening on 3000");
});
