const requisisao = require('supertest');
const {expect} = require('chai');


describe('Login', () => {
  describe('POST /login', () => {
    it('Deve retornar 200 com um token em string quando usar credencias válidas', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'username': 'julio.lima',
          'senha': '123456'
        })
      expect(resposta.status).to.be.equal(200)
      expect(resposta.body.token).to.be.a('string')
      })

      
  })
})