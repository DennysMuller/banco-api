import http from "k6/http";
import { sleep, check } from "k6";
import { obterBaseURL } from "../../../../utils/variaveis.js";
import { obterToken } from "../../../../helpers/k6/autenticacao.js";

export const options = {
  iterations: 1,
};

export default function () {
  const token = obterToken();
  const url = obterBaseURL() + "/transferencias";
  //console.log('Token:', token);
  const payload = JSON.stringify({
    contaOrigem: 1,
    contaDestino: 2,
    valor: 12.69,
    token: "",
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  let res = http.post(url, payload, params);
  check(res, { "status is 201": (res) => res.status === 201 });
  sleep(1);
}
