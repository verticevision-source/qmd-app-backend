const bcrypt = require('bcryptjs');

const hash = async (password) => bcrypt.hash(password, 12);
const compare = async (password, hash) => bcrypt.compare(password, hash);

module.exports = { hash, compare };
