const mongoose = require("mongoose");
const { DataBase_Name } = require("../constants.js");

const ConnectionDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.DataBaseURL}/${DataBase_Name}`);
        console.log(`Database connected successfully! ${connectionInstance.connection.host}`);
        console.log(`Database connected successfully! ${connectionInstance.connection.name}`);
    } catch (error) {
        console.log("Database connection failed!", error);
        process.exit(1)
    }
};

module.exports = ConnectionDB;
