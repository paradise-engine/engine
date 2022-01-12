import fs from 'fs';
import archiver from 'archiver';

let archiveName = 'archive';
const args = process.argv;

const archiveNameArg = args.find(a => {
    if (a.startsWith('archive=')) {
        return a.replace('archive=', '').length > 0;
    }
    return false;
});
if (archiveNameArg) {
    archiveName = archiveNameArg.replace('archive=', '');
}

console.log(`Using archive name '${archiveName}.zip'`);

const output = fs.createWriteStream(`${archiveName}.zip`);
const archive = archiver('zip');

output.on('close', function () {
    console.log(archive.pointer() + ' total bytes');
    console.log('archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function (err) {
    throw err;
});

archive.pipe(output);

archive.directory('dist/', 'dist');
archive.directory('typings/', 'typings');

archive.file('LICENSE', { name: 'LICENSE' });
archive.file('logo.svg', { name: 'logo.svg' });
archive.file('package.json', { name: 'package.json' });
archive.file('README.md', { name: 'README.md' });

archive.finalize();
