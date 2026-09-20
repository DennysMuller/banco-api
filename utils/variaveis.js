/* 
export function obterBaseURL() {
  return __ENV.BASE_URL || 'http://localhost:3000';
} 
*/
const configLocal = JSON.parse(open('../config/config.local.json'));

export function obterBaseURL() {
  return __ENV.BASE_URL || configLocal.baseURL;
}