const router = require("express").Router();
const { createContent, getAllContent, getAContent, deleteAContent, updateAContent } = require("../controller/contentController");
const { createUser, getAllUsers, getAUser, deleteAUser, logIn } = require("../controller/userController");
const {} = require("../utils/authentication");
const {} = require("../utils/authorization");


router.post("/User", createUser);
router.post("/Content/:id", createContent);
router.post("/Login", logIn);

router.get("/Content", getAllContent);
router.get("/User", getAllUsers);
router.get("/Content/:id", getAContent);
router.get("/User/:id", getAUser);

router.put("/Content/:id", updateAContent);

router.delete("/Content/:id", deleteAContent);
router.delete("/User/:id", deleteAUser);

module.exports = router;