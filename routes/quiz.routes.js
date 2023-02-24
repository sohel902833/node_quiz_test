const router = require("express").Router();
const quizController = require("../controller/quiz.controller");

router.post("/", quizController.createQuiz);
router.post("/v2", quizController.createFullQuiz);
router.put("/:quizId", quizController.editQuiz);
router.delete("/:quizId", quizController.deleteQuiz);
router.get("/", quizController.getAllQuiz);
router.get("/:quizId", quizController.getSingleQuiz);

module.exports = router;
