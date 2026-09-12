import { defineConfig } from '@prisma/config'
import { config } from 'dotenv'
import { join } from 'path'

config({ path: join(__dirname, '.env') })

export default defineConfig({
  datasource: {
    url: process.env.DATABASE_URL as string,
  }
})
