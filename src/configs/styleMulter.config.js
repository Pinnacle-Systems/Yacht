import multer from "multer";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// async function getNextStyleSku(companyId, prefix) {
//   const lastStyle = await prisma.style.findFirst({
//     where: { companyId: companyId ? parseInt(companyId) : null },
//     orderBy: { id: "desc" },
//   });

//   let nextNumber = 1;
//   if (lastStyle && lastStyle.name) {
//     const parts = lastStyle.name.split("-");
//     const lastNum = parseInt(parts.at(-1) || "0");
//     nextNumber = lastNum + 1;
//   }

//   return `${prefix}-${nextNumber}`;
// }

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: async (req, file, cb) => {
    const { companyId, name } = req.body;
    // const styleNo = getNextStyleSku(companyId, name); // generate styleNo
    // req.body.styleNo = styleNo; // attach for Service
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}${ext}`;
    req.body.img = filename; // attach for DB
    cb(null, filename);
  },
});

export const styleUpload = multer({ storage });
