export {
  createProgramDraft,
  deleteProgram,
  getProgramById,
  getPrograms,
  type ProgramTranslationPayload,
  publishProgram,
  saveProgramOverview,
  saveProgramTranslations,
  updateProgramStatus,
} from './admin.service';
export {
  getPrograms as getMarketingPrograms,
  getProgramBySlug,
} from './marketing.service';
