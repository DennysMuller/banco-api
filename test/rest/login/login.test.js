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

    it('Deve gerar um token válido com expiração de 1 hora (3600 segundos)', async () => {
      const resposta = await requisisao('http://localhost:3000')
        .post('/login')
        .set('Accept', 'application/json')
        .send({
          'username': 'julio.lima',
          'senha': '123456'
        })
      
      /* 
      O token JWT tem 3 partes separadas por . (ponto), sendo a segunda o payload (dados), codificado em Base64.
      Dentro dele existe o campo exp (expiração) em formato Unix timestamp (segundos desde 01/01/1970). 
      */
     
     const token = resposta.body.token
     
     // Pega a parte do meio do JWT e decodifica de Base64 para texto
     /* 
     O que cada linha faz:
        token.split('.')[1] — pega só o meio do JWT (o payload)
        Buffer.from(..., 'base64').toString() — converte de Base64 para texto legível
        JSON.parse(...) — transforma o texto em objeto JavaScript
        payload.exp - payload.iat — subtrai o momento de criação da expiração; se for 3600, 
          a expiração é de 1 hora
     */
     const payload = JSON.parse(
      Buffer
        .from(token
        .split('.')[1], 'base64')
        .toString()
      )
     
    // exp e iat são timestamps em segundos
    // A diferença deve ser exatamente 3600 segundos (1 hora)
    expect(payload.exp - payload.iat).to.be.equal(3600)
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