import { PrismaClient } from "@prisma/client";
import  fs from 'fs';


const prisma = new PrismaClient();

// get pages and write to pages.json
async function getPagesSeed(){
    const pageGroupInDb = await prisma.pageGroup.findMany();
    fs.writeFileSync("./src/models/pagesGroup.json", JSON.stringify(pageGroupInDb));
    const pagesInDb = await prisma.page.findMany();
    fs.writeFileSync("./src/models/pages.json", JSON.stringify(pagesInDb));
  }
  
getPagesSeed()

