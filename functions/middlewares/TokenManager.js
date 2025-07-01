let momoToken = null;

function setMomoToken(token) {
 momoToken = token;
}

function getMomoToken() {
 return momoToken;
}

module.exports = {
 setMomoToken,
 getMomoToken,
};