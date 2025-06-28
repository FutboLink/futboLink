// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

export default function handler(req, res) {
  const { id } = req.query;
  
  // Redireccionar a la página de perfil de usuario
  if (id) {
    res.redirect(307, `/user-viewer/${id}`);
  } else {
    res.status(400).json({ error: 'ID de usuario no proporcionado' });
  }
} 