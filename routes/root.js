const { StatusCodes } = require("http-status-codes");
const S = require('fluent-json-schema');
const { Sequelize, sequelize, Place, Animal, Handler /* ... további modellek importálása itt */ } = require("../models");
const { ValidationError, DatabaseError, Op } = Sequelize;

module.exports = function (fastify, opts, next) {
    fastify.get("/animals", async (request, reply) => {
        reply.send(await Animal.findAll());
    });

    fastify.get("/animals/:id", async (request, reply) => {
        const { id } = request.params;
        const animal = await Animal.findByPk(id);

        if (!animal) {
            return reply.status(404).send();
        }

        reply.send(animal);
    });

    fastify.post("/animals", async (request, reply) => {
        const animal = await Animal.create(request.body);

        reply.status(201).send(animal);
    });

    fastify.patch("/animals/:id", async (request, reply) => {
        const { id } = request.params;
        const animal = await Animal.findByPk(id);

        if (!animal) {
            return reply.status(404).send();
        }

        await animal.update(request.body);

        reply.send(animal);
    });

    fastify.post("/login", {
        schema: {
            body: S.object().prop('name', S.string().required())
        }
    }, async (request, reply) => {
        const { name } = request.body;

        const handler = await Handler.findOne({
            where: {
                name,
            }
        });

        if (!handler) {
            return reply.status(404).send();
        }

        const token = fastify.jwt.sign(handler.toJSON());

        reply.send({ token })
    });

    fastify.get("/my-animals", { onRequest: [fastify.auth] }, async (request, reply) => {
        const handler = await Handler.findByPk(request.user.id);
        reply.send(await handler.getAnimals());
    });

    fastify.get("/my-animals/with-place", { onRequest: [fastify.auth] }, async (request, reply) => {
        const handler = await Handler.findByPk(request.user.id);

        reply.send(await handler.getAnimals().getPlace());
    });

    fastify.post("/my-animals", {
        onRequest: [fastify.auth],
        schema: {
            body: S.object().prop("animals", S.array().required())
        }
     }, async (request, reply) => {
        const handler = await Handler.findByPk(request.user.id);

        const invalidAnimals = [], alreadyMyAnimals = [], adoptedAnimals = [];

        for (const id of request.body.animals) {
            const animal = await Animal.findByPk(id);

            if (!animal) {
                invalidAnimals.push(id);
            } else if (await handler.hasAnimal(animal)) {
                alreadyMyAnimals.push(id);
            } else {
                adoptedAnimals.push(id);
            }
        }

        await handler.addAnimals(adoptedAnimals);

        return {
            invalidAnimals,
            alreadyMyAnimals,
            adoptedAnimals,
        }
    });




    fastify.post("/clean-places", {
        onRequest: [fastify.auth],
        schema: {
            body: S.object().prop("places", S.array().required())
        }
     }, async (request, reply) => {
        const handler = await Handler.findByPk(request.user.id);

        if (handler.getPower()<100) {
            return reply.status(401).send();
        }

        const invalidPlaces = [], alreadyCleanPlaces = [], cleanedPlaces = [];

        for (const id of request.body.places) {
            const place = await Place.findByPk(id);

            if (!place) {
                invalidPlaces.push(id);
            } else if (await place.getCleared() == true) {
                alreadyCleanPlaces.push(id);
            } else {
                cleanedPlaces.push(id);
                place.setCleaned(true);
            }
        }


        return {
            invalidPlaces,
            alreadyCleanPlaces,
            cleanedPlaces,
        }
    });


    fastify.post("/move-animals", {
        onRequest: [fastify.auth],
        schema: {
            body: S.object().prop("places", S.array().required())
        }
     }, async (request, reply) => {
        const handler = await Handler.findByPk(request.user.id);


    });

    fastify.addHook('onError', async (request, reply, error) => {
        if (error instanceof ValidationError || error instanceof DatabaseError) {
            reply.status(400).send();
        }
    })

    //// http://127.0.0.1:4000/
    //fastify.get("/", async (request, reply) => {
    //    reply.send({ message: "Gyökér végpont" });
    //    // * A send alapból 200 OK állapotkódot küld, vagyis az előző sor ugyanaz, mint a következő:
    //    // reply.status(StatusCodes.OK).send({ message: "Gyökér végpont" });
    //});
//
    //// http://127.0.0.1:4000/auth-protected
    //fastify.get("/auth-protected", { onRequest: [fastify.auth] }, async (request, reply) => {
    //    reply.send({ user: request.user });
    //});

    next();
};

module.exports.autoPrefix = "/";
