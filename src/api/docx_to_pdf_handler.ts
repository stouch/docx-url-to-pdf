import { TEMPORARY_UPLOAD_PATH } from "../constants";
import { doc_to_pdf } from "../functions/doc_to_pdf";
import { get_file_data } from "../functions/get_file_data";
import { is_present } from "../functions/is_present";
import { logger_function_type } from "../functions/make_logger";
import { v4 as uuidv4 } from 'uuid';

const fs = require('fs');
const https = require('https');

export const docx_to_pdf_handler: (
	body: {url: string},
	logger: logger_function_type,
	fk: (args: { status: 400 | 500, message: string }) => void,
	sk: (data: Buffer) => void,
) => void
	= (body, logger, fk, sk) => {
		if (!is_present(body.url)) {
			fk({ status: 400, message: "No body.url provided" })
			return;
		}

		const tmpDownloadedFilePath = TEMPORARY_UPLOAD_PATH + '/' + uuidv4();
		https.get(body.url, (res) => {
			const filePath = fs.createWriteStream(tmpDownloadedFilePath);
			res.pipe(filePath);
			filePath.on('finish',() => {
				filePath.close();

				// be aware of docx path, this is passed to an exec
				doc_to_pdf(
					tmpDownloadedFilePath,
					logger,
					(err) => {
						logger(err);
						fk({ status: 500, message: "Libreoffice error" })
					},
					(pdf_path) =>
						get_file_data(pdf_path,
							(data) => sk(data),
							(err) => {
								logger(err);
								fk({ status: 500, message: "Could not read the PDF file from filesystem." })
							}
						)
				);

			})
		})

	}