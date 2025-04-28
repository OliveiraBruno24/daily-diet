import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
    await knex.schema.createTable('snak', (table) => {
        table.uuid('id').primary()
        table.text('name').notNullable()
        table.text('desctiption')
        table.boolean('is_within_the_diet')
        table.timestamp('created_at').defaultTo(knex.fn.now()).notNullable() 
        //knex.fn.now() é um jeito universal do knex de anotar a data, assim, independente no banco a sintaxe estará correta.

        table.uuid('user_id').notNullable() // campo que referencia o usuário
      .references('id')                  // referenciando o campo id
      .inTable('users')                  // da tabela users
      .onDelete('CASCADE')               // se o usuário for deletado, deleta as refeições
      .onUpdate('CASCADE')               // se o id mudar, atualiza aqui também
    })
}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.dropTable('users')
}

