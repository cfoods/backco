const express      = require('express');
const router       = express.Router();
const controller   = require('../controllers/invoiceController');
const pdfController = require('../controllers/pdfController');

router.get('/next-number',  controller.nextNumber);
router.get('/:id/pdf',      pdfController.generatePDF);
router.get('/',             controller.getAll);
router.get('/:id',          controller.getOne);
router.post('/',            controller.create);
router.put('/:id',          controller.update);
router.delete('/:id',       controller.delete);

module.exports = router;
