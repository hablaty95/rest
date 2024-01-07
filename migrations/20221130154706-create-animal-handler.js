"use strict";

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable("AnimalHandler", {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER,
            },
            AnimalId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Animal",
                    key: "id",
                },
                onDelete: "cascade",
            },
            HandlerId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: "Handlers",
                    key: "id",
                },
                onDelete: "cascade",
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
            },
        });

        await queryInterface.addConstraint("AnimalHandler", {
            fields: ["AnimalId", "HandlerId"],
            type: "unique",
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable("AnimalHandler");
    },
};
