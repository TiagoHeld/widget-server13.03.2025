import { fastify } from 'fastify'
import { fastifyCors } from '@fastify/cors'
import { fastifySwaggerUi } from '@fastify/swagger-ui'
import {
  hasZodFastifySchemaValidationErrors,
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod'
import { uploadImageRoute } from './routes/upload-image'
import fastifyMultipart from '@fastify/multipart'
import fastifySwagger from '@fastify/swagger'
import { transformSwaggerSchema } from './routes/transform-swagger-schema'
import { getUploadsRoute } from './routes/get-uploads'
import { exportUploadsRoute } from './routes/export-uploads'

//serialicao  validando manipulando dados de saida

// validacao manipulando validando dados de ntarada

const server = fastify()

server.setValidatorCompiler(validatorCompiler)
server.setSerializerCompiler(serializerCompiler)

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: 'Validation error.',
      issues: error.validation,
    })
  }

  console.error(error)

  return reply.status(500).send({ message: 'Internal server error.' })
})

server.register(fastifyCors, { origin: '*' })

server.register(fastifyMultipart)
server.register(fastifySwagger, {
  openapi: {
    info: {
      title: 'Upload Server',
      version: '1.0.0',
    },
  },
  transform: transformSwaggerSchema,
})

server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
})

server.register(uploadImageRoute)
server.register(getUploadsRoute)
server.register(exportUploadsRoute)

server.listen({ port: 3333, host: '0.0.0.0' }).then(() => {
  console.log('HTTP server running!')
})
