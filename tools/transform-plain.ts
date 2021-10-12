import fs from 'fs';
import path from 'path';

const matchExtensions = [
	'.frag',
	'.vert'
]
const filePaths: string[] = [];

function recursiveSearch(dir: string) {
	const entries = fs.readdirSync(dir);

	for (const entry of entries) {
		const entryPath = path.join(dir, entry);
		const details = fs.statSync(entryPath);

		if (details.isFile()) {
			if (doesMatch(entry)) {
				filePaths.push(entryPath);
			}
		} else if (details.isDirectory()) {
			recursiveSearch(entryPath);
		}
	}
}

function doesMatch(filename: string) {
	for (const ext of matchExtensions) {
		if (filename.toLowerCase().endsWith(ext)) {
			return true;
		}
	}
	return false;
}

function transform(filePath: string) {
	const content = fs.readFileSync(filePath, { encoding: 'utf-8' });

	return (
		`"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = \`${content}\`;`
	);
}

function emit(originalPath: string, content: string) {
	const distPath = 'dist' + originalPath.substring(3);
	fs.writeFileSync(distPath, content, { encoding: 'utf-8' });
}

recursiveSearch('src');
console.log(filePaths);

for (const filePath of filePaths) {
	emit(filePath, transform(filePath));
}