import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import { fileURLToPath } from "url";
import { dirname } from "path";

import {
  employees,
  states,
  countries,
  cities,
  departments,
  companies,
  branches,
  users,
  pages,
  roles,
  subscriptions,
  finYear,
  employeeCategories,
  pageGroup,
  party,
  partyCategories,
  color,
  project,
  processMaster,
  taxTemplate,
  taxTerm,
  termsAndCondition,
  dispatched,
  order,
  po,
  styleSheetRoutes,
  sendMail,
  excessQty,
  email,
  orderImport,
  controlPanel,
  TagType,
  payTerm,
  currency,
  uom,
  purchaseInwardEntry,
  partyMasterNew,
  sampleEntry,
  designation,
  ShiftTemplate,
  ShiftCommonTemplate,
  shiftMaster,
  employeeSubCategory,
  payfrequency,
  payComponents,
  companyPaycode,
  style,
  directInwardOrReturn,
  location,
  size,
  measurement,
  fabric,
  accessoryGroup,
  openingStock,
} from "./src/routes/index.js";

import { socketMain } from "./src/sockets/socket.js";

const app = express();
// app.use(express.json())
app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
  );
  next();
});
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(express.json());

const path = __dirname + "/client/build/";

app.use(express.static(path));

app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

BigInt.prototype["toJSON"] = function () {
  return parseInt(this.toString());
};
app.use("/color", color);
app.use("/employees", employees);
app.use("/countries", countries);
app.use("/states", states);
app.use("/cities", cities);
app.use("/departments", departments);
app.use("/companies", companies);
app.use("/branches", branches);
app.use("/users", users);
app.use("/pages", pages);
app.use("/pageGroup", pageGroup);
app.use("/roles", roles);
app.use("/subscriptions", subscriptions);
app.use("/finYear", finYear);
app.use("/employeeCategories", employeeCategories);
app.use("/partyCategories", partyCategories);
app.use("/party", party);
app.use("/project", project), app.use("/process", processMaster);
app.use("/taxTemplate", taxTemplate);
app.use("/taxTerm", taxTerm);
app.use("/termsAndCondition", termsAndCondition);
app.use("/dispatched", dispatched);
app.use("/order", order);
app.use("/po", po);
app.use("/stylesheet", styleSheetRoutes);
app.use("/email", email);
app.use("/percentage", excessQty);
app.use("/orderImport", orderImport);
app.use("/controlPanel", controlPanel);
app.use("/tagType", TagType);
app.use("/payTerm", payTerm);
app.use("/currency", currency);
app.use("/uom", uom);
app.use("/purchaseInwardEntry", purchaseInwardEntry);
app.use("/partyMasterNew", partyMasterNew);
app.use("/sampleEntry", sampleEntry);
app.use("/uploads", express.static("uploads"));
app.use("/location", location);
app.use("/sendMail", sendMail);
app.use("/designation", designation);
app.use("/shift", shiftMaster);
app.use("/shiftCommonTemplate", ShiftCommonTemplate);
app.use("/ShiftTemplate", ShiftTemplate);
app.use("/employeeSubcategory", employeeSubCategory);
app.use("/payFrequency", payfrequency);
app.use("/payComponent", payComponents);
app.use("/companyPayCode", companyPaycode);
app.use("/style", style);
app.use("/directInwardOrReturn", directInwardOrReturn);
app.use("/size", size);
app.use("/measurement", measurement);
app.use("/fabric", fabric);
app.use("/accessoryGroup", accessoryGroup);
app.get("/retreiveFile/:fileName", (req, res) => {
  const { fileName } = req.params;
  res.sendFile(__dirname + "/uploads/" + fileName);
});
app.use("/openingStock", openingStock);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", socketMain);

const PORT = process.env.PORT || 9000;
httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
