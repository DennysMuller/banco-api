const postTransferencias = require('../../../fixtures/postTransferencias.json');
const capturaToken = require('../../../helpers/autenticacao');
const { execSync } = require('child_process');
const requisisao = require('supertest');
const {expect} = require('chai');
require('dotenv').config();

let token;
beforeEach(async () => {
  try {
    token = await capturaToken('julio.lima', '123456')
  } catch (_) {
    // banco pode estar indisponível em testes específicos
  }
})

describe('Regras para realizar transferência', () => {
  describe('POST /transferencia', () => {
    it('Deve retornar sucesso com 201 quando o valor for maior ou igual a R$ 10,00, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)

      expect(resposta.status).to.be.equal(201)
      expect(resposta.body.message).to.be.a('string');
      expect(resposta.body.message).to.be.equal('Transferência realizada com sucesso.');      
    })

    it('Deve retornar sucesso com 201 quando o valor for acima que R$ 5.000,00 e informar o token válido, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.valor = 5000.01;
      bodyTransferencias.token = '123456';

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)

      expect(resposta.status).to.be.equal(201)
      expect(resposta.body.message).to.be.a('string');
      expect(resposta.body.message).to.be.equal('Transferência realizada com sucesso.');      
    })

    it('Deve retornar sucesso com 401 quando o valor for acima que R$ 5.000,00 e informar o token inválido, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.valor = 5000.01;

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)
      
      expect(resposta.status).to.be.equal(401)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Autenticação necessária para transferências acima de R$5.000,00.');     
    })

    // Aqui há um erro na aplicação, pois na regra de negócio o token é para valores acima de R$ 5.000,00
    it('Deve retornar sucesso com 201 quando o valor for abaixo ou igual a R$ 5.000,00 e NÃO informar o token, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.valor = 5000.00;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)
      
      console.log(`resposta.body: ${JSON.stringify(resposta.body)}`)
      console.log(`Aqui há um erro na aplicação, pois na regra de negócio exige que o token seja para valores acima de R$ 5.000,00`)
      expect(resposta.status).to.be.equal(201)
      expect(resposta.body.message).to.be.a('string');
      expect(resposta.body.message).to.be.equal('Transferência realizada com sucesso.');      
    })

    // Aqui há um erro na aplicação, pois na regra de negócio exige que o token seja para valores acima de R$ 5.000,00
    it('Deve retornar sucesso com 201 quando o valor for abaixo de R$ 5.000,00 e NÃO informar o token, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.valor = 4999.99;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)
      
      expect(resposta.status).to.be.equal(201)
      expect(resposta.body.message).to.be.a('string');
      expect(resposta.body.message).to.be.equal('Transferência realizada com sucesso.');      
    })

    it('Deve retornar falha com 422 quando a conta de origem estiver inativa', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.contaOrigem = 3;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)
      
      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Conta de origem ou destino está inativa.');      
    })

    it('Deve retornar falha com 422 quando a conta de destino estiver inativa', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.contaDestino = 3;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)
      
      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Conta de origem ou destino está inativa.');      
    })

    it('Deve retornar falha com 422 quando a conta de origem e destino estiverem inativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.contaOrigem = 6;
      bodyTransferencias.contaDestino = 3;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)

      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Conta de origem ou destino está inativa.');      
    })

    it('Deve retornar falha com 422 quando a conta de origem não possui saldo suficiente, contas ativas e saldo zerado', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.contaOrigem = 4;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)

      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');     
    })

    it('Deve retornar falha com 422 quando a conta de origem saldo for negativo, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.contaOrigem = 5;
      
      const resposta = await requisisao(process.env.API_URL)
      .post('/transferencias')
      .set('Accept', 'application/json')
      .set('Authorization', `Bearer ${token}`)
      .send(bodyTransferencias)

      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');
    })

    it('Deve retornar falha com 400 quando NÃO INFORMAR o valor das contas, contas ativas', async () => {
      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{ "contaOrigem": , "contaDestino": 2, "valor": 10.00, "token": "" }')

      expect(resposta.status).to.be.equal(400)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal(`Unexpected token ',', ..."aOrigem": , "contaDe"... is not valid JSON`);
    })
    
    it('Deve retornar falha com 401 quando NÃO INFORMAR o token, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .send({ ...bodyTransferencias })

      expect(resposta.status).to.be.equal(401)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Token de autenticação não fornecido.');
    })
    
    it('Deve retornar falha com 401 o token for inválido, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}1`)
        .send({ ...bodyTransferencias })

      expect(resposta.status).to.be.equal(401)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Token inválido.');
    })
    
    it('Deve retornar falha com 403 quando o usuário não possui permissão para realizar a transferência, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      const token = await capturaToken('junior.lima', '123456')


      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...bodyTransferencias })

      expect(resposta.status).to.be.equal(403)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Acesso não permitido.');    
    })

    it('Deve retornar 405 quando usar um método diferente de POST e GET', async () => {
      const resposta = await requisisao(process.env.API_URL)
        .patch('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)

      expect(resposta.status).to.be.equal(405);
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Método não permitido.');
    })

    it('Deve retornar falha com 422 quando o valor for menor que R$ 10,00, contas ativas', async () => {
      const bodyTransferencias = {...postTransferencias};
      bodyTransferencias.valor = 9.99;

      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send({ ...bodyTransferencias })

      expect(resposta.status).to.be.equal(422)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('O valor da transferência deve ser maior ou igual a R$10,00.');    
    })

    it('Deve retornar falha com 500 quando NÃO INFORMAR a PROPIEDADE VALOR da transferência, contas ativas', async () => {
      const resposta = await requisisao(process.env.API_URL)
        .post('/transferencias')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .set('Content-Type', 'application/json')
        .send('{ "contaOrigem": 1, "contaDestino": 2, "token": "" }')

      expect(resposta.status).to.be.equal(500)
      expect(resposta.body.error).to.be.a('string');
      expect(resposta.body.error).to.be.equal('Erro interno do servidor.');    
    })
  })

  describe('Regras para buscar transferências', () => {
    describe('GET /transferencias', () => {     
      it('Deve retornar 200 quando buscar por uma transferência específica válida.', async () => {      
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias/10')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)

        expect(resposta.status).to.be.equal(200);
        expect(resposta.body.id).to.be.equal(10);
        expect(resposta.body.id).to.be.a('number');
        expect(resposta.body.conta_origem_id).to.be.equal(1);
        expect(resposta.body.conta_origem_id).to.be.a('number');
        expect(resposta.body.conta_destino_id).to.be.equal(2);
        expect(resposta.body.conta_destino_id).to.be.a('number');
        expect(resposta.body.valor).to.be.equal('10.01');
        expect(resposta.body.valor).to.be.a('string');
        expect(resposta.body.data_hora).to.be.equal('2026-05-19T22:58:38.000Z')
        expect(resposta.body.data_hora).to.be.a('string');
        expect(resposta.body.autenticada).to.be.equal(0);
        expect(resposta.body.autenticada).to.be.a('number');
      })

      it('Deve retornar 200 quando buscar por todas as transferências válidas.', async () => {      
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
    
        expect(resposta.status).to.be.equal(200);
        expect(resposta.body.page).to.be.equal(1);
        expect(resposta.body.page).to.be.a('number');
        expect(resposta.body.limit).to.be.equal(10);
        expert(resposta.body.transferencias).to.have.lengthOf(10);
        expect(resposta.body.limit).to.be.a('number');
      })
    
      it('Deve retornar 200 quando buscar por uma página e limite específicos de transferências válidas.', async () => {      
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias?page=3&limit=6')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
    
        expect(resposta.status).to.be.equal(200);
        expect(resposta.body.page).to.be.equal(3);
        expect(resposta.body.page).to.be.a('number');
        expect(resposta.body.limit).to.be.equal(6);
        expert(resposta.body.transferencias).to.have.lengthOf(6);
        expect(resposta.body.limit).to.be.a('number');
      })

      it('Deve retornar 401 quando NÃO informar o token de autenticação.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias')
          .set('Accept', 'application/json')

        expect(resposta.status).to.be.equal(401);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Token de autenticação não fornecido.');
      })

      it('Deve retornar 401 quando NÃO informar o token ao buscar transferência por ID.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias/10')
          .set('Accept', 'application/json')

        expect(resposta.status).to.be.equal(401);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Token de autenticação não fornecido.');
      })

      // Aqui há um erro na aplicação: o swagger documenta 404 para transferência não encontrada,
      // mas a API retorna 200 com body vazio ao buscar GET /transferencias/0.
      it('Deve retornar 200 quando a transferência não for encontrada (bug: esperado 404 conforme swagger).', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .get('/transferencias/0')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)

          expect(resposta.status).to.be.equal(200); // bug: deveria ser 404
          expect(resposta.body).to.eql('');
      })

      // Aqui há um erro na aplicação: o swagger documenta 405 para método não permitido em /{id},
      // mas POST /transferencias/10 retorna 200 com body vazio ao invés de 405.
      it('Deve retornar 405 quando usar um método não permitido no endpoint com ID (bug: esperado 405 conforme swagger).', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .post('/transferencias/10')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)

        expect(resposta.status).to.be.equal(200); // bug: deveria ser 405
        expect(resposta.body).to.eql({});
      })

      it('Deve retornar 405 quando usar um método não permitido no endpoint.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .delete('/transferencias')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)

        expect(resposta.status).to.be.equal(405);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Método não permitido.');
      })

    })
  })

  describe('Regras para atualizar transferências', () => {
    describe('PUT /transferencias', () => {      
      it('Deve retornar 204 quando os dados da transferência válida.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 4999.99;
        bodyTransferencias.contaOrigem = 1;
        bodyTransferencias.contaDestino = 7;      

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias/29')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(204);
        expect(resposta.body).to.eql({});        
      })
      
      it('Deve retornar 204 quando valor for maior ou igual a R$ 5.000 e informar um token válido.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 5000.00;
        bodyTransferencias.contaOrigem = 1;
        bodyTransferencias.contaDestino = 7;
        bodyTransferencias.token = '123456';     

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias/30')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(204);
        expect(resposta.body).to.eql({});        
      })

      it('Deve retornar falha com 422 quando o valor for menor que R$ 10,00, contas ativas', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 9.99;

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias/23')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send({ ...bodyTransferencias })

        expect(resposta.status).to.be.equal(422)
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('O valor da transferência deve ser maior ou igual a R$10,00.');    
      })      
          
      it('Deve falhar com 422 quando a conta origem estiver inativa, transferência iválida.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.contaOrigem = 3;    

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias/25')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Conta de origem ou destino está inativa.');        
      })
           
      it('Deve falhar com 422 quando a conta destino estiver inativa, transferência iválida.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 4999.99;
        bodyTransferencias.contaOrigem = 1;
        bodyTransferencias.contaDestino = 6;      

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias/25')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Conta de origem ou destino está inativa.');        
      })
      
      it('Deve falhar com 422 quando a conta origem estiver com saldo insuficiente, transferência iválida.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 4999.99;
        bodyTransferencias.contaOrigem = 5;
        bodyTransferencias.contaDestino = 4; 

        const resposta = await requisisao(process.env.API_URL)
        .put('/transferencias/25')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');        
      })
    
      // Aqui há um erro na aplicação, pois na regra de negócio exige que o token seja para valores acima de R$ 5.000,00
      it('Deve falhar com 401 quando o valor for acima ou igual que R$ 5.000,00 e informar o token inválido, transferência iválida.', async () => {
        const bodyTransferencias = {...postTransferencias};
        bodyTransferencias.valor = 5000.00; 

        const resposta = await requisisao(process.env.API_URL)
        .put('/transferencias/25')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(401);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Autenticação necessária para transferências acima de R$5.000,00.');        
      })
    
      it('Deve retornar falha com 400 quando NÃO INFORMAR o valor das contas, contas ativas', async () => {
        const bodyTransferencias = {...postTransferencias};

        const resposta = await requisisao(process.env.API_URL)
          .put('/transferencias')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
          .send('{ "contaOrigem": , "contaDestino": 2, "valor": 10.00, "token": "" }')

        expect(resposta.status).to.be.equal(400)
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal(`Unexpected token ',', ..."aOrigem": , "contaDe"... is not valid JSON`);
      })

      it('Deve falhar com 404 quando o valor for acima ou igual que R$ 5.000,00 e informar o token inválido, transferência iválida.', async () => {
        const bodyTransferencias = {...postTransferencias};

        const resposta = await requisisao(process.env.API_URL)
        .put('/transferencias/0')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyTransferencias)

        expect(resposta.status).to.be.equal(404);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Transferência não encontrada.');        
      })
      
      
    })
  })
  

  describe('Regras para modificar transferências', () => {
    describe('PATCH /transferencias', () => {      
      it('Deve retornar 204 quando os dados da transferência válida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/36')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            contaOrigem : 7
          })

        expect(resposta.status).to.be.equal(204);
        expect(resposta.body).to.eql({});        
      })
      
      it('Deve retornar 204 quando valor for maior ou igual a R$ 5.000 e informar um token válido.', async () => {
         const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/21')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send({ 
            'valor' : 5000.00,
            'token' : '123456'
          })

        expect(resposta.status).to.be.equal(204);
        expect(resposta.body).to.eql({});        
      })

      it('Deve retornar falha com 422 quando o valor for menor que R$ 10,00, contas ativas', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/23')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send({ 'valor' : 9.99 })

        expect(resposta.status).to.be.equal(422)
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('O valor da transferência deve ser maior ou igual a R$10,00.');    
      })      

      it('Deve falhar com 422 quando a conta origem estiver inativa, transferência iválida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/26')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send( { contaOrigem : 3 })

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Conta de origem inválida ou inativa.');        
      })
           
      it('Deve falhar com 422 quando a conta destino estiver inativa, transferência iválida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/25')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .send( { contaDestino : 6 })

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Conta de destino inválida ou inativa.');        
      })
      
      it('Deve falhar com 422 quando a conta origem estiver com saldo insuficiente, transferência iválida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
        .patch('/transferencias/25')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send( { 
          contaOrigem : 5,
          valor : 23.97
        })

        expect(resposta.status).to.be.equal(422);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Saldo insuficiente para realizar a transferência.');        
      })
    
      // Aqui há um erro na aplicação, pois na regra de negócio exige que o token seja para valores acima de R$ 5.000,00
      it('Deve falhar com 401 quando o valor for acima ou igual que R$ 5.000,00 e informar o token inválido, transferência iválida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
        .patch('/transferencias/45')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send( { valor : 5000.00 })

        expect(resposta.status).to.be.equal(401);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Autenticação necessária para transferências acima de R$5.000,00.');        
      })
    
      it('Deve retornar falha com 400 quando INFORMAR um VALOR inválido, contas ativas', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .patch('/transferencias/39')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`)
          .set('Content-Type', 'application/json')
          .send('{ "valor": 10,00 }')

        expect(resposta.status).to.be.equal(400)
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal(`Expected double-quoted property name in JSON at position 14 (line 1 column 15)`);
      })

      it('Deve falhar com 404 quando o valor for acima ou igual que R$ 5.000,00 e informar o token inválido, transferência iválida.', async () => {
        const resposta = await requisisao(process.env.API_URL)
        .patch('/transferencias/0')
        .set('Accept', 'application/json')
        .set('Authorization', `Bearer ${token}`)
        .send( { contaOrigem : 3 })

        expect(resposta.status).to.be.equal(404);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Transferência não encontrada.');        
      })
           
    })
  })


  describe('Regras para remover transferências', () => {
    describe('DELETE /transferencias', () => {
      let idParaDeletar;

      before(async () => {
        const tokenLocal = await capturaToken('julio.lima', '123456');

        // Cria uma transferência exclusiva para o teste de deleção
        await requisisao(process.env.API_URL)
          .post('/transferencias')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${tokenLocal}`)
          .send({ contaOrigem: 1, contaDestino: 2, valor: 10.00, token: '' });

        // Busca o ID da transferência mais recente (a recém-criada)
        const lista = await requisisao(process.env.API_URL)
          .get('/transferencias?page=1&limit=1')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${tokenLocal}`);

        idParaDeletar = lista.body.transferencias[0].id;
      });

      it('Deve retornar 204 quando remover uma transferência válida e reverter os saldos.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .delete(`/transferencias/${idParaDeletar}`)
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`);

        expect(resposta.status).to.be.equal(204);
        expect(resposta.body).to.eql({});
      });

      it('Deve retornar 401 quando NÃO informar o token de autenticação.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .delete('/transferencias/60')
          .set('Accept', 'application/json');

        expect(resposta.status).to.be.equal(401);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Token de autenticação não fornecido.');
      });

      it('Deve retornar 404 quando a transferência não for encontrada.', async () => {
        const resposta = await requisisao(process.env.API_URL)
          .delete('/transferencias/0')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${token}`);

        expect(resposta.status).to.be.equal(404);
        expect(resposta.body.error).to.be.a('string');
        expect(resposta.body.error).to.be.equal('Transferência não encontrada.');
      });
    });
  });

  describe('Login', () => {
    describe('Para cobrir a regra de negócio: Serviço de Autenticação de Usuário -> Regras de verificação de token', () => {
      it('Deve retornar 401 quando o token estiver expirado, contas ativas', async () => {
        /*
          Para simular um token expirado, precisamos criá-lo manualmente aqui no teste.

          O token JWT é gerado com uma data de expiração (exp) já no passado:
          - Math.floor(Date.now() / 1000) → data e hora atual em segundos
          - - 10 → subtrai 10 segundos, colocando a expiração 10 segundos atrás

          Isso faz o servidor reconhecer o token como expirado e retornar o erro correto.

          IMPORTANTE: o token deve ser assinado com o mesmo "segredo" (JWT_SECRET) que o
          servidor usa para verificá-lo. Se os segredos forem diferentes, o servidor rejeita
          o token por assinatura inválida antes mesmo de checar a expiração — e o teste falha
          com "Token inválido." em vez de "Token expirado.".
          Por isso usamos: process.env.JWT_SECRET || 'secret_key' (igual ao middleware).
        */
      
        const jwt = require('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET || 'secret_key'  // mesmo valor do middleware
        const tokenExpirado = jwt.sign(
          { id: 1, username: 'julio.lima', exp: Math.floor(Date.now() / 1000) - 10 },
          JWT_SECRET
          // exp definido diretamente no payload garante TokenExpiredError sem ambiguidade
        )

        const bodyTransferencias = {...postTransferencias};

        const resposta = await requisisao(process.env.API_URL)
          .post('/transferencias')
          .set('Accept', 'application/json')
          .set('Authorization', `Bearer ${tokenExpirado}`)
          .send({ ...bodyTransferencias })

        expect(resposta.status).to.be.equal(401)
        expect(resposta.body.error).to.be.a('string')
        expect(resposta.body.error).to.be.equal('Token expirado.')
      })
    })
  })
})

describe('Transferências com o banco parado para simular o status code 500', () => {
  let tokenLocal;

  before(async () => {
    tokenLocal = await capturaToken('julio.lima', '123456');
    execSync('docker stop MySQL80');
  });

  after(() => {
    execSync('docker start MySQL80');
  });

  describe('Regras transferências', () => {
      describe('GET /transferencias', () => {
        it('Deve retornar 500 ao tentar buscar transferências com o banco indisponível.', async function () {
          this.timeout(3500);

          const resposta = await requisisao(process.env.API_URL)
            .get('/transferencias')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tokenLocal}`)

          expect(resposta.status).to.be.equal(500);
          expect(resposta.body.error).to.be.a('string');
          expect(resposta.body.error).to.be.equal('Erro interno do servidor.');
        });

        it('Deve retornar 500 ao tentar buscar transferência por ID com o banco indisponível.', async function () {
          this.timeout(3500);

          const resposta = await requisisao(process.env.API_URL)
            .get('/transferencias/10')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tokenLocal}`)

          expect(resposta.status).to.be.equal(500);
          expect(resposta.body.error).to.be.a('string');
          expect(resposta.body.error).to.be.equal('Erro interno do servidor.');
        });
      });

      describe('PUT /transferencias', () => {
        it('Deve falhar com 500 ao tentar atualizar uma transferência válida', async function () {
          this.timeout(3500);
          const bodyTransferencias = {...postTransferencias};  

          const resposta = await requisisao(process.env.API_URL)
            .put('/transferencias/25')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tokenLocal}`)
            .send(bodyTransferencias)

          expect(resposta.body.error).to.be.a('string');
          expect(resposta.body.error).to.be.equal('Erro interno do servidor.');         
        });
      });

      describe('PATCH /transferencias', () => {
        it('Deve falhar com 500 ao tentar atualizar uma transferência válida', async function () {
          this.timeout(3500);
          const bodyTransferencias = {...postTransferencias};  

          const resposta = await requisisao(process.env.API_URL)
            .patch('/transferencias/28')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tokenLocal}`)
            .send(bodyTransferencias)

          expect(resposta.status).to.be.equal(500);
          expect(resposta.body.error).to.be.a('string');
          expect(resposta.body.error).to.be.equal('Erro interno do servidor.');         
        });
      });

      describe('DELETE /transferencias', () => {
        it('Deve falhar com 500 ao tentar remover uma transferência com o banco indisponível.', async function () {
          this.timeout(3500);

          const resposta = await requisisao(process.env.API_URL)
            .delete('/transferencias/65')
            .set('Accept', 'application/json')
            .set('Authorization', `Bearer ${tokenLocal}`);

          expect(resposta.status).to.be.equal(500);
          expect(resposta.body.error).to.be.a('string');
          expect(resposta.body.error).to.be.equal('Erro interno do servidor.');
        });
      });

  })
})