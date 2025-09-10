export const INITIAL_PAGE_NUMBER = 1;
export const DATA_PER_PAGE = 30;
export const COMPANY_NAME = 'QUOTE';
export const DOCID = 'UA-2490'
const BASE_URL = process.env.REACT_APP_SERVER_URL;

export const IMAGE_UPLOAD_URL = BASE_URL + 'retreiveFile/' 
export function getImageUrlPath(fileName) {
    return `${BASE_URL + 'retreiveFile/'}${fileName}`
}
