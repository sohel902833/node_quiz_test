const mysql = require("mysql");
const dotenv = require("dotenv");
dotenv.config();
const connectionData = {
  host: process.env.HOST_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
};
let connection = mysql.createConnection(connectionData, {
  multipleStatements: true,
});

const connectDb = () => {
  connection.connect(function (err) {
    if (err) {
      console.log("Database Connection Failed");
    } else {
      console.log("Database Connected!");
    }
  });
};

const createTables = async () => {
  const CREATE_QUIZ_TABLE_QUERY = `
                 CREATE TABLE if not exists quizes(
                     quizId INT(10) PRIMARY KEY AUTO_INCREMENT,
                     quizName varchar(50) NOT NULL,
                     description varchar(200) NOT NULL
                     )`;
  const CREATE_QUESTIONS_TABLE_QUERY = `
                 CREATE TABLE if not exists questions(
                     questionId INT(10) PRIMARY KEY AUTO_INCREMENT,
                     quizId INT(10) NOT NULL,
                     question varchar(200) NOT NULL,
                     mandatory BOOLEAN,
                     FOREIGN KEY (quizId) REFERENCES quizes(quizId)
                     )`;
  const CREATE_OPTIONS_TABLE_QUERY = `
                 CREATE TABLE if not exists question_options(
                     optionId INT(10) PRIMARY KEY AUTO_INCREMENT,
                     questionId INT(10) NOT NULL,
                     option varchar(200) NOT NULL,
                     isCorrect BOOLEAN,
                     FOREIGN KEY (questionId) REFERENCES questions(questionId)
                     )`;

  try {
    const quizTable = await connection.query(CREATE_QUIZ_TABLE_QUERY);
    const questionTable = await connection.query(CREATE_QUESTIONS_TABLE_QUERY);
    const optionTable = await connection.query(CREATE_OPTIONS_TABLE_QUERY);
  } catch (err) {
    console.log("Table Create Failed");
  }
};

module.exports = {
  connection,
  connectDb,
  createTables,
};
