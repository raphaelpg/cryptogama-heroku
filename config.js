require('dotenv').config();

exports.config = {
		ROPSTENPH : process.env.ROPSTENPH,
    INFPROVIDER : process.env.INFPROVIDER,
    MONGO : process.env.MONGOCONNECT,
}