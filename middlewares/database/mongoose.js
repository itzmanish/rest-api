const mongoose = require('mongoose');
const { config } = require('./../../config.js');

mongoose.Promise = global.Promise;
mongoose
  .connect(config.DBURL, { useNewUrlParser: true })
  .then(() => console.log('Database Connected'))
  .catch(e => {
    console.log(e);
  });

module.exports = mongoose;
