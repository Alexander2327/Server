const http = require('http');
const Koa = require('koa');
const { koaBody } = require('koa-body');
const uuid = require('uuid');

const app = new Koa();

app.use(koaBody({
    urlencoded: true,
  }));

app.use((ctx, next) => {
    if (ctx.request.method !== 'OPTIONS') {
        next();
        return;
    }

    ctx.response.set('Access-Control-Allow-Origin', '*');
    ctx.response.set('Access-Control-Allow-Methods', 'DELETE, GET, POST, PUT, PATCH');

    ctx.response.status = 204;
}

);

const tickets = [];

app.use(async ctx => {
    const query = ctx.request.querystring.split('&');

    let method;
    let id;
    
    for (const param of query) {
        if (param.includes('method')) {
            method = param.split('=')[1];
        } else if (param.includes('id')) {
            id = param.split('=')[1];
        }
    }

    switch (method) {
        case 'allTickets':
            ctx.response.body = JSON.stringify(tickets);
            ctx.response.status = 200;
            return;
        case 'ticketById':
            for (const ticket of tickets) {
                if (ticket.id === id) {
                    if (ctx.request.method === 'GET') {
                        ctx.response.body = JSON.stringify({
                            id: ticket.id,
                            name: ticket.name,
                            description: ticket.description ? ticket.description : null,
                            status: ticket.status,
                            created: ticket.created,
                        });
                        ctx.response.status = 200;
                        
                    } else if (ctx.request.method === 'DELETE') {
                        const index = tickets.findIndex(n => n.id === id);
                        if (index !== -1) {
                            tickets.splice(index, 1);
                        }
                        // ctx.response.body = JSON.stringify({status: 'OK', result: 'DELETED'});
                        ctx.response.status = 204;
                    } else if (ctx.request.method === 'PUT') {
                        let now = new Date();
                        const { name, description, status } = ctx.request.body
                        const index = tickets.findIndex(n => n.id === id);
                        if (index !== -1) {
                            tickets.splice(index, 1);
                        }
                        let Ticket;
                        if (description) {
                            Ticket = {
                                id: id,
                                name: name,
                                description: description ? description : null,
                                status: status,
                                created: now,
                            };
                            tickets.push(Ticket);
                        }
                        ctx.response.body = JSON.stringify({
                            id: Ticket.id,
                            name: Ticket.name,
                            description: Ticket.description ? Ticket.description : null,
                            status: Ticket.status,
                            created: Ticket.created,
                        });
                        ctx.response.status = 201;
                    } else if (ctx.request.method === 'PATCH') {
                        let now = new Date();
                        const { name, description, status } = ctx.request.body
                        const index = tickets.findIndex(n => n.id === id);
                        let ticket = tickets[index];
                        if (index !== -1) {
                            tickets.splice(index, 1);
                        }
                        if (description) {
                            ticket.description = description;   
                        }
                        if (name) {
                            ticket.name = name;   
                        }
                        if (status) {
                            ticket.status = status;   
                        }
                        tickets.push(ticket);
                        ctx.response.body = JSON.stringify({
                            id: ticket.id,
                            name: ticket.name,
                            description: ticket.description,
                            status: ticket.status,
                            created: now,
                        });
                        ctx.response.status = 201;
                    }
                    break;
                }
            }
            return;
        case 'createTicket':
            if (ctx.request.method === 'POST') {
                const { name, description } = ctx.request.body;

                let now = new Date();
                const id = uuid.v4();

                if (description) {
                    let TicketFull = {
                        id: id,
                        name: name,
                        description: description,
                        status: false,
                        created: now,
                    };
                    tickets.push(TicketFull);
                } else {
                    let Ticket = {
                        id: id,
                        name: name,
                        description: null,
                        status: false,
                        created: now,
                    };
                    tickets.push(Ticket);  
                }

                ctx.response.status = 201;
                ctx.response.body = JSON.stringify({status: 'OK', result: `${id}`});
            }
            ctx.response.set('Access-Control-Allow-Origin', '*');
            
            return;
        default:
            ctx.response.status = 404;
            return;
    }
});

const server = http.createServer(app.callback());

const port = 9010;

server.listen(port, (err) => {
    if(err) {
        console.log(err);

        return;
    }

    console.log('Server is listening to ' + port);
});