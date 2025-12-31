import { jest, describe, it, expect, afterEach } from '@jest/globals';

// Mock nanoid to avoid ESM issues
jest.mock('nanoid', () => ({
    nanoid: () => 'mocked-id',
}));

import { ticketService } from '../lib/tickets.js';
import { db } from '../lib/db/index.js';

// Mock the database
jest.mock('../lib/db/index.js', () => ({
    db: {
        select: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        groupBy: jest.fn(),
    },
}));

describe('Analytics Service - Stats Overview', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return ticket counts grouped by status and priority', async () => {
        const mockByStatus = [
            { status: 'OPEN', count: 10 },
            { status: 'IN_PROGRESS', count: 5 },
        ];
        const mockByPriority = [
            { priority: 'HIGH', count: 3 },
            { priority: 'MEDIUM', count: 12 },
        ];

        // Setup mocks
        (db.select as any).mockImplementationOnce(() => ({
            from: jest.fn().mockReturnThis(),
            groupBy: (jest.fn() as any).mockResolvedValueOnce(mockByStatus),
        }));

        (db.select as any).mockImplementationOnce(() => ({
            from: jest.fn().mockReturnThis(),
            groupBy: (jest.fn() as any).mockResolvedValueOnce(mockByPriority),
        }));

        const stats = await ticketService.getStatsOverview();

        expect(stats).toEqual({
            byStatus: mockByStatus,
            byPriority: mockByPriority,
        });

        expect(db.select).toHaveBeenCalledTimes(2);
    });
});
