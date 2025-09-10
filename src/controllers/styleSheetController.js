import * as styleSheetService from '../services/style.service.js';
import { NoRecordFound } from '../configs/Responses.js';
import {create as _create} from '../services/style.service.js'

const transformCountry = (countryField) => {
  if (countryField && typeof countryField === 'object') {
    return countryField.value;
  }
  return countryField;
};

const transformBody = (body) => {
  console.log(body,"body")
  return {
    fdsDate: body.fdsDate ? new Date(body.fdsDate) : null,
    fabCode: body.fabCode,
    fabType: body.fabType,
    materialCode: body.materialCode,
    countryOriginFabric: transformCountry(body.countryOriginFabric),
    countryOriginYarn: transformCountry(body.countryOriginYarn),
    countryOriginFiber: transformCountry(body.countryOriginFiber),

    smsMcq: body.smsMcq,
    smsMoq: body.smsMoq,
    smsLeadTime: body.smsLeadTime,
    bulkMcq: body.bulkMcq,
    bulkMoq: body.bulkMoq,
    bulkLeadTime: body.bulkLeadTime,

    surCharges: body.surCharges,
    priceFob: body.priceFob,
    fabricImage: body.fabricImage,
    removeImage : body.removeImage,

    construction: body.construction,
    fiberContent: body.fiberContent,
    yarnDetails: body.yarnDetails,
    weightGSM: body.weightGSM,
    weftWalesCount: body.weftWalesCount,
    widthFinished: body.widthFinished,
    widthCuttale: body.widthCuttale,
    wrapCoursesCount: body.wrapCoursesCount,
    dyeName : body.dyeName,
    dyedMethod: body.dyedMethod,
    printingMethod: body.printingMethod,
    surfaceFinish: body.surfaceFinish,
    otherPerformanceFunction: body.otherPerformanceFunction,

  };
};


export const create = async (req, res) => {
  try {
    const newStyleSheet = await _create(req);
    res.status(201).json({ statusCode: 0, data: newStyleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;

 
    const transformedData = transformBody(req.body);
    const updatedStyleSheet = await styleSheetService.updateStyleSheet(id, transformedData,req.file);
    res.status(200).json({ statusCode: 0, data: updatedStyleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getOne = async (req, res) => {
  try {
    const { id } = req.params;
    const styleSheet = await styleSheetService.getStyleSheetById(id);
    
    if (!styleSheet) {
      return NoRecordFound("StyleSheet", res);
    }
    
    res.status(200).json({ statusCode: 0, data: styleSheet });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const get = async (req, res) => {
  try {
    const styleSheets = await styleSheetService.getAllStyleSheets();
    res.status(200).json({ statusCode: 0, data: styleSheets });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const styleSheet = await styleSheetService.getStyleSheetById(id);
    
    if (!styleSheet) {
      return NoRecordFound("StyleSheet", res);
    }
    
    await styleSheetService.deleteStyleSheet(id);
    res.status(200).json({ statusCode: 0, message: "StyleSheet deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
