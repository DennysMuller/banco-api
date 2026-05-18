const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./config/swagger');
require('dotenv').config();

const loginRoutes = require('./routes/loginRoutes');
const transferenciaRoutes = require('./routes/transferenciaRoutes');
const contaRoutes = require('./routes/contaRoutes');

const gerenciarErros = require('./middleware/gerenciarErros');


const app = express();

app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use('/login', loginRoutes);
app.use('/transferencias', transferenciaRoutes);
app.use('/contas', contaRoutes);
app.use('/', (req, res) => {
    res.send(`
        <h1>Bem vindo à API do Banco</h1>
        <p>Acesse a <a href="/api-docs" title="http://localhost:${process.env.PORT}/api-docs">documentação</a>.</p>
    `);
})

app.use(gerenciarErros);

app.listen(process.env.PORT, () => {
    console.log(`Servidor rodando na porta ${process.env.PORT}`);
    console.log(`Acesse: http://localhost:${process.env.PORT}`);
    console.log(`Documentação disponível em: http://localhost:${process.env.PORT}/api-docs`);
});