import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// @desc    Get leads with pagination and filtering
// @route   GET /api/leads
export const getLeads = async (req, res) => {
    // 1. Pagination Logic
    const page = parseInt(req.query.page) || 1; [cite: 52]
    const limit = parseInt(req.query.limit) || 20; [cite: 53]
    const skip = (page - 1) * limit;

    // 2. Filtering Logic
    const where = {}; // This object will be built dynamically
    const { email, company, city, status, source, score, is_qualified, created_at } = req.query;

    if (email) where.email = { contains: email, mode: 'insensitive' }; // 'contains' operator [cite: 59]
    if (company) where.company = { contains: company, mode: 'insensitive' };
    if (status) where.status = { in: status.split(',') }; // 'in' operator for enums [cite: 60]
    if (score) where.score = { gte: parseInt(score) }; // 'gt' (greater than or equal) operator [cite: 61]
    // ... add all other filter conditions here based on requirements [cite: 57-63]

    try {
        // 3. Database Query
        const leads = await prisma.lead.findMany({
            where, // Apply the constructed filter
            skip, // Apply pagination offset
            take: limit, // Apply pagination limit
            orderBy: { createdAt: 'desc' }, // Optional: sort by newest
        });

        const totalLeads = await prisma.lead.count({ where }); // Get total count for pagination metadata

        // 4. Send Response in required format 
        res.status(200).json({
            data: leads,
            page,
            limit,
            total: totalLeads,
            totalPages: Math.ceil(totalLeads / limit),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

// ... other CRUD functions (createLead, getLeadById, updateLead, deleteLead)
// Example for createLead:
export const createLead = async (req, res) => {
    // ... (get data from req.body)
    try {
        const lead = await prisma.lead.create({ data: { ...req.body, ownerId: req.user.id } });
        res.status(201).json(lead); // 201 Created for new resource [cite: 10]
    } catch (error) {
        res.status(400).json({ message: 'Invalid lead data' });
    }
}