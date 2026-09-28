import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { customerService, ticketService } from './server/customerService.js';
import { hindsightService } from './server/hindsightService.js';
import { aiService } from './server/aiService.js';
import { analyticsService } from './server/analyticsService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT: number = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json());

  // API Endpoints
  // 1. Customers
  app.get('/api/customers', (req, res) => {
    try {
      const customers = customerService.getAll();
      res.json({ customers });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/customers/:id', (req, res) => {
    try {
      const customer = customerService.getById(req.params.id);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }
      const memories = hindsightService.getAllMemoriesForCustomer(customer.id);
      const timeline = hindsightService.getTimelineForCustomer(customer.id);
      const tickets = ticketService.getByCustomer(customer.id);
      res.json({ customer, memories, timeline, tickets });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 2. Chat with SupportMind AI Agent
  app.post('/api/chat', async (req, res) => {
    try {
      const { customerId, message, conversationHistory = [], memoryEnabled = true } = req.body;

      if (!customerId || !message) {
        return res.status(400).json({ error: 'customerId and message are required' });
      }

      const customer = customerService.getById(customerId);
      if (!customer) {
        return res.status(404).json({ error: 'Customer not found' });
      }

      // Memory retrieval step: examine current message and conversation context
      let retrievedMemories: any[] = [];
      if (memoryEnabled) {
        const queryWithContext = [
          message,
          ...conversationHistory.slice(-2).map((c: any) => c.content || ''),
        ].join(' ');
        retrievedMemories = hindsightService.retrieveRelevantMemories(customerId, queryWithContext);
      }

      // Call AI Service (Gemini API or intelligent deterministic fallback)
      const aiResult = await aiService.generateSupportResponse({
        customer,
        userMessage: message,
        conversationHistory,
        memoryEnabled,
        retrievedMemories,
      });

      // Update interaction count
      customerService.incrementInteractions(customerId);
      analyticsService.recordConversation();

      // Memory storage step: If memory storage proposal triggered, store in Hindsight
      let storedMemory = null;
      if (aiResult.memoryStoredProposal) {
        storedMemory = hindsightService.storeMemory(customerId, {
          category: aiResult.memoryStoredProposal.category,
          title: aiResult.memoryStoredProposal.title,
          summary: aiResult.memoryStoredProposal.summary,
          solution: aiResult.memoryStoredProposal.solution,
          outcome: aiResult.memoryStoredProposal.outcome,
          device: customer.device,
          tags: aiResult.memoryStoredProposal.tags,
        });
      }

      res.json({
        reply: aiResult.reply,
        memoriesUsed: memoryEnabled ? retrievedMemories : [],
        memoryStored: storedMemory,
        customerId: customer.id,
        timestamp: new Date().toISOString(),
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.status(500).json({
        error: 'Memory service temporarily unavailable',
        details: err.message,
      });
    }
  });

  // 3. Customer Memories & Timeline
  app.get('/api/customers/:id/memories', (req, res) => {
    try {
      const memories = hindsightService.getAllMemoriesForCustomer(req.params.id);
      res.json({ memories });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/customers/:id/memories', (req, res) => {
    try {
      const memory = hindsightService.storeMemory(req.params.id, req.body);
      res.status(201).json({ memory });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/customers/:id/timeline', (req, res) => {
    try {
      const timeline = hindsightService.getTimelineForCustomer(req.params.id);
      res.json({ timeline });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 4. Tickets
  app.get('/api/tickets', (req, res) => {
    try {
      const tickets = ticketService.getAll();
      res.json({ tickets });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/tickets', (req, res) => {
    try {
      const newTicket = ticketService.create(req.body);
      customerService.incrementOpenTickets(req.body.customerId);
      res.status(201).json({ ticket: newTicket });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch('/api/tickets/:id', (req, res) => {
    try {
      const { status } = req.body;
      const updated = ticketService.updateStatus(req.params.id, status);
      if (!updated) {
        return res.status(404).json({ error: 'Ticket not found' });
      }
      if (status === 'Resolved') {
        customerService.decrementOpenTickets(updated.customerId);
      }
      res.json({ ticket: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 5. Analytics
  app.get('/api/analytics', (req, res) => {
    try {
      const analytics = analyticsService.getMetrics();
      res.json({ analytics });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 6. System Status
  app.get('/api/hindsight/status', (req, res) => {
    try {
      const status = hindsightService.getStatus();
      res.json({ status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/ai/status', (req, res) => {
    try {
      const status = aiService.getStatus();
      res.json({ status });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 7. Reset Demo Data
  app.post('/api/demo/reset', (req, res) => {
    try {
      customerService.reset();
      ticketService.reset();
      hindsightService.reset();
      analyticsService.reset();
      res.json({ success: true, message: 'All demo memory namespaces, customers, and tickets reset to baseline.' });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Serve Frontend
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SupportMind server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
