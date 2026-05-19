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
    
    it('Deve retornar 400 quando não enviar parâmetros de login, username', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'senha': '123456'
        })
      expect(resposta.status).to.be.equal(400)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Usuário e senha são obrigatórios.');
      })    
      
      it('Deve retornar 400 quando não enviar parâmetros de login, senha', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'username': '123456'
        })
      expect(resposta.status).to.be.equal(400)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Usuário e senha são obrigatórios.');
      })

    it('Deve retornar 401 quando usar credenciais inválidas, username errado', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'username': 'juliu.lima',
          'senha': '123456'
        })
      expect(resposta.status).to.be.equal(401)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Usuário ou senha inválidos.');
      })
    
    it('Deve retornar 401 quando usar credenciais inválidas, senha errada', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'username': 'julio.lima',
          'senha': '1234567'
        })
      expect(resposta.status).to.be.equal(401)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Usuário ou senha inválidos.');
      })

    it('Deve retornar 405 quando usar um método diferente de POST', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .get('/login')
        .set('Accept', 'application/json')
      expect(resposta.status).to.be.equal(405);
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Método não permitido.');
      })
    })
})