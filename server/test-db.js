const mongoose = require('mongoose');

console.log('Testing MongoDB Atlas connection...');

mongoose.connect('mongodb+srv://aaryanbindage_db_user:MosteSecureSire@praise-me-please.kle7zpq.mongodb.net/praise-portal')
  .then(() => {
    console.log('✅ SUCCESS: MongoDB Atlas connected!');
    process.exit(0);
  })
  .catch(err => {
    console.log('❌ ERROR:', err.message);
    process.exit(1);
  });
