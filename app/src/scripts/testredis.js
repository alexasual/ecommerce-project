const redisClient = require('./src/config/redis');

redisClient.set('test_key', 'test_value', (err, reply) => {
  if (err) {
    console.error('Error setting key in Redis:', err);
  } else {
    console.log('Set key in Redis:', reply);

    redisClient.get('test_key', (err, reply) => {
      if (err) {
        console.error('Error getting key from Redis:', err);
      } else {
        console.log('Got key from Redis:', reply);
      }

      redisClient.quit();
    });
  }
});