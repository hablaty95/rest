"use strict";

// Faker dokumentáció, API referencia: https://fakerjs.dev/guide/#node-js
const { faker } = require("@faker-js/faker");
const chalk = require("chalk");
const { Place, Animal, Handler } = require("../models");
//const { ... } = require("../models");

module.exports = {
    up: async (queryInterface, Sequelize) => {
        try {
            // Ide dolgozd ki a seeder tartalmát:
            const handlers = [];
            const handlersCount = faker.datatype.number({
                min: 10,
                max: 25,
            })

            for (let i = 0; i < handlersCount; i++) {
                handlers.push(
                    await Handler.create({
                        name: faker.name.fullName(),
                        power: faker.datatype.number({ min: 0, max: 150}),
                    })
                );
            }

            const places = [];
            const placesCount = faker.datatype.number({
                min: 5,
                max: 10,
            })

            for (let i = 0; i < placesCount; i++){
                const cap = faker.datatype.number({ min: 5, max: 20 });
                places.push(
                    await Place.create({
                        capacity: cap,
                        cleaned: faker.datatype.boolean();
                    })
                );

                const animalsCount = faker.datatype.number({ min: 0, max: cap});
                for (let i = 0; i < animalsCount; i++) {
                    const rand = faker.datatype.boolean();
                    const anmial = await place.createAnimal({
                        name: faker.lorem.word(),
                        weight: faker.datatype.number({ min: 2, max: 150 }),
                        birthdate: faker.datatype.datetime(),
                        image: rand ? faker.image() : null
                    });

                    await animal.setHandlers(
                        faker.helpers.arrayElements(handlers)
                    );
                }
            }






            console.log(chalk.green("A DatabaseSeeder lefutott"));
        } catch (e) {
            // Ha a seederben valamilyen hiba van, akkor alapértelmezés szerint elég szegényesen írja
            // ki azokat a rendszer a seeder futtatásakor. Ezért ez Neked egy segítség, hogy láthasd a
            // hiba részletes kiírását.
            // Így ha valamit elrontasz a seederben, azt könnyebben tudod debug-olni.
            console.log(chalk.red("A DatabaseSeeder nem futott le teljesen, mivel az alábbi hiba történt:"));
            console.log(chalk.gray(e));
        }
    },

    // Erre alapvetően nincs szükséged, mivel a parancsok úgy vannak felépítve,
    // hogy tiszta adatbázist generálnak, vagyis a korábbi adatok enélkül is elvesznek
    down: async (queryInterface, Sequelize) => {},
};
