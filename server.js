import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const app = express()
app.use(express.json()) 
app.use(cors())
const PORT = 3000

app.get('/', (req, res) =>{
    res.send('Hello Zi!')
})

app.get('/users', async (req, res) => {
    let users = []; // Declarando a variável `users` fora do bloco if-else

    try {
        if (req.query.name) {  // Verifica se há um parâmetro `name` na query
            users = await prisma.user.findMany({
                where: {
                    name: req.query.name,
                    email:req.query.email,
                    age: req.query.age
                }
            });
        } else {
            users = await prisma.user.findMany();  // Se não, traz todos os usuários
        }

        res.status(200).json(users);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        res.status(500).json({ error: 'Erro interno ao buscar usuários' });
    }
});


app.post('/users', async (req, res) =>{
    await prisma.user.create({
        data: {
            email: req.body.email,
            name: req.body.name,
            age: req.body.age
        }
    })
    res.status(201).json(req.body) 
})

app.put('/users/:id', async (req, res) => {
    try {
        const { id } = req.params; // Extrai o id
        const { email, name, age } = req.body;

        // Checar se o usuário existe
        const userExists = await prisma.user.findUnique({
            where: { id: id }
        });

        if (!userExists) {
            return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        // Atualiza o usuário
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: { email, name, age }
        });

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Erro ao atualizar o usuário:", error);
        res.status(500).json({ error: 'Erro interno do servidor' });
    }
});


app.delete('/users/:email', async (req, res) => {
    try {
        const userEmail = req.params.email;

        if (!userEmail) {
            return res.status(400).json({ error: "E-mail é obrigatório!" });
        }

        await prisma.user.delete({
            where: {
                email: userEmail
            }
        });

        res.status(200).json({ message: "Usuário deletado com sucesso!" });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar usuário", detalhes: error.message });
    }
});


app.listen(PORT, () =>{
    console.log(`Servidor rodando em http://localhost:${PORT}`)
})