const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { hash, compare } = require('../utils/password');
const { success, error } = require('../utils/response');

const prisma = new PrismaClient();

const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, phone, birthDate } = req.body;
    if (!name || !email || !password) return error(res, 'Nome, email e senha são obrigatórios', 400);
    if (password.length < 6) return error(res, 'Senha deve ter no mínimo 6 caracteres', 400);
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) return error(res, 'Email já cadastrado', 409);
    const hashedPwd = await hash(password);
    const user = await prisma.user.create({
      data: {
        name, email: email.toLowerCase(), password: hashedPwd,
        phone, birthDate: birthDate ? new Date(birthDate) : null,
        memberSince: new Date(),
        profile: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true, avatar: true, memberSince: true },
    });
    const token = generateToken(user);
    return success(res, { user, token }, 'Cadastro realizado com sucesso!', 201);
  } catch (err) {
    console.error('Register error:', err);
    return error(res, 'Erro ao criar conta', 500);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return error(res, 'Email e senha são obrigatórios', 400);
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive) return error(res, 'Credenciais inválidas', 401);
    const validPwd = await compare(password, user.password);
    if (!validPwd) return error(res, 'Credenciais inválidas', 401);
    const token = generateToken(user);
    const { password: _, ...userData } = user;
    return success(res, { user: userData, token }, 'Login realizado com sucesso!');
  } catch (err) {
    console.error('Login error:', err);
    return error(res, 'Erro ao fazer login', 500);
  }
};

const me = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { profile: true },
      select: {
        id: true, name: true, email: true, phone: true, role: true, avatar: true,
        birthDate: true, memberSince: true, emailVerified: true, createdAt: true,
        profile: true,
      },
    });
    return success(res, user);
  } catch (err) {
    return error(res, 'Erro ao buscar usuário', 500);
  }
};

const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return error(res, 'Senhas são obrigatórias', 400);
    if (newPassword.length < 6) return error(res, 'Nova senha deve ter no mínimo 6 caracteres', 400);
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });
    const valid = await compare(currentPassword, user.password);
    if (!valid) return error(res, 'Senha atual incorreta', 400);
    const hashed = await hash(newPassword);
    await prisma.user.update({ where: { id: req.user.id }, data: { password: hashed } });
    return success(res, null, 'Senha alterada com sucesso!');
  } catch (err) {
    return error(res, 'Erro ao alterar senha', 500);
  }
};

module.exports = { register, login, me, updatePassword };
