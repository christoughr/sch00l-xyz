import { z } from "zod";
import { SUBJECT_IDS } from "./subject-ids";

export const zSubjectId = z.enum(SUBJECT_IDS);
