import * as Fastify from "fastify";
import * as FastifyStatic from "@fastify/static";
import * as FastifyWS from "@fastify/websocket";
import createHash from "hash-generator";
import Cocktail from "./cocktail.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify.fastify({ logger: true });

const PORT = process.env.PORT || 5000;

fastify.register(FastifyWS)

const clients = []
fastify.get('/errors', { websocket: true }, (connection, req) => {
  clients.push(connection)
});

fastify.register(FastifyStatic, {
  root: path.join(__dirname, "static"),
  prefix: "/static/", // optional: default '/'
});

fastify.register(FastifyStatic, {
  root: path.join(__dirname, "node_modules"),
  prefix: "/scripts/",
  decorateReply: false, // the reply decorator has been added by the first plugin registration
});

fastify.route({
  method: "GET",
  url: "/",
  handler: async (request, reply) => {
    reply.sendFile("./index.html");
  },
});

fastify.route({
  method: "POST",
  url: "/",
  schema: {
    body: {
      type: "object",
      required: ["filename", "url", "canvases"],
      properties: {
        filename: { type: "string" },
        url: { type: "string" },
        canvases: { type: "string" },
      },
    },
  },
  handler: async (request, reply) => {
    const url = request.body.url;
    const filename = request.body.filename;
    const canvases = Array.isArray(request.body.canvases)
      ? request.body.canvases
      : JSON.parse(request.body.canvases);

    const hash = createHash(16);
    const hashFilename = `${hash}${filename}.pdf`;

    Cocktail(url, canvases, filename, hashFilename)
    .then((doc) => {
      console.log("Done request for file: ", hashFilename);
      doc.pipe(
        fs.createWriteStream(path.join(__dirname, `static/${hashFilename}`))
      );

      const cashFilename = path.join(__dirname, `static/${hashFilename}.json`)
      fs.unlink(cashFilename, (err) => {
        if (err) console.log(err);
        else {
          console.log("Deleted cache file: ", cashFilename)
        }
      });
    });

    reply.send({hashFilename});
  },
});

fastify.route({
  method: "GET",
  url: "/file/:hashFilename",
  handler: async (request, reply) => {
    const hashFilename = request.params.hashFilename
    reply.sendFile(`./${hashFilename}`)
  },
  onResponse: (request, reply, done) => {
    if (reply.statusCode === 200) {
      const hashFilename = path.join(__dirname, `static/${request.params.hashFilename}`)
      fs.unlink(hashFilename, (err) => {
        if (err) console.log(err);
        else {
          console.log("Deleted pdf file: ", hashFilename);
        }
      })
    }
    done();
  },
});

fastify.route({
  method: "GET",
  url: "/progress/:hashFilename",
  handler: async (request, reply) => {
    const hashFilename = request.params.hashFilename
    reply.sendFile(`./${hashFilename}.json`)
  },
})

const start = async () => {
  try {
    await fastify.listen(PORT);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}
start()

// Handling app out-of-memory errors
function exitHandler(code) {
  console.log('About to exit with code:', code)
  for(let connection of clients) {
    connection.socket.send("There was a problem with the server.");
    //Please try generating a smaller file.
  }
  process.exit(code)
}

//do something when app is closing
process.on('exit', exitHandler)

//catches ctrl+c event
process.on('SIGINT', exitHandler);

// catches "kill pid" (for example: nodemon restart)
process.on('SIGUSR1', exitHandler);
process.on('SIGUSR2', exitHandler);

//catches uncaught exceptions
process.on('uncaughtException', exitHandler);
