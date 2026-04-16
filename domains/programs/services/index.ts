export {
  createProgramDraft,
  deleteProgram,
  getProgramById,
  getPrograms,
  type ProgramTranslationPayload,
  publishProgram,
  saveProgramOverview,
  saveProgramTranslations,
} from './admin.service';
export {
  getPrograms as getMarketingPrograms,
  getProgramBySlug,
} from './marketing.service';
