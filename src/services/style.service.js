import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// export const createStyleSheet = async (data) => {
//   return prisma.styleSheet.create({ data });
// };

// const create = async (req) => {
//   console.log("reS : ", req.fabCode);

//   const fabricImage = req.file

//   const { fdsDate, fabCode, fabType, countryOriginFabric, countryOriginYarn, countryOriginFiber, smsMcq,
//     smsMoq, smsLeadTime, bulkMcq, bulkMoq, bulkLeadTime, surCharges, priceFob, construction, fiberContent, yarnDetails,
//     weightGSM, weftWalesCount, widthFinished, widthCuttale, wrapCoursesCount, dyedMethod, printingMethod, surfaceFinish,
//     otherPerformanceFunction, materialCode
//   } = req.body
//   const toFloatOrNull = (val) =>
//     val === "" || val === undefined || val === null ? null : parseFloat(val);
//   const getCountryName = (country) =>
//     country
//       ? typeof country === "object"
//         ? country.label || country.name
//         : country
//       : null;
//   const data = await prisma.styleSheet.create(
//     {

//       data: {
//         fdsDate: fdsDate ? new Date(fdsDate) : null,
//         fabCode: fabCode ? fabCode : null,
//         fabType: fabType ? fabType : null,
//         // countryOriginFabric: countryOriginFabric ? countryOriginFabric?.value : null,
//         // countryOriginYarn: countryOriginYarn ? countryOriginYarn?.value : null,
//         // countryOriginFiber: countryOriginFiber ? countryOriginFiber?.value : null,
//         countryOriginFabric: getCountryName(countryOriginFabric),
//         countryOriginYarn: getCountryName(countryOriginYarn),
//         countryOriginFiber: getCountryName(countryOriginFiber),
//         smsMcq: smsMcq ? smsMcq : null,
//         smsMoq: smsMoq ? smsMoq : null,
//         smsLeadTime: smsLeadTime ? smsLeadTime : null,
//         bulkMcq: bulkMcq ? bulkMcq : null,
//         bulkMoq: bulkMoq ? bulkMoq : null,
//         bulkLeadTime: bulkLeadTime ? bulkLeadTime : null,
//         surCharges: toFloatOrNull(surCharges),
//         priceFob: toFloatOrNull(priceFob),
//         fabricImage: fabricImage ? fabricImage.buffer.toString('base64') : null,
//         construction: construction ? construction : null,
//         fiberContent: fiberContent ? fiberContent : null,
//         yarnDetails: yarnDetails ? yarnDetails : null,
//         weightGSM: weightGSM ? weightGSM : null,
//         weftWalesCount: weftWalesCount ? weftWalesCount : null,
//         widthFinished: widthFinished ? widthFinished : null,
//         widthCuttale: widthCuttale ? widthCuttale : null,
//         wrapCoursesCount: wrapCoursesCount ? wrapCoursesCount : null,
//         dyedMethod: dyedMethod ? dyedMethod : null,
//         printingMethod: printingMethod ? printingMethod : null,
//         surfaceFinish: surfaceFinish ? surfaceFinish : null,
//         otherPerformanceFunction: otherPerformanceFunction ? otherPerformanceFunction : null,
//         materialCode: materialCode ? materialCode : null,

//       }
//     }

//   )
//   return { statusCode: 0, data }

// }
const create = async (req) => {
  const fabricImage = req.file;

  const toFloatOrNull = (val) =>
    val === "" || val === undefined || val === null ? null : parseFloat(val);

  const getCountryLabel = (country) => {
    if (!country) return null;
    if (typeof country === "object") {
      return country.label || country.name || null;
    }
    try {
      const parsed = JSON.parse(country);
      return parsed.label || parsed.name || null;
    } catch {
      return country;
    }
  };

  const data = {
    fdsDate: req.body.fdsDate ? new Date(req.body.fdsDate) : null,
    fabCode: req.body.fabCode || null,
    fabType: req.body.fabType || null,
    countryOriginFabric: getCountryLabel(req.body.countryOriginFabric),
    countryOriginYarn: getCountryLabel(req.body.countryOriginYarn),
    countryOriginFiber: getCountryLabel(req.body.countryOriginFiber),
    smsMcq: req.body.smsMcq || "",
    smsMoq: req.body.smsMoq || "",
    smsLeadTime: req.body.smsLeadTime || "",
    bulkMcq: req.body.bulkMcq || "",
    bulkMoq: req.body.bulkMoq || "",
    bulkLeadTime: req.body.bulkLeadTime || "",
    surCharges: toFloatOrNull(req.body.surCharges),
    priceFob: toFloatOrNull(req.body.priceFob),

    fabricImage: fabricImage ? fabricImage.filename : null,
    construction: req.body.construction || "",
    fiberContent: req.body.fiberContent || "",
    yarnDetails: req.body.yarnDetails || "",
    weightGSM: req.body.weightGSM || "",
    weftWalesCount: req.body.weftWalesCount || "",
    widthFinished: req.body.widthFinished || "",
    widthCuttale: req.body.widthCuttale || "",
    wrapCoursesCount: req.body.wrapCoursesCount || "",
    dyeName: req.body.dyeName || "",
    dyedMethod: req.body.dyedMethod || "",
    printingMethod: req.body.printingMethod || "",
    surfaceFinish: req.body.surfaceFinish || "",
    otherPerformanceFunction: req.body.otherPerformanceFunction || "",
    materialCode: req.body.materialCode || "",
  };

  const created = await prisma.styleSheet.create({ data });

  return { statusCode: 0, data: created };
};

// export const updateStyleSheet = async (id, body) => {
//   const toFloatOrNull = (val) =>
//     val === "" || val === undefined || val === null ? null : parseFloat(val);

//   const getCountryLabel = (country) => {
//     if (!country) return null;
//     if (typeof country === "object") {
//       return country.label || country.name || null;
//     }
//     try {
//       const parsed = JSON.parse(country);
//       return parsed.label || parsed.name || null;
//     } catch {
//       return country; // plain string
//     }
//   };
// // console.log(fabricImage,"in updates");

//   const data = {
//     fdsDate: body.fdsDate ? new Date(body.fdsDate) : null,
//     fabCode: body.fabCode || null,
//     fabType: body.fabType || null,
//     materialCode: body.materialCode || null,

//     countryOriginFabric: getCountryLabel(body.countryOriginFabric),
//     countryOriginYarn: getCountryLabel(body.countryOriginYarn),
//     countryOriginFiber: getCountryLabel(body.countryOriginFiber),

//     smsMcq: body.smsMcq || null,
//     smsMoq: body.smsMoq || null,
//     smsLeadTime: body.smsLeadTime || null,
//     bulkMcq: body.bulkMcq || null,
//     bulkMoq: body.bulkMoq || null,
//     bulkLeadTime: body.bulkLeadTime || null,

//     surCharges: toFloatOrNull(body.surCharges),
//     priceFob: toFloatOrNull(body.priceFob),

//   //  fabricImage: fabricImage ? fabricImage.filename : null,

//     construction: body.construction || null,
//     fiberContent: body.fiberContent || null,
//     yarnDetails: body.yarnDetails || null,
//     weightGSM: body.weightGSM || null,
//     weftWalesCount: body.weftWalesCount || null,
//     widthFinished: body.widthFinished || null,
//     widthCuttale: body.widthCuttale || null,
//     wrapCoursesCount: body.wrapCoursesCount || null,
//     dyedMethod: body.dyedMethod || null,
//     printingMethod: body.printingMethod || null,
//     surfaceFinish: body.surfaceFinish || null,
//     otherPerformanceFunction: body.otherPerformanceFunction || null,
//   };

//   return prisma.styleSheet.update({
//     where: { id: parseInt(id) },
//     data,
//   });
// };

// export const updateStyleSheet = async (id, body, file) => {

//   console.log(id,body,"id, body");

//   const toFloatOrNull = (val) =>
//     val === "" || val === undefined || val === null ? null : parseFloat(val);

//   const getCountryLabel = (country) => {
//     if (!country) return null;
//     if (typeof country === "object") {
//       return country.label || country.name || null;
//     }
//     try {
//       const parsed = JSON.parse(country);
//       return parsed.label || parsed.name || null;
//     } catch {
//       return country;
//     }
//   };

//   const data = {
//     fdsDate: body.fdsDate ? new Date(body.fdsDate) : null,
//     fabCode: body.fabCode || null,
//     fabType: body.fabType || null,
//     materialCode: body.materialCode || null,

//     countryOriginFabric: getCountryLabel(body.countryOriginFabric),
//     countryOriginYarn: getCountryLabel(body.countryOriginYarn),
//     countryOriginFiber: getCountryLabel(body.countryOriginFiber),

//     smsMcq: body.smsMcq || null,
//     smsMoq: body.smsMoq || null,
//     smsLeadTime: body.smsLeadTime || null,
//     bulkMcq: body.bulkMcq || null,
//     bulkMoq: body.bulkMoq || null,
//     bulkLeadTime: body.bulkLeadTime || null,

//     surCharges: toFloatOrNull(body.surCharges),
//     priceFob: toFloatOrNull(body.priceFob),

//     // ✅ Fabric Image Handling
//     fabricImage: file
//       ? file.filename // new uploaded file
//       : body.removeImage === "true"
//       ? null // if user removed the image
//       : body.fabricImage || null, // keep old image if not changed

//     construction: body.construction || null,
//     fiberContent: body.fiberContent || null,
//     yarnDetails: body.yarnDetails || null,
//     weightGSM: body.weightGSM || null,
//     weftWalesCount: body.weftWalesCount || null,
//     widthFinished: body.widthFinished || null,
//     widthCuttale: body.widthCuttale || null,
//     wrapCoursesCount: body.wrapCoursesCount || null,
//     dyedMethod: body.dyedMethod || null,
//     printingMethod: body.printingMethod || null,
//     surfaceFinish: body.surfaceFinish || null,
//     otherPerformanceFunction: body.otherPerformanceFunction || null,
//   };

//   return prisma.styleSheet.update({
//     where: { id: parseInt(id) },
//     data,
//   });
// };

export const updateStyleSheet = async (id, body, file) => {
  // const fabricImage = req.file;

 

  const toFloatOrNull = (val) =>
    val === "" || val === undefined || val === null ? null : parseFloat(val);

  const getCountryLabel = (country) => {
    if (!country) return null;
    if (typeof country === "object") {
      return country.label || country.name || null;
    }
    try {
      const parsed = JSON.parse(country);
      return parsed.label || parsed.name || null;
    } catch {
      return country;
    }
  };

  let data;
  await prisma.$transaction(async (tx) => {
    data = await tx.styleSheet.update({
      where: { id: parseInt(id) },
      data: {
        fdsDate: body.fdsDate ? new Date(body.fdsDate) : null,
        fabCode: body.fabCode || null,
        fabType: body.fabType || null,
        materialCode: body.materialCode || null,
        countryOriginFabric: getCountryLabel(body.countryOriginFabric),
        countryOriginYarn: getCountryLabel(body.countryOriginYarn),
        countryOriginFiber: getCountryLabel(body.countryOriginFiber),
        smsMcq: body.smsMcq || "",
        smsMoq: body.smsMoq || "",
        smsLeadTime: body.smsLeadTime || "",
        bulkMcq: body.bulkMcq || "",
        bulkMoq: body.bulkMoq || "",
        bulkLeadTime: body.bulkLeadTime || "",
        surCharges: toFloatOrNull(body.surCharges),
        priceFob: toFloatOrNull(body.priceFob),
        // fabricImage: (body.removeImage) === "true" ? null : file ? file.filename : body.fabricImage || null,
        fabricImage : (body.removeImage) ? null : file ? file.filename : body.fabricImage || undefined,
        
        construction: body.construction || "",
        fiberContent: body.fiberContent || "",
        yarnDetails: body.yarnDetails || "",
        weightGSM: body.weightGSM || "",
        weftWalesCount: body.weftWalesCount || "",
        widthFinished: body.widthFinished || "",
        widthCuttale: body.widthCuttale || "",
        wrapCoursesCount: body.wrapCoursesCount || "",
         dyeName: body.dyeName || "",
        dyedMethod: body.dyedMethod || "",
        printingMethod: body.printingMethod || "",
        surfaceFinish: body.surfaceFinish || "",
        otherPerformanceFunction: body.otherPerformanceFunction || "",
      },
    });
  });

  return { statusCode: 0, data };
};

export const getStyleSheetById = async (id) => {
  const parsedId = parseInt(id, 10);

  if (isNaN(parsedId)) {
    throw new Error("Invalid ID: must be a number");
  }
  return prisma.styleSheet.findUnique({
    where: { id: parseInt(id) },
  });
};

export const getAllStyleSheets = async () => {
  return prisma.styleSheet.findMany();
};

export const deleteStyleSheet = async (id) => {
  return prisma.styleSheet.delete({
    where: { id: parseInt(id) },
  });
};

export { create };
