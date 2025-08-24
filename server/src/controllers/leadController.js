import { prisma } from '../lib/prisma.js';

// @desc    Get leads with pagination and filtering
// @route   GET /api/leads
export const getLeads = async (req, res) => {
  const page = Math.max(parseInt(req.query.page) || 1, 1);
  const rawLimit = parseInt(req.query.limit) || 20;
  const limit = Math.min(Math.max(rawLimit, 1), 100);
  const skip = (page - 1) * limit;

  const {
    email,
    company,
    city,
    status, // comma separated string
    source, // comma separated string
    scoreMin,
    scoreMax,
    leadValueMin,
    leadValueMax,
    createdFrom,
    createdTo,
    lastActivityFrom,
    lastActivityTo,
    isQualified,
  } = req.query;

  const where = { ownerId: req.user.id };

  if (email) where.email = { contains: String(email), mode: 'insensitive' };
  if (company) where.company = { contains: String(company), mode: 'insensitive' };
  if (city) where.city = { contains: String(city), mode: 'insensitive' };
  if (status) where.status = { in: String(status).split(',').map((s) => s.trim()).filter(Boolean) };
  if (source) where.source = { in: String(source).split(',').map((s) => s.trim()).filter(Boolean) };

  // Numbers
  const scoreNum = {};
  if (scoreMin !== undefined) scoreNum.gte = parseInt(scoreMin);
  if (scoreMax !== undefined) scoreNum.lte = parseInt(scoreMax);
  if (Object.keys(scoreNum).length) where.score = scoreNum;

  const valueNum = {};
  if (leadValueMin !== undefined) valueNum.gte = parseFloat(leadValueMin);
  if (leadValueMax !== undefined) valueNum.lte = parseFloat(leadValueMax);
  if (Object.keys(valueNum).length) where.leadValue = valueNum;

  // Dates
  const createdDate = {};
  if (createdFrom) createdDate.gte = new Date(createdFrom);
  if (createdTo) createdDate.lte = new Date(createdTo);
  if (Object.keys(createdDate).length) where.createdAt = createdDate;

  const lastActivityDate = {};
  if (lastActivityFrom) lastActivityDate.gte = new Date(lastActivityFrom);
  if (lastActivityTo) lastActivityDate.lte = new Date(lastActivityTo);
  if (Object.keys(lastActivityDate).length) where.lastActivityAt = lastActivityDate;

  if (isQualified !== undefined) {
    const val = String(isQualified).toLowerCase();
    if (val === 'true' || val === 'false') where.isQualified = val === 'true';
  }

  try {
    const [leads, totalLeads] = await Promise.all([
      prisma.lead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    res.status(200).json({
      data: leads,
      page,
      limit,
      total: totalLeads,
      totalPages: Math.ceil(totalLeads / limit),
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createLead = async (req, res) => {
  try {
    const body = req.body || {};
    const data = {
      ...body,
      ownerId: req.user.id,
    };
    if (body.score !== undefined) data.score = Number(body.score);
    if (body.leadValue !== undefined) data.leadValue = Number(body.leadValue);
    if (body.isQualified !== undefined) data.isQualified = Boolean(body.isQualified === true || body.isQualified === 'true');
    if (body.lastActivityAt !== undefined) data.lastActivityAt = body.lastActivityAt ? new Date(body.lastActivityAt) : null;

    const lead = await prisma.lead.create({ data });
    res.status(201).json(lead);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid lead data' });
  }
};

export const getLeadById = async (req, res) => {
  const { id } = req.params;
  try {
    const lead = await prisma.lead.findFirst({ where: { id, ownerId: req.user.id } });
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.status(200).json(lead);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateLead = async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure lead belongs to user
    const existing = await prisma.lead.findFirst({ where: { id, ownerId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Lead not found' });

    const body = req.body || {};
    const data = { ...body };
    if (body.score !== undefined) data.score = Number(body.score);
    if (body.leadValue !== undefined) data.leadValue = Number(body.leadValue);
    if (body.isQualified !== undefined) data.isQualified = Boolean(body.isQualified === true || body.isQualified === 'true');
    if (body.lastActivityAt !== undefined) data.lastActivityAt = body.lastActivityAt ? new Date(body.lastActivityAt) : null;

    const updated = await prisma.lead.update({ where: { id }, data });
    res.status(200).json(updated);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Invalid lead data' });
  }
};

export const deleteLead = async (req, res) => {
  const { id } = req.params;
  try {
    const existing = await prisma.lead.findFirst({ where: { id, ownerId: req.user.id } });
    if (!existing) return res.status(404).json({ message: 'Lead not found' });

    await prisma.lead.delete({ where: { id } });
    res.status(200).json({ message: 'Lead deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};