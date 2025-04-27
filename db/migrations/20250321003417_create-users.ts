import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('users', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.decimal('age',10,2).notNullable()
        table.text('sex').notNullable()
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable() 
        //knex.fn.now() é um jeito universal do knex de anotar a data, assim, independente no banco a sintaxe estará correta.
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

