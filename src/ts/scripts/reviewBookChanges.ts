import { BookData } from "./bookData";
import { Language } from "../state";

// Book number to review
const bookNumber = parseInt( process.argv[2], 10);
// Language code to review
const language = process.argv[3];

const bookData = new BookData(bookNumber);
bookData.reviewChangesCurrentVersion(language as Language);
