import Pusher from "pusher";

let pusher;

// En entorno de test, exportar un stub para que no intente usar claves reales
if (process.env.NODE_ENV === "test") {
  pusher = {
    trigger: async () => {
      console.log("[TEST] pusher.trigger llamado");
      return true;
    },
  };
} else {
  pusher = new Pusher({
    appId: process.env.PUSHER_APP_ID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: process.env.PUSHER_CLUSTER,
    useTLS: true,
  });
}

export default pusher;