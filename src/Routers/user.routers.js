const { Router } = require('express')
const { registerUser } = require('../Controllers/user.controllers.js')

const router = Router()
router.route('/register').post(registerUser)



// export default router;
module.exports = router; 