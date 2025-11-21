module.exports = {
  apps: [{
    name: 'codingmantra-upscaler-api',
    script: './dist/index.js', // or './dist/app.js' if that's your entry
    instances: 1,   // or >1 for more concurrency if you have enough RAM/CPU
    exec_mode: 'fork',
    node_args: '--max-old-space-size=8192', // 8GB heap for Node.js process
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    max_memory_restart: '12G', // Restarts if process uses >12GB
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};