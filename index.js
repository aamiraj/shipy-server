const express = require("express");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000 || process.env.PORT;
const cors = require("cors");
require("dotenv").config();

app.use(cors());
//const data = require("./data.json");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ghnljed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function run() {
  try {
    const database = client.db("shipy-services");
    const servicesCollection = database.collection("services");
    const reviewsCollection = database.collection("reviews");

    app.get("/reviews", async (req, res) => {
      const query = req.query;
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/reviews/:id", async (req, res) => {
      const id = req.params.id;
      const query = { serviceId: id };
      const cursor = reviewsCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = ObjectId(id);
      const query = { _id: objectId };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    app.get("/services", async (req, res) => {
      const query = {};
      const cursor = servicesCollection.find(query);
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

run();

app.listen(port, () => {
  console.log(`Shipy app listening on port ${port}`);
});
