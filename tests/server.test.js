import { describe, it, expect, vi, beforeEach } from 'vitest'
import request from 'supertest'
import app from '../server.js'
import mongoose from 'mongoose'

// Mock database connection on mongoose
vi.spyOn(mongoose, 'connect').mockResolvedValue(null)

// Mock global fetch for AI integrations and dynamic certificates
const mockFetch = vi.fn().mockImplementation(() => {
  return Promise.resolve({
    ok: true,
    status: 200,
    headers: {
      get: (header) => {
        if (header.toLowerCase() === 'cache-control') return 'max-age=3600'
        return null
      }
    },
    json: async () => ({
      candidates: [{ content: { parts: [{ text: '{"questions": ["q1", "q2"], "question": "What stream?"}' }] } }],
      // Mock for certificate endpoints
      'kid-1': '-----BEGIN CERTIFICATE-----\nMII...\n-----END CERTIFICATE-----'
    }),
    text: async () => '{"questions": ["q1", "q2"], "question": "What stream?"}'
  })
})
global.fetch = mockFetch

describe('Skope Server Audit & Hardening Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.NODE_ENV = 'test'
  })

  describe('CORS Hardening Policy', () => {
    it('should allow requests from a configured safe origin', async () => {
      const response = await request(app)
        .post('/api/conversation-start')
        .set('Origin', 'http://localhost:5173')
        
      expect(response.headers['access-control-allow-origin']).toBe('http://localhost:5173')
    })

    it('should reject requests from an unauthorized malicious origin', async () => {
      const response = await request(app)
        .post('/api/conversation-start')
        .set('Origin', 'http://attacker.com')
        
      expect(response.headers['access-control-allow-origin']).toBeUndefined()
    })
  })

  describe('Zod Request Payload Validation', () => {
    it('should return 400 Bad Request when /api/adaptive-questions is missing required properties', async () => {
      const response = await request(app)
        .post('/api/adaptive-questions')
        .send({ answers: { q1: 'PCM' } }) // missing q2 and q3

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid request payload format')
      expect(response.body.details).toBeDefined()
    })

    it('should return 400 Bad Request when /api/next-question payload is empty', async () => {
      const response = await request(app)
        .post('/api/next-question')
        .send({}) // empty payload

      expect(response.status).toBe(400)
      expect(response.body.error).toBe('Invalid request payload format')
    })
  })

  describe('Security Headers', () => {
    it('should verify that Helmet security headers are present', async () => {
      const response = await request(app).post('/api/conversation-start')
      
      expect(response.headers['x-dns-prefetch-control']).toBe('off')
      expect(response.headers['x-frame-options']).toBe('SAMEORIGIN')
      expect(response.headers['x-content-type-options']).toBe('nosniff')
    })
  })

  describe('JWT Authentication Guardrails', () => {
    it('should deny access to /api/save-report if Authorization header is missing', async () => {
      const response = await request(app)
        .post('/api/save-report')
        .send({
          userId: 'test-uid',
          email: 'student@skope.ai',
          reportData: {}
        })

      expect(response.status).toBe(401)
      expect(response.body.error).toContain('Unauthorized')
    })

    it('should deny access to /api/get-report/:userId if Authorization header is missing', async () => {
      const response = await request(app)
        .get('/api/get-report/test-uid')

      expect(response.status).toBe(401)
      expect(response.body.error).toContain('Unauthorized')
    })

    it('should reject access to /api/get-report/:userId if authorization scheme is not Bearer', async () => {
      const response = await request(app)
        .get('/api/get-report/test-uid')
        .set('Authorization', 'Basic dGVzdC10b2tlbg==')

      expect(response.status).toBe(401)
      expect(response.body.error).toContain('Unauthorized')
    })
  })
})
