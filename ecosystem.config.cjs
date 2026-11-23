// PM2 ecosystem untuk VPS Linux.
// Jalankan: pm2 start ecosystem.config.cjs && pm2 save
// Web dan bot dikelola PM2 supaya hidup lagi setelah crash / reboot.
module.exports = {
  apps: [
    {
      name: "toko-web",
      script: "npm",
      args: "run start",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      env: {
        NODE_ENV: "production",
        PORT: "3000",
      },
    },
    {
      name: "toko-bot",
      script: "npm",
      args: "run bot",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      // Bot menulis bot_pid sendiri. Tombol "Start" di panel aman (deteksi
      // proses hidup), tapi untuk	stop/betulkan bot pakai perintah PM2:
      //   pm2 restart toko-bot   |   pm2 stop toko-bot
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
