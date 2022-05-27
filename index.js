import * as Fastify from 'fastify'
import * as FastifyStatic from '@fastify/static'
import fs from 'fs'
import path from 'path'
import Cocktail  from './cocktail.js'
import { fileURLToPath } from 'url'

import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify.fastify({ logger: true })

fastify.register(FastifyStatic, {
  root: path.join(__dirname, 'static'),
  prefix: '/static/', // optional: default '/'
})

// second plugin
fastify.register(FastifyStatic, {
  root: path.join(__dirname, 'node_modules'),
  prefix: '/scripts/',
  decorateReply: false // the reply decorator has been added by the first plugin registration
})

/*
fastify.decorateReply('sendFile', function(filename) {
  const stream = fs.createReadStream(filename)
  this.type('text/html').send(stream)
})*/

fastify.route({
  method: 'GET',
  url: '/',
  handler: async (request, reply) => {
    reply.sendFile('./index.html')
  }
})

fastify.route({
  method: 'POST',
  url: '/',
  schema: {
    body: {
      type: 'object',
      required: [
          'filename',
          'url',
          'canvases'
      ],
      properties: {
        filename: { type: 'string' },
        url: { type: 'string' },
        canvases: { type: 'string' },
      }
    },
  },
  handler: async (request, reply) => {
    const url = request.body.url
    const filename = request.body.filename
    const canvases = Array.isArray(request.body.canvases) ? request.body.canvases : JSON.parse(request.body.canvases)

    const stream = await Cocktail(url, canvases, filename)
    reply.header("Access-Control-Allow-Origin", "*");
    reply.header('Content-Disposition', `attachment; filename=${filename}.pdf`);
    reply.header('Content-Length', stream.bytesRead);
    reply.type('application/octet-stream');
    reply.send(stream);
  }
})

const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()