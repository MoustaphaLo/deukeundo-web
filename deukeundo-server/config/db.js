
const mongoose = require('mongoose');

const MONGOURI = 'mongodb://localhost:27017/deukeundo';

const InitiateMongoServer = async() => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true
        });
        console.log("Connexion à la base de donnée réussie!");
    } catch (e) {
        console.log(e);
        throw e;
    }
};

module.exports = InitiateMongoServer;