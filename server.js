const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const { connection, connectDb, createTables } = require("./db/db");
const util = require("util");
//routers
const quizRouter = require("./routes/quiz.routes");
const questionRouter = require("./routes/question.routes");

// const {createTables} = require('./connection/createTables');

const app = express();
app.use(cors());
app.use(express.json());
dotenv.config();

connection.query = util.promisify(connection.query).bind(connection);
connectDb();
createTables();

app.use("/api/quiz", quizRouter);
app.use("/api/question", questionRouter);

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
