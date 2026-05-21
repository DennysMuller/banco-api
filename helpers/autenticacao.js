const requisisao = require('supertest');

const capturaToken = async (usuario, senha) => {
  const resposta = await requisisao(process.env.API_URL)
          .post('/login')
          .set('Accept', 'application/json')
          .send({
            'username': usuario,
            'senha': senha
          })
  return resposta.body.token
}

module.exports = capturaToken;