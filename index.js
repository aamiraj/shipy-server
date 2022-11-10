const express = require("express");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();
const port = 5000 || process.env.PORT;
const cors = require("cors");
require("dotenv").config();

//console.log(require("crypto").randomBytes(64).toString("hex"));

app.use(cors());
app.use(express.json());
//const data = require("./data.json");

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.ghnljed.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

function sortByDate(a, b) {
  // Turn your strings into dates, and then subtract them
  // to get a value that is either negative, positive, or zero.
  return new Date(b.date) - new Date(a.date);
}

async function run() {
  try {
    const database = client.db("shipy-services");
    const servicesCollection = database.collection("services");
    const reviewsCollection = database.collection("reviews");

    app.post("/jwt", (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "1d",
      });
      res.send({ token });
    });

    app.post("/add-service", async (req, res) => {
      const doc = req.body;
      //console.log(doc);
      const result = await servicesCollection.insertOne(doc);
      console.log(result);
      res.send(result);
    });

    app.post("/review", async (req, res) => {
      const doc = req.body;
      //console.log(doc);
      const result = await reviewsCollection.insertOne(doc);
      res.send(result);
    });

    app.delete("/my-reviews/:id", verifyJWT, async (req, res) => {
      const id = req.params.id;
      const objectId = ObjectId(id);
      const query = { _id: objectId };
      const result = await reviewsCollection.deleteOne(query);
      res.send(result);
    });

    app.get("/my-reviews", verifyJWT, async (req, res) => {
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
      const sortedByDate = result.sort(sortByDate);
      //console.log(sortedByDate);
      res.send(sortedByDate);
    });

    app.get("/services/:id", async (req, res) => {
      const id = req.params.id;
      const objectId = ObjectId(id);
      const query = { _id: objectId };
      const service = await servicesCollection.findOne(query);
      res.send(service);
    });

    app.get("/services", async (req, res) => {
      const limit = parseInt(req.query.limit);
      const query = {};
      let cursor;
      if (limit) {
        cursor = servicesCollection.find(query).limit(limit);
      } else {
        cursor = servicesCollection.find(query);
      }
      const result = await cursor.toArray();
      res.send(result);
    });
  } finally {
  }
}

run();

app.get("/", (req, res) => {
  res.send("Server is running...");
});
app.listen(port, () => {
  console.log(`Shipy app listening on port ${port}`);
});
