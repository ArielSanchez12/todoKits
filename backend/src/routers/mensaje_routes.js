import Docente from "../models/docente.js";
import Admin from "../models/admin.js";

// Obtener admin del docente autenticado
router.get("/chat/admin", verificarTokenJWT, async (req, res) => {
  if (!req.docenteBDD) return res.status(401).json({ msg: "No autorizado" });
  const admin = await Admin.findById(req.docenteBDD.admin).select("_id nombreAdmin apellidoAdmin avatarAdmin emailAdmin");
  res.json(admin);
});

// Obtener docentes del admin autenticado
router.get("/chat/docentes", verificarTokenJWT, async (req, res) => {
  if (!req.adminEmailBDD) return res.status(401).json({ msg: "No autorizado" });
  const docentes = await Docente.find({ admin: req.adminEmailBDD._id }).select("_id nombreDocente apellidoDocente avatarDocente emailDocente");
  res.json(docentes);
});