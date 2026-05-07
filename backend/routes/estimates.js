const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/estimateController');

router.get('/',              controller.getAll);
router.get('/:id',           controller.getOne);
router.post('/',             controller.create);
router.put('/:id',           controller.update);
router.delete('/:id',        controller.delete);
router.post('/:id/convert',  controller.convert);

module.exports = router;
