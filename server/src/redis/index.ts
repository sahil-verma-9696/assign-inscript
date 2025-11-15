import { createClient } from "redis";

const redisClient = createClient({
  username: "default",
  // eslint-disable-next-line n/no-process-env
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: "redis-14494.c305.ap-south-1-1.ec2.cloud.redislabs.com",
    port: 14494,
  },
});

redisClient.on("error", (err) => console.log("Redis Client Error", err));

export default redisClient;


