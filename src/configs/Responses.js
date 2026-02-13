export const NoRecordFound = (model) => {
  return { statusCode: 1, message: `${model} Record Not Found` };
};
export const CustomError = (model) => {
  const error = new Error(`${model}`);
  error.statusCode = 1;
  throw error;
};

export const ErrorResponse = (message) => {
  return { statusCode: 1, message };
};
