module.exports = {
  apps : [{
    name: "cryptogama-server",
    script: "./server.js",
    instances: "2",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
