const asyncHandler = require("../Utils/asyncHandler.js");


const registerUser = asyncHandler(async (req, res) => {
    res.status(200).json({
        message: "ok"
    })
})
// export { registerUser, }
module.exports = { registerUser };

