// const Redis = require("ioredis");
// // const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379");
// console.log(process.env.REDIS_URL)
// const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
//   password: process.env.REDIS_TOKEN,
//   tls: {}
// });

// module.exports = redis;

const Redis = require("ioredis");
// console.log(process.env.REDIS_URL)

const redis = new Redis(process.env.REDIS_URL, {
  tls: {}, // required for Upstash SSL
  password: process.env.REDIS_TOKEN
});

redis.on("connect", () => console.log("✔ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis Error:", err));

module.exports = redis;
 