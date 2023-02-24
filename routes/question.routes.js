const router = require("express").Router();
const questionController = require("../controller/question.controller");

router.post("/", questionController.createQuestion);

module.exports = router;
