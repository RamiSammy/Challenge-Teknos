const controller = {};
const fs = require("fs");

//Emails
const folders = require("../../Modelos/folders.json");
const inbox = require("../../Modelos/inbox.json");

const inboxPath = "./Modelos/inbox.json";

controller.index = (req, res) => {
  res.status(200).send({
    message: "Funcionando",
  });
};

//Obtener los folders
controller.getFolder = (req, res) => {
  try {
    const usuario = req.params.usuario;
    res.status(200).send(folders.data);
  } catch (err) {
    console.log(err);
    res.status(500).send("No pudimos acceder a la carpeta");
  }
};

//Obtengo listado de mensajes filtado por los parametros
controller.GetMessagesList = (req, res) => {
  try {
    //Levanto los parametros para el filtro por query
    const from = req.query.from?.toLocaleLowerCase();
    const to = req.query.to?.toLocaleLowerCase();
    const subject = req.query.subject?.toLocaleLowerCase();

    //Recorro por cada email
    const mailFrom = inbox.data.filter((correo) => {
      //Levanto from.name y from.email del correo y verifico si esta incluido el from recibido como parametro
      const fromNameMail =
        correo.from.name?.toLocaleLowerCase().includes(from) ||
        correo.from.email?.toLocaleLowerCase().includes(from);

      //Levanto todos los nombres y mails de to y verifico si el to esta incluido
      const getAllName = correo.to
        .map((destinario) => {
          return (
            destinario.name?.toLowerCase().includes(to) ||
            destinario.email?.toLowerCase().includes(to)
          );
        })
        .some((elemento) => elemento == true);

      //Levanto el subject del correo y verifico si el subject recibido como parametro esta incluido
      const subjectMail = correo.subject?.toLocaleLowerCase().includes(subject);

      if (
        (!from || fromNameMail) &&
        (!to || getAllName) &&
        (!subject || subjectMail)
      ) {
        //Se encontro todos los parametros recibidos dentro del Email
        return correo;
      }
    });
    res.status(200).send(mailFrom);
  } catch (err) {
    console.log(err);
    res.status(500).send(err);
  }
};

//Message Create
controller.createMessages = (req, res) => {
  try {
    const usuario = req.params.usuario;

    //Mail recibido por body
    const mail = req.body;

    //Ver si mail es undefined o esta vacio
    if (!mail || Object.keys(mail).length === 0) {
      res.status(400).send("Mail vacio");
      return;
    }

    //Ver si el mail tiene from email y from nombre
    if (!mail.from?.email || !mail.from?.name) {
      res.status(400).send("No se envio Emisor");
      return;
    }

    const validoTo = mail.to
      ?.map((destinatario) => {
        //Ver si el mail tiene from email y from nombre
        if (!destinatario.name || !destinatario.email) {
          return false;
        } else {
          return true;
        }
      })
      .some((element) => element == true); //Si hay alguno valido, puedo guardar

    if (!validoTo) {
      res.status(400).send("No se envio Destinatario");
      return;
    }

    //Ver si tiene titulo el mail
    if (!mail.subject) {
      res.status(400).send("No se envio Asunto");
      return;
    }

    //Creo ID
    const id = Math.random().toString(16).slice(2);

    //Leo inbox
    let data = JSON.parse(fs.readFileSync(inboxPath));

    //Agrego mail nuevo y guardo
    mail.id = id;
    data.data.push(mail);
    fs.writeFileSync(inboxPath, JSON.stringify(data, null, 2));

    res.status(200).send(mail);
  } catch (err) {
    console.error(err);
  }
};

//DELETE Messages
controller.deleteMessage = (req, res) => {
  try {
    const usuario = req.params.usuario;

    //Levanto idMail que se quiere eliminarse por parametro
    const idMail = req.params.idMensaje;

    //Levanto inbox
    let data = JSON.parse(fs.readFileSync(inboxPath));

    let contador = 0;
    //Recorro cada correo y verifico si es el id que busco
    const dataNew = data.data.filter((correo) => {
      if (correo.id != idMail) {
        return correo;
      } else {
        //Encontre el mail que busco eliminar
        contador++;
      }
    });

    if (contador == 0) {
      //No se encontro ningun mail con el id recibido
      res.send("No se ha encontrado ningun mail");
    } else {
      //Guardo en el JSON con el mensaje eliminado
      fs.writeFileSync(inboxPath, JSON.stringify({ data: dataNew }, null, 2));
      res.status(200).send("Ok");
    }
    contador = 0;
  } catch (err) {
    console.log(err);
    res.status(500).send("Ocurrió un error en el servidor.");
  }
};

//Message File
controller.postFile = (req, res) => {
  try {
    // Verifico si se subio un archivo
    if (!req.file) {
      return res.status(400).send("No se seleccionó ningún archivo.");
    }

    //Leo archivo
    let data = fs.readFileSync(req.file.path, "utf8");

    //Borro archivo
    fs.unlink(req.file.path, (err) => {
      if (err) console.log(err);
      else {
        console.log("Deleted: " + req.file.originalname);
      }
    });

    res.status(200).send({ message: "Recibido correctamente", data });
  } catch (err) {
    res.status(500).send("Ocurrió un error en el servidor.");
  }
};

module.exports = controller;
