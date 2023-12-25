require("dotenv").config();
const express = require("express");

const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");

// middleWare
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ig5pitp.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    const database = client.db("toDoListDB");
    const toDoListCollection = database.collection("toDoLists");

    app.get("/toDoLists", async (req, res) => {
      let query = {};
      if (req.query?.email) {
        query = { email: req.query?.email };
        const cursor = toDoListCollection.find(query);
        const result = await cursor.toArray();
        res.send(result);
      }
    });

    app.get("/toDoLists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toDoListCollection.findOne(query);
      res.send(result);
    });
    app.post("/toDoLists", async (req, res) => {
      const toDoLists = req.body;
      const result = await toDoListCollection.insertOne(toDoLists);
      res.send(result);
      console.log(toDoLists);
    });

    app.put("/toDoLists/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateTodoLists = req.body;
      console.log(updateTodoLists);
      const updatedTodoList = {
        $set: {
          title: updateTodoLists.title,
          description: updateTodoLists.description,
          deadline: updateTodoLists.deadline,
          priority: updateTodoLists.priority,
        },
      };

      try {
        const result = await toDoListCollection.updateOne(
          filter,
          updatedTodoList,
          options
        );
        res.send(result);
      } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).send("Internal Server Error");
      }
    });

    app.delete("/toDoLists/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await toDoListCollection.deleteOne(query);
      res.send(result);
    });
    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port, () => {
  console.log(`Example app listening on post ${port}`);
});
