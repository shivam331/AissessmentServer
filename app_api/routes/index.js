var express = require('express');
var router = express.Router();
var fetchquestions = require('../controllers/fetchquestions')
var filterquestions = require('../controllers/filter')
/* GET home page. */

router.get('/question/:book_id/:page_num', fetchquestions.questionsList);
router.get('/bookname/:book_id', fetchquestions.bookName);
router.get('/questiontypes/:book_id', fetchquestions.questionTypes);
router.get('/chapter/:book_id',fetchquestions.chapters)
router.get('/filter/:book_id/:chapter_name/:type',filterquestions.chapterNames);
module.exports = router;
