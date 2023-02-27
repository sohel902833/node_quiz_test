const { connection } = require("../db/db");

const createQuiz = async (req, res, next) => {
  try {
    const { quizName, description } = req.body;
    if (!quizName || !description) {
      return res.status(400).json({
        message: "Quiz Name And Description Required.",
      });
    }
    // data are valid now store into database
    //make a query using the input data
    const INSERT_QUIZ_QUERY = `INSERT INTO quizes(\`quizName\`, \`description\`) VALUES (\'${quizName}\',\'${description}\')`;
    const newQuiz = await connection.query(INSERT_QUIZ_QUERY);
    res.status(201).json({
      message: "Quiz Created Successfully.",
      meta: {
        quizId: newQuiz?.insertId,
        quizName,
        description,
      },
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      success: false,
    });
  }
};

const createFullQuiz = async (req, res, next) => {
  try {
    const { quizName, description, questions } = req.body;
    if (!quizName || !description || !questions) {
      return res.status(400).json({
        message: "Please Enter Required Field",
      });
    }

    const INSERT_QUIZ_QUERY = `INSERT INTO quizes(\`quizName\`, \`description\`) VALUES (\'${quizName}\',\'${description}\')`;
    const newQuiz = await connection.query(INSERT_QUIZ_QUERY);
    const quizId = newQuiz?.insertId;
    questions?.forEach(async (qs) => {
      const INSERT_QUESTION_QUERY = `INSERT INTO questions(\`quizId\`, \`question\`,\`mandatory\`) VALUES(\'${quizId}\',\'${qs?.question}\',\'${qs?.mandatory}\')`;
      const newQuestion = await connection.query(INSERT_QUESTION_QUERY);
      const questionId = newQuestion?.insertId;
      const optionLastQueries = qs?.options?.map(
        (option) =>
          `(\'${questionId}\',\'${option?.option}\',\'${option?.isCorrect}\')`
      );
      const INSERT_OPTIONS_QUERY =
        `INSERT INTO question_options(\`questionId\`, \`optionName\`,\`isCorrect\`) VALUES` +
        optionLastQueries?.join(",");

      const insertOptions = await connection.query(INSERT_OPTIONS_QUERY);
    });

    res.status(201).json({
      message: "Question Created Successfully.",
      meta: {
        quizId,
        quizName,
        description,
        questions,
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
const editQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const { quizName, description } = req.body;
    if (!quizName && !description) {
      return res.status(400).json({
        message: "Nothing Found For Update",
      });
    }

    //some upgrade info here
    const SELECT_PREV_QUIZ_QUERY = `SELECT * FROM quizes WHERE quizId=${quizId}`;
    const prevQuiz = await connection.query(SELECT_PREV_QUIZ_QUERY);
    if (prevQuiz?.length === 0) {
      return res.json({
        message: "No quiz found by this id",
      });
    }
    //prev quiz founded
    const updatedQuizName = quizName ? quizName : prevQuiz[0]?.quizName;
    const updatedDescription = description
      ? description
      : prevQuiz[0]?.description;

    const UPDATE_QUIZ_QUERY = `UPDATE quizes SET quizName=\'${updatedQuizName}\',description=\'${updatedDescription}\'  WHERE quizId=${quizId}`;

    const updateQuiz = await connection.query(UPDATE_QUIZ_QUERY);
    res.json({
      message: "Quiz Update Successful",
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      success: false,
    });
  }
};
const getAllQuiz = async (req, res, next) => {
  try {
    const SELECT_QUIZ_QUERY = `
     SELECT quizes.quizId, quizes.quizName, quizes.description, questions.questionId, questions.question, IF(questions.mandatory, 'true', 'false') mandatory, question_options.optionId,question_options.optionName, IF(question_options.isCorrect, 'true', 'false') isCorrect 
    FROM quizes
    JOIN questions ON quizes.quizId = questions.quizId
    JOIN question_options ON questions.questionId = question_options.questionId;
  `;

    const response = await connection.query(SELECT_QUIZ_QUERY);
    if (response?.length === 0) {
      return res?.status(404).json({
        message: "No Quiz Found,",
      });
    }
    let quizList = [];

    response?.forEach((quiz) => {
      const quizExists = quizList.findIndex(
        (qz) => qz?.quizId === quiz?.quizId
      );
      if (quizExists === -1) {
        let questionList = [];

        const allQuestions = response?.filter(
          (q) => q?.quizId === quiz?.quizId
        );

        allQuestions?.forEach((question) => {
          const questionExists = questionList.findIndex(
            (qs) => qs?.questionId === question?.questionId
          );
          if (questionExists === -1) {
            let optionList = [];
            const allOptions = response?.filter(
              (q) => q?.questionId === question?.questionId
            );
            allOptions?.forEach((option) => {
              const optionExists = optionList?.findIndex(
                (op) => op?.optionId === option?.optionId
              );
              if (optionExists === -1) {
                optionList.push({
                  optionId: option?.optionId,
                  option: option?.optionName,
                  isCorrect: option?.isCorrect === "true" ? true : false,
                });
              }
            });

            questionList.push({
              questionId: question?.questionId,
              mandatory: question?.mandatory === "true" ? true : false,
              question: question?.question,
              options: optionList,
            });
          }
        });

        quizList.push({
          quizId: quiz?.quizId,
          quizName: quiz?.quizName,
          description: quiz?.description,
          questions: questionList,
        });
      }
    });

    res.status(200).json({
      quizList,
    });
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      success: false,
    });
  }
};

const getSingleQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const SELECT_QUIZ_QUERY = `
    SELECT quizes.quizId, quizes.quizName, quizes.description, questions.questionId, questions.question, IF(questions.mandatory, 'true', 'false') mandatory, question_options.optionId,question_options.optionName, IF(question_options.isCorrect, 'true', 'false') isCorrect 
    FROM quizes
    JOIN questions ON quizes.quizId = questions.quizId
    JOIN question_options ON questions.questionId = question_options.questionId
    WHERE quizes.quizId=${quizId}
  `;

    const response = await connection.query(SELECT_QUIZ_QUERY);
    if (response?.length === 0) {
      return res?.status(404).json({
        message: "No Quiz Found,",
      });
    }
    let quizList = [];

    response?.forEach((quiz) => {
      const quizExists = quizList.findIndex(
        (qz) => qz?.quizId === quiz?.quizId
      );
      if (quizExists === -1) {
        let questionList = [];

        const allQuestions = response?.filter(
          (q) => q?.quizId === quiz?.quizId
        );

        allQuestions?.forEach((question) => {
          const questionExists = questionList.findIndex(
            (qs) => qs?.questionId === question?.questionId
          );
          if (questionExists === -1) {
            let optionList = [];
            const allOptions = response?.filter(
              (q) => q?.questionId === question?.questionId
            );
            allOptions?.forEach((option) => {
              const optionExists = optionList?.findIndex(
                (op) => op?.optionId === option?.optionId
              );
              if (optionExists === -1) {
                optionList.push({
                  optionId: option?.optionId,
                  option: option?.optionName,
                  isCorrect: option?.isCorrect === "true" ? true : false,
                });
              }
            });

            questionList.push({
              questionId: question?.questionId,
              mandatory: question?.mandatory === "true" ? true : false,
              question: question?.question,
              options: optionList,
            });
          }
        });

        quizList.push({
          quizId: quiz?.quizId,
          quizName: quiz?.quizName,
          description: quiz?.description,
          questions: questionList,
        });
      }
    });

    res.status(200).json(quizList[0]);
  } catch (err) {
    res.status(404).json({
      message: "Server Error Found",
      success: false,
    });
  }
};

const deleteQuiz = async (req, res, next) => {
  try {
    const quizId = req.params.quizId;
    const DELETE_QUIZ_QUERY = `DELETE FROM quizes WHERE quizId=${quizId}`;
    const deleteQuiz = await connection.query(DELETE_QUIZ_QUERY);
    res.status(200).json({
      message: "Quiz Deleted",
    });
  } catch (err) {
    console.log(err);
    res.status(404).json({
      message: "Server Error Found",
      success: false,
    });
  }
};

module.exports = {
  createQuiz,
  editQuiz,
  getAllQuiz,
  deleteQuiz,
  createFullQuiz,
  getSingleQuiz,
};
