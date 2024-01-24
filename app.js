var express = require("express");

var app = express();
app.use(express.json());

var port = 3000;

//ROUTE
const routes = require("./src/routes/index.routes");
app.use("/", routes);

app.listen(port, function () {
  console.log(
    `Servidor corriendo en el puerto ${port} -> http://localhost:${port}/`
  );
});
