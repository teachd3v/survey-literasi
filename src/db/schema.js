import { pgTable, serial, text, integer, timestamp, uuid, boolean, numeric } from 'drizzle-orm/pg-core';

// Tabel Identitas Responden (Dinamis)
export const respondents = pgTable('respondents', {
  id: uuid('id').primaryKey().defaultRandom(),
  surveyType: text('survey_type').notNull(), // 'literasi' | 'minatbaca'
  lingkup: text('lingkup').notNull(),
  nama: text('nama').notNull(),
  kabupaten: text('kabupaten'),
  desa: text('desa'),
  sekolah: text('sekolah'),
  tbm: text('tbm'),
  rt: text('rt'),
  rw: text('rw'),
  noTbm: boolean('no_tbm').default(false),
  createdAt: timestamp('created_at').defaultNow(),
});

// Tabel Jawaban Per Item
export const answers = pgTable('answers', {
  id: serial('id').primaryKey(),
  respondentId: uuid('respondent_id').references(() => respondents.id, { onDelete: 'cascade' }),
  questionCode: text('question_code').notNull(),
  value: integer('value').notNull(),
});

// Tabel Hasil Kalkulasi
export const results = pgTable('results', {
  respondentId: uuid('respondent_id').primaryKey().references(() => respondents.id, { onDelete: 'cascade' }),
  totalScore: numeric('total_score', { precision: 10, scale: 2 }),
  weightedAvg: numeric('weighted_avg', { precision: 10, scale: 2 }),
  category: text('category'),
});
