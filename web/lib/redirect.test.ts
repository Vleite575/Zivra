import { test } from 'node:test'
import assert from 'node:assert/strict'
import { safeRedirect } from './redirect.ts'

test('keeps same-origin paths', () => {
  assert.equal(safeRedirect('/feed'), '/feed')
  assert.equal(safeRedirect('/ana_teste?p=2'), '/ana_teste?p=2')
})

test('rejects external and protocol-relative targets', () => {
  for (const bad of ['//evil.com', '/\\evil.com', 'https://evil.com', 'javascript:alert(1)', '', null]) {
    assert.equal(safeRedirect(bad), '/feed')
  }
})
