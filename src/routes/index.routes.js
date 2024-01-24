const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

const controller = require("../controllers/index.controllers");

router.get("/", controller.index);

//GET Folders
router.get("/:usuario/api/folders", controller.getFolder);

//GET Messages List
router.get("/:usuario/api/messages/important", controller.GetMessagesList);

//POST Message Create
router.post("/:usuario/api/messages/important", controller.createMessages);

//DELETE Messages
router.delete(
  "/:usuario/api/messages/important/:idMensaje",
  controller.deleteMessage
);

//POST Message File
router.post(
  "/:usuario/api/messages/important/file",
  upload.single("txt"),
  controller.postFile
);

module.exports = router;
