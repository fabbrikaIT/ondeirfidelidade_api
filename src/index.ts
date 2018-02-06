import app from "./config/server";
import * as http from "http";

const port = process.env.APP_PORT || 3000;
 // const port  = process.env.PORT || 80;

app.set('port', port);

const server = http.createServer(app);

server.listen(port);
server.on('listening', onListening);
// app.listen(port, err => {
//     if (err) {
//         return console.log(err);
//     }

//     return console.log(`server is listening on ${port}`);
// });

function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
      ? 'pipe ' + addr
      : 'port ' + addr.port;
    console.log('Listening on ' + bind);
  }
