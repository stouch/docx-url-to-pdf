import { exec, ExecException } from "child_process";
import { TEMPORARY_LIBREOFFICE_PROFILES_PATH, TEMPORARY_PDF_PATH } from "../constants";
import { logger_function_type } from "./make_logger";

const CHARS = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'

const random_str: (length: number) => string = (length) => {
	return Array(length)
		.fill(0)
		.map(() => CHARS[(Math.floor(Math.random() * CHARS.length)) - 1])
		.join('');
}
	

export const doc_to_pdf: (docx_path: string, logger: logger_function_type, fk: (err: ExecException) => void, sk: (pdfPath: string) => void) => void 
	= (docx_path, logger, fk, sk) => {
		// docx path is a temporary file, not a user input
		
		// Because of https://bugs.documentfoundation.org/show_bug.cgi?id=95843
		// and https://bugs.documentfoundation.org/show_bug.cgi?id=117523
		// and https://jira.xwiki.org/browse/XDOCKER-53
		// ...
		// We just have to regularly restart docker (exit on fork error in ) because it s gonna create many zombie process..
		const child = exec(`
			libreoffice \
				-env:UserInstallation=file://${TEMPORARY_LIBREOFFICE_PROFILES_PATH}/${random_str(20)} \
				--headless \
				--convert-to pdf:writer_pdf_Export \
				--outdir ${TEMPORARY_PDF_PATH} \
				"${docx_path}" 
			`, (err) => {
				if (err) {
					logger(`${err}`);
					if(`${err}`.indexOf('annot fork') > -1){
						throw new Error('Must kill container for a restart because of zombie process');
					}
					fk(err);
					return;
				}
				const docx_name = docx_path.split('/')[3];
				logger(`Converted ${docx_name} successfully`);
				const pdf_path = `${TEMPORARY_PDF_PATH}/${docx_name}.pdf`
				sk(pdf_path);
			}
		);
	}
		