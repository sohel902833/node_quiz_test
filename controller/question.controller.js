const { connection } = require("../db/db");

const createQuestion = async (req, res, next) => {
  try {
    const { quizId, question, mandatory, options } = req.body;
    if (!quizId || !question) {
      return res.status(400).json({
        message: "Please Enter Required Field",
      });
    }
    if (mandatory !== 0 && mandatory !== 1) {
      return res.status(400).json({
        message: "Mandatory Field Should be 0 or 1",
      });
    }
    // data are valid now store into database
    //make a query using the input data
    const INSERT_QUESTION_QUERY = `INSERT INTO questions(\`quizId\`, \`question\`,\`mandatory\`) VALUES(\'${quizId}\',\'${question}\',\'${mandatory}\')`;
    const newQuestion = await connection.query(INSERT_QUESTION_QUERY);
    const questionId = newQuestion?.insertId;
    const optionLastQueries = options?.map(
      (option) =>
        `(\'${questionId}\',\'${option?.option}\',\'${option?.isCorrect}\')`
    );
    const INSERT_OPTIONS_QUERY =
      `INSERT INTO question_options(\`questionId\`, \`optionName\`,\`isCorrect\`) VALUES` +
      optionLastQueries?.join(",");

    const insertOptions = await connection.query(INSERT_OPTIONS_QUERY);

    res.status(201).json({
      message: "Question Created Successfully.",
      meta: {
        questionId: questionId,
        quizId,
        question,
        mandatory,
        options,
      },
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Server Error Found",
      error: err?.message,
      success: false,
    });
  }
};

module.exports = {
  createQuestion,
};
