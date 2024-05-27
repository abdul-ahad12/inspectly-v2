// healthcheck.ts
import { request } from 'http'
const options = {
  host: 'localhost',
  port: process.env.PORT || 3000,
  timeout: 2000,
}

const req = request(options, (res) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

req.on('error', () => process.exit(1))
req.end()
