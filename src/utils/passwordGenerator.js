import bcrypt from "bcrypt";

const hashedPassword = await bcrypt.hash("1234", 10);

console.log(hashedPassword)