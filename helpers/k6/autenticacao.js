import http from 'k6/http';
const postLogin = JSON.parse(open('../../fixtures/postLogin.json'));

export function obterToken() {
  const url = 'http://localhost:3000/login';
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