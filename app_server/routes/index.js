var express = require('express');
var router = express.Router();
var abc = require('../controllers/abc')
/* GET home page. */

router.get('/', abc.homepageController);
module.exports = router;
