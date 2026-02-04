const fs = require('fs');
const path = require('path');

function extractMetaAndContent(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*([\s\S]*)$/);
    if (!match) return null;

    const yamlBlock = match[1];
    let body = match[2];

    const meta = {};
    const lines = yamlBlock.split('\n');
    lines.forEach(line => {
        const colonIndex = line.indexOf(':');
        if (colonIndex !== -1) {
            const key = line.substring(0, colonIndex).trim();
            let value = line.substring(colonIndex + 1).trim();
            if (value.startsWith('"') && value.endsWith('"')) {
                value = value.substring(1, value.length - 1);
            }
            meta[key] = value;
        }
    });

    const folder = path.basename(path.dirname(filePath));
    meta.folder = folder;

    // Fix image paths in markdown:
    // 1. Remove ../../ (usually pointing to figs from within posts/folder/)
    let processedBody = body.replace(/\.\.\/\.\.\//g, '');

    // 2. Fix local images (those not starting with http, / or figs/)
    processedBody = processedBody.replace(/(!\[.*?\]\()(?!(http|\/|figs\/))(.*?)(\))/g,
        (match, p1, p2, p3, p4) => `${p1}posts/${folder}/${p3}${p4}`);

    // 3. Remove Quarto/Pandoc attributes like {fig-align="center" width="500"}
    processedBody = processedBody.replace(/(\!\[.*?\]\(.*?\))\{.*?\}/g, '$1');

    meta.content = processedBody;
    return meta;
}

function scanDir(dir, allFiles = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDir(fullPath, allFiles);
        } else if (file === 'index.qmd') {
            allFiles.push(fullPath);
        }
    });
    return allFiles;
}

const postsDir = path.join(__dirname, 'posts');
const qmdFiles = scanDir(postsDir);
const posts = qmdFiles.map(extractMetaAndContent).filter(Boolean);

function getSortDate(p) {
    const folder = p.folder || '';
    const match = folder.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return "0000-00-00";
}

posts.sort((a, b) => getSortDate(b).localeCompare(getSortDate(a)));

// Generate a JS file instead of JSON to avoid fetch issues
const jsContent = `const postsData = ${JSON.stringify(posts, null, 2)};`;
fs.writeFileSync(path.join(__dirname, 'js', 'posts_data.js'), jsContent, 'utf8');
console.log('js/posts_data.js generated successfully!');
