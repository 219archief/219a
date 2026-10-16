import {sqliteTable,text,integer,index} from 'drizzle-orm/sqlite-core';
export const contactMessages=sqliteTable('contact_messages',{
 id:text('id').primaryKey(), name:text('name').notNull(), email:text('email').notNull(),
 subject:text('subject').notNull(), message:text('message').notNull(),
 createdAt:integer('created_at').notNull(), clientKey:text('client_key').notNull(),
 notification:text('notification').notNull().default('disabled')
},t=>[index('contact_rate_idx').on(t.clientKey,t.createdAt)]);
