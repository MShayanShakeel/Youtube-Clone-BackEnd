const { Router } = require('express')
const { registerUser, userLogin, userLogOut, refreshAcccessToken } = require('../Controllers/user.controllers.js');
const upload = require('../Middleware/multer.Middleware.js');
const { jwtVerification } = require('../Middleware/auth.Middleware.js');

const router = Router()
router.route('/register').post(upload, registerUser);

// Login Routes 
router.route('/login').post(userLogin)

// Auth Routes 
router.route('/logout').post(jwtVerification, userLogOut);


router.route('/refreshToken').post(refreshAcccessToken);




// export default router;
module.exports = router;