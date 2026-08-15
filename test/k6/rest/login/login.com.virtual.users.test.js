import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 20,
  duration: '30s',
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    'http_req_duration': ['max<5000', 'p(90)<3000', 'p(95)<=4000']
  },
};

export default function () {
  const url = 'http://localhost:3000/login';
  const payload = JSON.stringify({
    username: 'julio.lima',
    senha: '123456',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const resposta = http.post(url, payload, params);

  check(resposta, {
    'Validar o status code é 200': (r) => r.status === 200,
    'Validar se o token é string': (r) => typeof r.json().token === 'string',
  } )

}