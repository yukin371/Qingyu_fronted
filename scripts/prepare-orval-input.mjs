#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import YAML from 'yaml'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const root = path.resolve(__dirname, '..')

const sourcePath = path.resolve(root, '../Qingyu_backend/docs/api/swagger.yaml')
const outputDir = path.resolve(root, '.orval')
const outputPath = path.join(outputDir, 'swagger.yaml')

function normalizePathTemplate(pathname) {
  return pathname.replace(/:([A-Za-z_][A-Za-z0-9_]*)/g, '{$1}')
}

function normalizeOperationParameters(operation) {
  if (!operation || !Array.isArray(operation.parameters)) {
    return operation
  }

  operation.parameters = operation.parameters.map((parameter) => {
    if (!parameter || parameter.in !== 'path') {
      return parameter
    }

    return {
      ...parameter,
      required: true,
    }
  })

  return operation
}

function main() {
  if (!fs.existsSync(sourcePath)) {
    throw new Error(`Swagger source not found: ${sourcePath}`)
  }

  const source = fs.readFileSync(sourcePath, 'utf8')
  const spec = YAML.parse(source)

  if (!spec?.paths || typeof spec.paths !== 'object') {
    throw new Error(`Invalid swagger spec: missing paths in ${sourcePath}`)
  }

  const normalizedPaths = {}

  for (const [pathname, pathItem] of Object.entries(spec.paths)) {
    if (!pathname.startsWith('/api/v1/')) {
      continue
    }

    const normalizedPathname = normalizePathTemplate(pathname)
    const normalizedPathItem = { ...pathItem }

    for (const method of ['get', 'post', 'put', 'patch', 'delete', 'options', 'head']) {
      if (normalizedPathItem[method]) {
        normalizedPathItem[method] = normalizeOperationParameters({ ...normalizedPathItem[method] })
      }
    }

    normalizedPaths[normalizedPathname] = normalizedPathItem
  }

  spec.paths = normalizedPaths

  fs.mkdirSync(outputDir, { recursive: true })
  fs.writeFileSync(outputPath, YAML.stringify(spec), 'utf8')

  console.log(`Prepared Orval input: ${path.relative(root, outputPath)}`)
}

main()
