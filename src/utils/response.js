const success = (res, data = null, message = 'Sucesso', statusCode = 200) => {
  return res.status(statusCode).json({ success: true, message, data });
};

const error = (res, message = 'Erro interno', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({ success: false, message, ...(errors && { errors }) });
};

const paginated = (res, data, total, page, limit, message = 'Sucesso') => {
  return res.status(200).json({
    success: true, message, data,
    pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / limit) },
  });
};

module.exports = { success, error, paginated };
