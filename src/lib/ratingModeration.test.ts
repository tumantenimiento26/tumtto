import { expect, test } from 'vitest';
import {
  RATING_REASONS,
  filterRatings,
  ratingNoteRequired,
  ratingReasonLabel,
  ratingSummary,
} from './ratingModeration';

const rs = [
  { score: 5, is_hidden: false },
  { score: 3, is_hidden: false },
  { score: 1, is_hidden: true },
];

test('el promedio excluye las ocultas', () => {
  expect(ratingSummary(rs)).toEqual({ avg: 4, count: 2 });
  expect(ratingSummary([{ score: 1, is_hidden: true }])).toEqual({ avg: 0, count: 0 });
});

test('filtro todas / visibles / ocultas', () => {
  expect(filterRatings(rs, 'all')).toHaveLength(3);
  expect(filterRatings(rs, 'visible')).toHaveLength(2);
  expect(filterRatings(rs, 'hidden')).toEqual([{ score: 1, is_hidden: true }]);
});

test('catálogo de motivos y nota obligatoria solo en «Otro»', () => {
  expect(RATING_REASONS).toHaveLength(6);
  expect(ratingReasonLabel('cancelled_service')).toBe('Servicio cancelado');
  expect(ratingNoteRequired('other')).toBe(true);
  expect(ratingNoteRequired('offensive')).toBe(false);
  expect(ratingNoteRequired(null)).toBe(false);
});
