const { PrismaClient } = require('@prisma/client');
const { success, error } = require('../utils/response');
const prisma = new PrismaClient();

const getToday = async (req, res) => {
  try {
    const today = new Date(new Date().toDateString());
    let verse = await prisma.dailyVerse.findFirst({ where: { date: today } });
    if (!verse) verse = await prisma.dailyVerse.findFirst({ orderBy: { date: 'desc' } });
    if (!verse) return error(res, 'Nenhum versículo disponível', 404);
    return success(res, verse);
  } catch (err) { return error(res, 'Erro ao buscar versículo', 500); }
};

const getAll = async (req, res) => {
  try {
    const verses = await prisma.dailyVerse.findMany({ orderBy: { date: 'desc' }, take: 30 });
    return success(res, verses);
  } catch (err) { return error(res, 'Erro ao buscar versículos', 500); }
};

const create = async (req, res) => {
  try {
    const { reference, text, reflection, date } = req.body;
    if (!reference || !text) return error(res, 'Referência e texto são obrigatórios', 400);
    const verseDate = date ? new Date(new Date(date).toDateString()) : new Date(new Date().toDateString());
    const verse = await prisma.dailyVerse.upsert({
      where: { date: verseDate },
      update: { reference, text, reflection, createdBy: req.user.id },
      create: { reference, text, reflection, date: verseDate, createdBy: req.user.id },
    });
    return success(res, verse, 'Versículo salvo!', 201);
  } catch (err) { return error(res, 'Erro ao salvar versículo', 500); }
};

const update = async (req, res) => {
  try {
    const { reference, text, reflection } = req.body;
    const verse = await prisma.dailyVerse.update({ where: { id: req.params.id }, data: { reference, text, reflection } });
    return success(res, verse, 'Versículo atualizado!');
  } catch (err) { return error(res, 'Erro ao atualizar versículo', 500); }
};

const remove = async (req, res) => {
  try {
    await prisma.dailyVerse.delete({ where: { id: req.params.id } });
    return success(res, null, 'Versículo removido!');
  } catch (err) { return error(res, 'Erro ao remover versículo', 500); }
};

module.exports = { getToday, getAll, create, update, remove };
