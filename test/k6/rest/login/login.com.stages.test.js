import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },   // aumentar gradualmente para 5 usuários ao longo de 10 segundos
    { duration: '20s', target: 10 },  // manter em 10 usuários por 20 segundos
    { duration: '10s', target: 30 },  // aumentar gradualmente para 30 usuários ao longo de 10 segundos
    { duration: '20s', target: 30 },  // manter em 30 usuários por 20 segundos
    { duration: '30s', target: 0 },   // diminuir gradualmente para 0 usuários ao longo de 30 segundos
  ],
  thresholds: {
    http_req_failed: ['rate<0.01'], // http errors should be less than 1%
    'http_req_duration': [
      'avg<200',    // Média de todas as requisições deve responder em menos de 200ms
      'max<2000',   // 100% das requisições devem responder em menos de 2s (2000ms)
      'p(90)<300',  // 90% das requisições devem responder em menos de 300ms
      'p(95)<450'   // 95% das requisições devem responder em menos de 350ms
    ]
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