import assert from 'node:assert/strict'
import test from 'node:test'
import { createAppLifecycle } from './src/appLifecycle.ts'

test('open only mounts once until close', () => {
  let mounts = 0
  let unmounts = 0
  const lifecycle = createAppLifecycle(() => { mounts += 1 }, () => { unmounts += 1 })

  lifecycle.open()
  lifecycle.open()

  assert.equal(mounts, 1)
  assert.equal(unmounts, 0)
})

test('close unmounts and reopening mounts again', () => {
  let mounts = 0
  let unmounts = 0
  const lifecycle = createAppLifecycle(() => { mounts += 1 }, () => { unmounts += 1 })

  lifecycle.open()
  lifecycle.close()
  lifecycle.close()
  lifecycle.open()

  assert.equal(mounts, 2)
  assert.equal(unmounts, 1)
})
