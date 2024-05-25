import { S3 } from '@aws-sdk/client-s3'

const s3Client = new S3({
  forcePathStyle: false, // Configures to use subdomain/virtual calling format.
  endpoint: 'https://files-mechanic.blr1.digitaloceanspaces.com',
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.DOACCESS_KEY,
    secretAccessKey: process.env.DOSECRET_KEY,
  },
})

export { s3Client }
