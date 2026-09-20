import http from 'k6/http';
import { obterBaseURL } from '../../utils/variaveis.js';
const postLogin = JSON.parse(open('../../fixtures/postLogin.json'));

export function obterToken() {
  const url = obterBaseURL() + '/login';
  // console.log('Payload:', postLogin);
  const payload = JSON.stringify(postLogin);

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const resposta = http.post(url, payload, params);
  return resposta.json('token');
  //console.log('Token obtido:', token);
}