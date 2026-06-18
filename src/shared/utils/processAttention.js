import { needsProcessAttention, receivingNeedsAttention } from "./statusCatalog.js";

export { needsProcessAttention };

export const receivingNoteNeedsAttention = (note) =>
  receivingNeedsAttention(note.status);

export const addressingItemNeedsAttention = (item) =>
  needsProcessAttention(item.status) ||
  item.receivingHasIssue ||
  item.addressingBlocked;

export const addressingNoteNeedsAttention = (note) =>
  needsProcessAttention(note.addressingStatus) ||
  note.receivingHasIssue ||
  note.addressingBlocked;
